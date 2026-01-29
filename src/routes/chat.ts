import express, { type Request, type Response, type Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { pool } from '../config/dbConfig.js';
import { model } from '../config/geminiConfig.js';

const router: Router = express.Router();

// 채팅 전용 업로드 설정
const upload = multer({ dest: 'uploads/' });

// AI 채팅 및 파일 분석 엔드포인트
router.post('/', upload.fields([
    { name: 'pdfFile', maxCount: 10 },
    { name: 'images', maxCount: 10 }
]), async (req: Request, res: Response) => {
    try {
        const { title, detail } = req.body;
        const userMessage = `${title}\n${detail || ''}`;
        const chatInputs: any[] = [{ text: userMessage }];

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // 파일 처리 내부 헬퍼 함수
        const processFiles = (fileArray: Express.Multer.File[] | undefined, defaultMime: string) => {
            if (!fileArray) return;
            fileArray.forEach(file => {
                chatInputs.push({
                    inlineData: {
                        data: fs.readFileSync(file.path).toString("base64"),
                        mimeType: file.mimetype || defaultMime 
                    }
                });
                fs.unlinkSync(file.path); // 처리 후 임시 파일 삭제
            });
        };

        processFiles(files['pdfFile'], "application/pdf");
        processFiles(files['images'], "image/jpeg");

        // Gemini AI 생성 요청
        const result = await model.generateContent(chatInputs);
        const reply = result.response.text();

        // 대화 내역 DB 저장
        await pool.query(
            'INSERT INTO chat_history (user_msg, ai_reply) VALUES (?, ?)', 
            [userMessage, reply]
        );

        res.json({ reply });

    } catch (error) {
        console.error("채팅 분석 실패:", error);
        res.status(500).json({ error: "파일 분석 중 오류가 발생했습니다." });
    }
});

export default router;