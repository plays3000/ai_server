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
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { genAI, generationConfig } from '../config/geminiConfig.js';

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
router.post('/chat', isAuthenticated, upload.array('mediaFile', configs.maxCount * 4), async (req: Request, res: Response) => {
    const user = req.user as any; 

    if (!user) {
        return res.status(401).json({ success: false, message: '세션이 만료되었습니다.' });
    }
    
    const { message } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        // [추가] 로그인한 사용자의 정보를 시스템 지침에 녹여냅니다.
        const dynamicInstruction = `
            당신은 ${user.company_name || '회사'}의 전용 업무 비서입니다.
            현재 대화 중인 사용자: ${user.name} (${user.rank_name || user.position || '사원'})
            
            사용자가 "나에 대해 설명해줘"라고 하면 "네, ${user.name}님"이라며 위 정보를 알려주세요.
            모든 대답은 정중한 비즈니스 톤으로 합니다.
        `;

        // [수정] genAI를 사용하여 사용자 맞춤형 모델 인스턴스를 생성합니다.
        // (참고: gemini-2.5-flash는 현재 유효하지 않을 수 있으니 설정 파일과 동일하게 1.5-flash 권장)
        const customModel = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: dynamicInstruction,
            generationConfig // 기존 geminiConfig의 설정을 그대로 따릅니다.
        });

        // 1. 입력 데이터 준비 (기존 코드 유지)
        const { chatInputs, fileContext } = await prepareChatInputs(message, files);
        if (chatInputs.length === 0) return res.status(400).json({ reply: "내용이 없습니다." });

        // 2. 의도 파악
        const intent = await classifyIntent(message);

        // 3. 일반 채팅 분기
        if (intent !== 'REPORT') {
            // [수정] 위에서 만든 customModel을 사용합니다.
            const result = await customModel.generateContent(chatInputs);
            const reply = result.response.text();
            
            await pool.query(
                'INSERT INTO chat_history (user_id, company_id, user_msg, ai_reply) VALUES (?, ?, ?, ?)', 
                [user.id, user.company_id, message || "파일", reply]
            );
            cleanupFiles(files);
            return res.json({ reply, downloadUrl: null });
        }

        // 4. REPORT 모드 (기존 코드 유지)
        const [templates] = await pool.query<TemplateRow[]>(
            `SELECT * FROM document_templates WHERE name LIKE ? AND company_id = ? AND is_active = 1 ORDER BY version DESC LIMIT 1`, 
            ['%일일업무보고서%', user.company_id]
        );

        if (templates.length > 0) {
            const template = templates[0]!;
            const schema = typeof template.schema_def === 'string' ? JSON.parse(template.schema_def) : template.schema_def;
            
            const extractionPrompt = `[목표]: JSON 추출\n[메시지]: "${message}"\n[데이터]: ${fileContext}\n[Schema]: ${JSON.stringify(schema.mappings)}`;
            
            // 추출 시에도 customModel을 사용하면 더 일관성 있는 답변이 나옵니다.
            const extractResult = await customModel.generateContent(extractionPrompt);
            const extractedData = JSON.parse(extractResult.response.text().replace(/```json|```/g, '').trim() || "{}");

            const { downloadUrl } = await generateExcelReport(template, extractedData, user);
            const aiReply = "업무보고서를 생성했습니다.";

            await pool.query('INSERT INTO chat_history (user_id, company_id, user_msg, ai_reply) VALUES (?, ?, ?, ?)', [user.id, user.company_id, message, aiReply]);
            cleanupFiles(files);
            return res.json({ reply: aiReply, downloadUrl });
        }

        cleanupFiles(files);
        const finalResult = await customModel.generateContent(chatInputs);
        res.json({ reply: finalResult.response.text() });

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