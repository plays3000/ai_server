import express, { type Request, type Response, type Router } from 'express';
import multer from 'multer';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/dbConfig.js';
import { model } from '../config/geminiConfig.js';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';

const router: Router = express.Router();

// 엑셀 템플릿 업로드 경로 설정
const upload = multer({ dest: 'uploads/templates/' });

// 1. 등록된 모든 엑셀 템플릿 목록 조회
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM excel_templates');
        res.json(rows);
    } catch (error) {
        console.error('템플릿 조회 실패:', error);
        res.status(500).json({ error: '데이터베이스 조회 중 오류 발생' });
    }
});

// 2. 새로운 엑셀 템플릿 업로드
router.post('/upload-template', upload.single('template'), async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });

        const { originalname, path: filePath } = req.file;
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO excel_templates (name, file_path) VALUES (?, ?)',
            [originalname, filePath]
        );

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('템플릿 업로드 실패:', error);
        res.status(500).json({ error: '템플릿 저장 중 오류 발생' });
    }
});

// 3. AI 분석 기반 보고서 생성 (핵심 로직)
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { templateId, data } = req.body; // data는 AI가 분석할 원문 텍스트

        // 템플릿 파일 경로 조회
        const [templates] = await pool.query<RowDataPacket[]>(
            'SELECT file_path FROM excel_templates WHERE id = ?',
            [templateId]
        );

        if (templates.length === 0) return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        const filePath = (templates[0] as { file_path: string }).file_path;

        // 엑셀 파일 읽기 및 구조 분석
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName!];
        const templateStructure = xlsx.utils.sheet_to_json(sheet!);

        // Gemini AI에게 데이터 추출 요청
        const prompt = `
            다음 엑셀 템플릿 구조에 맞춰서 데이터를 추출해줘:
            구조: ${JSON.stringify(templateStructure)}
            원문 데이터: ${data}
            결과는 반드시 JSON 형식으로만 응답해줘.
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();
        const extractedData = JSON.parse(aiResponse.replace(/```json|```/g, ''));

        // 추출된 데이터를 새 엑셀 파일로 생성
        const newSheet = xlsx.utils.json_to_sheet(extractedData);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Report');

        const outputFileName = `report_${Date.now()}.xlsx`;
        const outputPath = path.join('uploads', outputFileName);
        xlsx.writeFile(newWorkbook, outputPath);

        res.json({ success: true, downloadUrl: `/uploads/${outputFileName}` });

    } catch (error) {
        console.error('보고서 생성 실패:', error);
        res.status(500).json({ error: '보고서 생성 중 오류 발생' });
    }
});

export default router;