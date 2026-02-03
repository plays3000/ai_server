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

async function fileAnalysis(message: any, chatInputs: any[], files: Express.Multer.File[], req: any, res: any){
    try {
        // 1. 텍스트 메시지 추가
        if (message) {
            chatInputs.push(message);
        }

        // 2. 여러 파일 처리 (req.files 사용)
        files.forEach(file => {
                const mimeType = file.mimetype;
                // 이미지 또는 PDF만 필터링하여 추가
                if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
                    const mediaPart = fileToGenerativePart(file.path, mimeType);
                    chatInputs.push(mediaPart);
                }
            });

        if (chatInputs.length === 0) {
             return res.status(400).json({ reply: "분석할 내용이 없습니다." });
        }

        // 3. Gemini API 호출
        const result = await model.generateContent(chatInputs);
        const reply = result.response.text();

        // 파일 삭제는 API 호출 성공 후에 수행
        if (files && files.length > 0) {
            files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }

        // ... 나머지 DB 저장 및 응답 로직
        const sql = 'INSERT INTO chat_history (user_msg, ai_reply) VALUES (?, ?)';
        // const logMsg = message || (files ? `[파일: ${req.file.originalname}]` : "데이터 없음");
        const logMsg = message || (files ? `[파일: ${req.file.originalname}]` : "데이터 없음");
        await pool.query(sql, [logMsg, reply]);

        res.json({ reply: reply });

    } 
    
    catch (error) {
        // 에러 발생 시에도 파일이 남아있다면 삭제
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error("비서 서비스 에러:", error);
        res.status(500).json({ error: "분석 중 오류 발생" });
    }
};

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

// [Interface] 
interface TemplateRow extends RowDataPacket {
    file_path: string;
    schema_def: any;
    name: string;
}

