import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/dbConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// 템플릿 업로드용 multer 설정
const templateStorage = multer.diskStorage({
    destination: 'uploads/templates/',
    filename: (req, file, cb) => {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const uniqueName = Date.now() + '-' + originalName;
        cb(null, uniqueName);
    }
});

const uploadTemplate = multer({ storage: templateStorage });

// 템플릿 업로드
router.post('/templates', uploadTemplate.single('template'), async (req, res) => {
    const { tenant_id, name } = req.body;
    
    const sql = 'INSERT INTO document_templates (tenant_id, name, template_file_path) VALUES (?, ?, ?)';
    const [result] = await pool.query(sql, [tenant_id, name, req.file.path]);
    
    res.json({ success: true, template_id: result.insertId });
});

// 회사별 템플릿 조회
router.get('/templates/:tenant_id', async (req, res) => {
    const sql = 'SELECT * FROM document_templates WHERE tenant_id = ?';
    const [templates] = await pool.query(sql, [req.params.tenant_id]);
    
    res.json(templates);
});

// 템플릿 상세 조회 (엑셀 데이터 포함)
router.get('/template/view/:template_id', async (req, res) => {
    const sql = 'SELECT * FROM document_templates WHERE id = ?';
    const [rows] = await pool.query(sql, [req.params.template_id]);
    
    if (rows.length === 0) {
        return res.status(404).json({ error: '템플릿을 찾을 수 없습니다' });
    }
    
    const template = rows[0];
    
    // 엑셀 읽기
    const fileBuffer = await fs.readFile(template.template_file_path);
    const workbook = XLSX.read(fileBuffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
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
});

// 자동 채우기
router.post('/template/autofill/:template_id', uploadTemplate.single('userFile'), async (req, res) => {
    const sql = 'SELECT * FROM document_templates WHERE id = ?';
    const [rows] = await pool.query(sql, [req.params.template_id]);
    
    if (rows.length === 0) {
        return res.status(404).json({ error: '템플릿을 찾을 수 없습니다' });
    }
    
    const template = rows[0];
    
    // 템플릿 읽기
    const templateBuffer = await fs.readFile(template.template_file_path);
    const templateWorkbook = XLSX.read(templateBuffer);
    const templateSheet = templateWorkbook.Sheets[templateWorkbook.SheetNames[0]];
    const templateData = XLSX.utils.sheet_to_json(templateSheet, { header: 1, defval: '' });
    
    const merges = templateSheet['!merges'] || [];
    const mergeCells = merges.map(m => ({
        row: m.s.r,
        col: m.s.c,
        rowspan: m.e.r - m.s.r + 1,
        colspan: m.e.c - m.s.c + 1
    }));
    
    // 사용자 파일 읽기
    const userBuffer = await fs.readFile(req.file.path);
    const userWorkbook = XLSX.read(userBuffer);
    const userSheet = userWorkbook.Sheets[userWorkbook.SheetNames[0]];
    const userData = XLSX.utils.sheet_to_json(userSheet, { header: 1, defval: '' });
    
    // 자동 채우기
    const result = templateData.map((row, rowIdx) => {
        return row.map((cell, colIdx) => {
            if (userData[rowIdx] && userData[rowIdx][colIdx]) {
                return userData[rowIdx][colIdx];
            }
            return cell || '';
        });
    });
    
    // 임시 파일 삭제
    await fs.unlink(req.file.path);
    
    res.json({
        success: true,
        data: result,
        mergeCells: mergeCells
    });
});

export default router;