import express, { type Request, type Response, type Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/dbConfig.js';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router: Router = express.Router();

// 템플릿 업로드용 multer 설정
const templateStorage = multer.diskStorage({
    destination: 'uploads/templates/',
    filename: (req, file, cb) => {
        // 한글 파일명 깨짐 방지
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const uniqueName = `${Date.now()}-${originalName}`;
        cb(null, uniqueName);
    }
});

const uploadTemplate = multer({ storage: templateStorage });

// 인터페이스 정의 (DB 결과 타입 지정)
interface DocumentTemplate extends RowDataPacket {
    id: number;
    tenant_id: number;
    name: string;
    template_file_path: string;
}

// 1. 템플릿 업로드
router.post('/templates', uploadTemplate.single('template'), async (req: Request, res: Response) => {
    try {
        const { tenant_id, name } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
        }

        const sql = 'INSERT INTO document_templates (tenant_id, name, template_file_path) VALUES (?, ?, ?)';
        const [result] = await pool.query<ResultSetHeader>(sql, [tenant_id, name, req.file.path]);
        
        res.json({ success: true, template_id: result.insertId });
    } catch (error) {
        console.error('템플릿 업로드 에러:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 2. 회사별 템플릿 조회
router.get('/templates/:tenant_id', async (req: Request, res: Response) => {
    try {
        const sql = 'SELECT * FROM document_templates WHERE tenant_id = ?';
        const [templates] = await pool.query<DocumentTemplate[]>(sql, [req.params['tenant_id']]);
        
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: '조회 중 오류 발생' });
    }
});

// 3. 템플릿 상세 조회 (엑셀 데이터 포함)
router.get('/template/view/:template_id', async (req: Request, res: Response) => {
    try {
        const sql = 'SELECT * FROM document_templates WHERE id = ?';
        const [rows] = await pool.query<DocumentTemplate[]>(sql, [req.params['template_id']]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다' });
        }
        
        const template = rows[0]!;
        
        // 엑셀 읽기
        const fileBuffer = await fs.readFile(template.template_file_path);
        const workbook = XLSX.read(fileBuffer);
        const sheetName = workbook.SheetNames[0]!;
        const sheet = workbook.Sheets[sheetName]!;
        
        // 데이터 추출
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        
        // 병합 셀 정보 추출
        const merges = sheet['!merges'] || [];
        const mergeCells = merges.map(m => ({
            row: m.s.r,
            col: m.s.c,
            rowspan: m.e.r - m.s.r + 1,
            colspan: m.e.c - m.s.c + 1
        }));
        
        res.json({
            templateName: template.name,
            data: data,
            mergeCells: mergeCells
        });
    } catch (error) {
        res.status(500).json({ error: '템플릿 분석 중 오류 발생' });
    }
});

// 4. 자동 채우기
router.post('/template/autofill/:template_id', uploadTemplate.single('userFile'), async (req: Request, res: Response) => {
    try {
        const sql = 'SELECT * FROM document_templates WHERE id = ?';
        const [rows] = await pool.query<DocumentTemplate[]>(sql, [req.params['template_id']]);
        
        if (rows.length === 0 || !req.file) {
            return res.status(404).json({ error: '템플릿 또는 업로드 파일을 찾을 수 없습니다' });
        }
        
        const template = rows[0]!;
        
        // 템플릿 및 사용자 파일 읽기
        const [templateBuffer, userBuffer] = await Promise.all([
            fs.readFile(template.template_file_path),
            fs.readFile(req.file.path)
        ]);

        const templateWorkbook = XLSX.read(templateBuffer);
        const templateSheet = templateWorkbook.Sheets[templateWorkbook.SheetNames[0]!]!;
        const templateData = XLSX.utils.sheet_to_json<any[]>(templateSheet, { header: 1, defval: '' });
        
        const userWorkbook = XLSX.read(userBuffer);
        const userSheet = userWorkbook.Sheets[userWorkbook.SheetNames[0]!]!;
        const userData = XLSX.utils.sheet_to_json<any[]>(userSheet, { header: 1, defval: '' });
        
        // 자동 채우기 로직 (기존 기능 유지)
        const result = templateData.map((row, rowIdx) => {
            return row.map((cell, colIdx) => {
                if (userData[rowIdx] && userData[rowIdx][colIdx]) {
                    return userData[rowIdx][colIdx];
                }
                return cell || '';
            });
        });
        
        const merges = templateSheet['!merges'] || [];
        const mergeCells = merges.map(m => ({
            row: m.s.r,
            col: m.s.c,
            rowspan: m.e.r - m.s.r + 1,
            colspan: m.e.c - m.s.c + 1
        }));
        
        // 임시 파일 삭제
        await fs.unlink(req.file.path);
        
        res.json({
            success: true,
            data: result,
            mergeCells: mergeCells
        });
    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        res.status(500).json({ error: '자동 채우기 처리 중 오류 발생' });
    }
});

export default router;