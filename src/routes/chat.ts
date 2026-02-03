import express, { type Request, type Response, type Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import ExcelJS from 'exceljs';
import path from 'path';
import { pool } from '../config/dbConfig.js';
import { model, chatbot } from '../config/geminiConfig.js';
import { type RowDataPacket } from 'mysql2';
import {fileToGenerativePart} from '../client/readFiles.js';
import configs from '../../config.json' with { type: "json" };

// [Interface] 
interface TemplateRow extends RowDataPacket {
    file_path: string;
    schema_def: any;
    name: string;
}

const router: Router = express.Router();

const uploadDir = 'uploads/';
const generatedDir = 'uploads/generated/';

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

const upload = multer({ dest: uploadDir });

const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

// [Helper] 엑셀 스타일 참고용 데이터 추출
async function extractSheetData(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) return "";
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.worksheets[0];
    let content = "";
    if (sheet) {
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber > 30) return; 
            row.eachCell((cell, colNumber) => {
                if (cell.value) content += `[${cell.address}]: ${cell.value}, `;
            });
            content += "\n";
        });
    }
    return content;
}

// [Helper] 재시도 로직 (429 에러 방지)
async function generateWithRetry(prompt: string, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent([{ text: prompt }]);
        } catch (error: any) {
            if (error.status === 429 && i < retries - 1) {
                console.warn(`⚠️ 429 Too Many Requests. ${delay/1000}초 후 재시도...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; 
            } else {
                throw error;
            }
        }
    }
}

// 파일 삭제 공통 함수
function cleanupFiles(files: Express.Multer.File[]) {
    files?.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
}

// 엑셀/이미지/PDF를 Gemini용 입력 데이터로 변환
async function prepareChatInputs(message: string, files: Express.Multer.File[]) {
    const chatInputs: any[] = [];
    let fileContext = "";

    if (message) chatInputs.push(message);

    for (const file of files) {
        const mimeType = file.mimetype;
        if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
            chatInputs.push(fileToGenerativePart(file.path, mimeType));
        } 
        else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const result = await extractSheetData(file.path);
            if (result) {
                const info = `\n[참고 파일(${file.originalname}) 분석]:\n${result}\n`;
                fileContext += info;
                chatInputs.push(info);
            }
        }
    }
    return { chatInputs, fileContext };
}

// Step 1: 사용자 의도 파악
async function classifyIntent(message: string): Promise<string> {
    const prompt = `사용자 메시지를 분석해 'REPORT' 또는 'CHAT' 중 하나만 출력해: "${message}"`;
    const result = await generateWithRetry(prompt);
    return result?.response.text().trim().toUpperCase() || 'CHAT';
}

// Step 2: 엑셀 보고서 생성 핵심 로직
async function generateExcelReport(template: TemplateRow, extractedData: any, user: any) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(template.file_path);
    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

    if (!worksheet) throw new Error("유효한 워크시트가 없습니다.");

    const schema = typeof template.schema_def === 'string' ? JSON.parse(template.schema_def) : template.schema_def;
    const mappingList = schema.mappings || [];

    mappingList.forEach((map: any) => {
        if (extractedData[map.key]) {
            const cell = worksheet.getCell(map.cell);
            cell.value = extractedData[map.key];
            cell.alignment = { wrapText: true, vertical: 'middle' };
        }
    });

    const fileName = `${getTodayString()}_${user.name}_보고서.xlsx`;
    const savePath = path.join(generatedDir, fileName);
    await workbook.xlsx.writeFile(savePath);

    return { fileName, downloadUrl: `/chat/download/generated/${encodeURIComponent(fileName)}` };
}

//메인 채팅 라우트
router.post('/chat', upload.array('mediaFile', configs.maxCount * 4), async (req: Request, res: Response) => {
    const user = { id: 1, name: "김AI", dept: "개발팀", position: "대리" };
    const { message } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        // 1. 입력 데이터 및 컨텍스트 준비
        const { chatInputs, fileContext } = await prepareChatInputs(message, files);
        if (chatInputs.length === 0) return res.status(400).json({ reply: "내용이 없습니다." });

        // 2. 의도 파악
        const intent = await classifyIntent(message);

        // 3. 분기 처리
        if (intent !== 'REPORT') {
            const result = await model.generateContent(chatInputs);
            const reply = result.response.text();
            await pool.query('INSERT INTO chat_history (user_id, user_msg, ai_reply) VALUES (?, ?, ?)', [user.id, message || "파일", reply]);
            cleanupFiles(files);
            return res.json({ reply, downloadUrl: null });
        }

        // 4. REPORT 모드: 템플릿 조회 및 데이터 추출
        const [templates] = await pool.query<TemplateRow[]>(
            `SELECT * FROM document_templates WHERE name LIKE ? AND is_active = 1 ORDER BY version DESC LIMIT 1`, 
            ['%일일업무보고서%']
        );

        if (templates.length > 0) {
            const template = templates[0]!;
            const schema = typeof template.schema_def === 'string' ? JSON.parse(template.schema_def) : template.schema_def;
            
            const extractionPrompt = `[목표]: JSON 추출\n[메시지]: "${message}"\n[데이터]: ${fileContext}\n[Schema]: ${JSON.stringify(schema.mappings)}`;
            const extractResult = await generateWithRetry(extractionPrompt);
            const extractedData = JSON.parse(extractResult?.response.text().replace(/```json|```/g, '').trim() || "{}");

            // 5. 파일 생성
            const { downloadUrl } = await generateExcelReport(template, extractedData, user);
            const aiReply = "업무보고서를 생성했습니다.";

            await pool.query('INSERT INTO chat_history (user_id, user_msg, ai_reply) VALUES (?, ?, ?)', [user.id, message, aiReply]);
            cleanupFiles(files);
            return res.json({ reply: aiReply, downloadUrl });
        }

        // 템플릿 없을 시 기본 응답
        cleanupFiles(files);
        res.json({ reply: (await model.generateContent(chatInputs)).response.text() });

    } catch (error) {
        cleanupFiles(files);
        console.error("Critical Error:", error);
        res.status(500).json({ error: "처리 중 오류 발생" });
    }
});


router.get('/download/generated/:fileName', (req, res) => {
    const filePath = path.join(generatedDir, decodeURIComponent(req.params.fileName));
    if (fs.existsSync(filePath)) res.download(filePath);
    else res.status(404).send("파일 없음");
});

export default router;