//메인 채팅 라우트
router.post('/', upload.array('mediaFile', configs.maxCount * 4), async (req: Request, res: Response) => {
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
// router.post('/', upload.array('mediaFile', configs.maxCount * 4), async (req, res) => {
//     try {
//         const files = req.files as Express.Multer.File[]; 
//         const { message } = req.body;
//         const chatInputs = [];

//         // 1. 텍스트 메시지 추가
//         if (message) {
//             chatInputs.push(message);
//         }

//         // 2. 여러 파일 처리 (req.files 사용)
//         if (files && files.length > 0) {
//             // forEach 대신 for...of를 사용하여 await이 정상 작동하게 합니다.
//             for (const file of files) {
//                 const mimeType = file.mimetype;

//                 // 1. 이미지 또는 PDF 처리
//                 if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
//                     const mediaPart = fileToGenerativePart(file.path, mimeType);
//                     chatInputs.push(mediaPart);
//                 } 
//                 // 2. 엑셀 파일 처리
//                 else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
//                     try {
//                         // await이 순차적으로 기다려줍니다.
//                         const result = await extractSheetData(file.path);
                        
//                         if (result) {
//                             // 추출된 텍스트 데이터를 AI가 볼 수 있게 문자열로 추가합니다.
//                             chatInputs.push(`[엑셀 파일(${file.originalname}) 분석 내용]:\n${result}`);
//                             console.log(`✅ ${file.originalname} 데이터 추출 성공`);
//                         }
//                     } catch (err) {
//                         console.error(`❌ ${file.originalname} 추출 중 오류:`, err);
//                     }
//                 }
//             }
//         }

//         if (chatInputs.length === 0) {
//              return res.status(400).json({ reply: "분석할 내용이 없습니다." });
//         }

//         // 3. Gemini API 호출
//         const result = await model.generateContent(chatInputs);
//         const reply = result.response.text();

//         // 파일 삭제는 API 호출 성공 후에 수행
//         if (files && files.length > 0) {
//             files.forEach(file => {
//                 if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//             });
//         }

//         // ... 나머지 DB 저장 및 응답 로직
//         const sql = 'INSERT INTO chat_history (user_msg, ai_reply) VALUES (?, ?)';
//         const logMsg = message || (req.file ? `[파일: ${req.file.originalname}]` : "데이터 없음");
//         await pool.query(sql, [logMsg, reply]);

//         res.json({ reply: reply });

//     } catch (error) {
//         // 에러 발생 시에도 파일이 남아있다면 삭제
//         if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
//         console.error("비서 서비스 에러:", error);
//         res.status(500).json({ error: "분석 중 오류 발생" });
//     }
// });

// router.post('/', upload.fields([
//     { name: 'pdfFile', maxCount: 5 },
//     { name: 'images', maxCount: 5 },
//     { name: 'excel', maxCount: 10 }
// ]), async (req: Request, res: Response) => {
    
//     const user = { id: 1, name: "김AI", dept: "개발팀", position: "대리" };

//     try {
//         const message: string = req.body;
//         const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

//         console.log(`\n💬 사용자 메시지: "${message}"`);

//         // ---------------------------------------------------------
//         // [Step 1] 의도 파악 (Router)
//         // 사용자가 '보고서 작성'을 원하는지, 그냥 '대화'를 원하는지 판단
//         // ---------------------------------------------------------
//         const routerPrompt = `
//             사용자의 메시지를 분석해서 다음 두 가지 의도 중 하나로 분류해줘.
//             답변은 오직 'REPORT' 또는 'CHAT' 단어 하나만 출력해.
            
//             1. REPORT: 보고서, 엑셀, 문서 작성, 파일 생성, 정리해줘, 양식에 맞춰줘 등의 요청이 포함된 경우.
//             2. CHAT: 단순 질문, 인사, 정보 검색, 요약 요청 등 파일을 만들 필요가 없는 경우.

//             [사용자 메시지]: "${message}"
//         `;

//         const routerResult = await generateWithRetry(routerPrompt);
//         const intent = routerResult?.response.text().trim().toUpperCase();
        
//         console.log(`🧭 AI의 판단: ${intent} 모드로 진입합니다.`);

//         // ---------------------------------------------------------
//         // [Step 2-A] 일반 대화 모드 (CHAT)
//         // ---------------------------------------------------------
//         if (intent !== 'REPORT') {
//             // 참고 파일이 있다면 내용을 읽어서 문맥에 포함
//             let context: string = "";
//             if (files && files['excel']) {
//                 for (const f of files['excel']) {
//                     context += `\n[참고 파일 내용]:\n${await extractSheetData(f.path)}\n`;
//                     fs.unlinkSync(f.path); // 사용 후 삭제
//                 }
//             }

//             const chatPrompt = `
//                 너는 유능한 AI 비서야. 사용자에게 친절하게 대답해줘.
//                 [사용자]: ${message}
//                 ${context ? `[참고 자료]: ${context}` : ""}
//             `;

//             const chatRes = await generateWithRetry(chatPrompt);
//             const reply = chatRes?.response.text() || "죄송합니다. 답변을 생성하지 못했습니다.";

//             // 대화 이력 저장
//             await pool.query('INSERT INTO chat_history (user_id, company_id, user_msg, ai_reply) VALUES (?, ?, ?, ?)', [user.id, 1, message, reply]);
            
//             return res.json({ reply: reply, downloadUrl: null });
//         }


//         // ---------------------------------------------------------
//         // [Step 2-B] 보고서 생성 모드 (REPORT)
//         // ---------------------------------------------------------
        
//         // 1. 파일 내용 분석 (Context 생성)
//         let fileContext = "";
//         if (files && files['excel']) {
//             for (const excelFile of files['excel']) {
//                 fileContext += `\n[참고 파일(${excelFile.originalname})]:\n${await extractSheetData(excelFile.path)}\n`;
//                 if (fs.existsSync(excelFile.path)) fs.unlinkSync(excelFile.path);
//             }
//         }

//         // 2. 템플릿 로드 (일일업무보고서)
//         const targetTemplateName = '일일업무보고서';
//         const [templates] = await pool.query<TemplateRow[]>(
//             `SELECT file_path, schema_def, name FROM templates WHERE name LIKE ? AND is_active = 1 ORDER BY version DESC LIMIT 1`, 
//             [`%${targetTemplateName}%`]
//         );

//         let downloadUrl: string | null = null;
//         let aiReply = "";

//         if (templates.length > 0) {
//             const template = templates[0]!;
//             const schema = typeof template.schema_def === 'string' ? JSON.parse(template.schema_def) : template.schema_def;
//             const mappingList = schema.mappings || [];

//             // 3. 스타일 샘플 로딩
//             let sampleStyleContext = "";
//             if (schema.sample_files && schema.sample_files.length > 0) {
//                 const samplePath = schema.sample_files[0];
//                 const sampleContent = await extractSheetData(samplePath);
//                 if (sampleContent) {
//                     sampleStyleContext = `[회사 스타일 가이드]:\n이 샘플의 말투와 형식을 흉내내.\n${sampleContent}`;
//                 }
//             }

//             // 4. 데이터 추출 프롬프트
//             const extractionPrompt = `
//                 [목표]: 사용자 메시지와 파일을 분석해 JSON 데이터를 추출해.
//                 [사용자 메시지]: "${message}"
//                 [참고 파일]: ${fileContext}
//                 [작성자]: ${user.name} (${user.dept}/${user.position})
//                 ${sampleStyleContext}

//                 [추출 Schema]: ${JSON.stringify(mappingList.map((m: any) => ({ key: m.key, desc: m.desc })))}

//                 [규칙]:
//                 1. 업무 내용은 '1. 2. 3.' 번호 매기기 필수.
//                 2. 개조식(~함, ~완료) 사용.
//                 3. 결과는 오직 JSON 객체만 출력.
//             `;

//             const result = await generateWithRetry(extractionPrompt);
//             const responseText = result?.response.text().replace(/```json|```/g, '').trim();
            
//             let extractedData: any = {};
//             try {
//                 // 짤린 JSON 복구 시도
//                 try {
//                     extractedData = JSON.parse(responseText || "{}");
//                 } catch {
//                     const lastBrace = responseText!.lastIndexOf('},');
//                     if (lastBrace !== -1) extractedData = JSON.parse(responseText!.substring(0, lastBrace + 1) + ']');
//                     else throw new Error("JSON 파싱 불가");
//                 }
                
//                 console.log("✅ 데이터 추출 성공");

//                 // 5. 엑셀 생성
//                 if (fs.existsSync(template.file_path)) {
//                     const workbook = new ExcelJS.Workbook();
//                     await workbook.xlsx.readFile(template.file_path);
//                     const worksheet = workbook.worksheets[0];

//                     if (worksheet) {
//                         mappingList.forEach((map: any) => {
//                             if (extractedData[map.key]) {
//                                 const cell = worksheet.getCell(map.cell);
//                                 cell.value = extractedData[map.key];
//                                 cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };
//                             }
//                         });

//                         const safeFileName = `${getTodayString()}_${user.dept}_${targetTemplateName}_${user.name}.xlsx`;
//                         const savePath = path.join(generatedDir, safeFileName);
//                         await workbook.xlsx.writeFile(savePath);

//                         downloadUrl = `/chat/download/generated/${encodeURIComponent(safeFileName)}`;
//                         aiReply = "요청하신 내용을 바탕으로 <strong>일일업무보고서</strong>를 생성했습니다. (스타일 적용됨)";
//                     }
//                 }
//             } catch (e) {
//                 console.error("생성 실패:", e);
//                 aiReply = "보고서 데이터를 생성하는 도중 오류가 발생했습니다. 다시 시도해주세요.";
//             }
//         } else {
//             // 템플릿이 없으면 그냥 대화로 응답
//             aiReply = "등록된 보고서 양식을 찾을 수 없어 일반 답변을 드립니다.\n" + message;
//         }

//         await pool.query('INSERT INTO chat_history (user_id, company_id, user_msg, ai_reply) VALUES (?, ?, ?, ?)', [user.id, 1, message, aiReply]);
//         return res.json({ reply: aiReply, downloadUrl: downloadUrl });

//     } catch (error) {
//         console.error("❌ 서버 오류:", error);
//         res.status(500).json({ error: "처리 중 오류 발생" });
//     }
// });

router.get('/download/generated/:fileName', (req, res) => {
    const filePath = path.join(generatedDir, decodeURIComponent(req.params.fileName));
    if (fs.existsSync(filePath)) res.download(filePath);
    else res.status(404).send("파일 없음");
});

export default router;