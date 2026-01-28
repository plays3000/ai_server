import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import 'dotenv/config';
import { pool, connectToDatabase } from './config/dbConfig.js';
import { model } from './config/geminiConfig.js';
import excelRouter from './routes/excel.js';
import authRouter from './dist/routes/auth.js';
import session from 'express-session';
import passport from './dist/config/passportConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// 업로드 폴더가 없으면 생성
if (!fs.existsSync('uploads/')) {
    fs.mkdirSync('uploads/');
}

const upload = multer({ dest: 'uploads/' });

connectToDatabase();

app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/node_modules")));

app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // HTTPS 사용시 true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/excel', excelRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/test-auth.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'test-auth.html'));
});

// ✅ 두 개의 /chat 라우트를 하나로 통합했습니다.
app.post('/chat', upload.single('pdfFile'), async (req, res) => {
    try {
        // 프론트엔드에서 보낸 title과 detail을 합쳐서 프롬프트를 만듭니다.
        const { title, detail } = req.body;
        
        // title이 없으면 detail이나 message 등 다른 필드 확인 (안전장치)
        const userMessage = title ? `${title}\n${detail || ''}` : req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: "입력된 메시지가 없습니다." });
        }

        // Gemini에게 보낼 데이터 배열 구성
        const chatInputs = [{ text: userMessage }];

        // 1. 파일이 업로드된 경우 PDF 데이터 추가
        if (req.file) {
            const pdfData = {
                inlineData: {
                    data: fs.readFileSync(req.file.path).toString("base64"),
                    mimeType: "application/pdf",
                },
            };
            chatInputs.push(pdfData);

            // 파일 처리 후 즉시 삭제
            fs.unlinkSync(req.file.path);
        }

        // 2. Gemini 답변 생성 (generateContent 사용)
        // [중요] chatInputs는 [{text: '...'}, {inlineData: '...'}] 형태여야 합니다.
        const result = await model.generateContent(chatInputs);
        const reply = result.response.text();

        // 3. MySQL에 기록 저장
        const sql = 'INSERT INTO chat_history (user_msg, ai_reply) VALUES (?, ?)';
        try {
            await pool.query(sql, [userMessage, reply]);
            console.log('DB 저장이 완료되었습니다.')
        } catch (dbError) {
            console.error("DB 저장 에러:", dbError.message);
        }

        // 4. 최종 응답 전송
        res.json({ reply: reply });

    } catch (error) {
        console.error("에러 상세:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "분석 중 오류 발생", message: error.message });
        }
    }
});

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});

// import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import multer from 'multer';
// import fs from 'fs';
// import 'dotenv/config';
// import { pool, connectToDatabase } from './config/dbConfig.js'; // pool을 가져옵/니다.
// import { model } from './config/geminiConfig.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const port = 3000;

// const upload = multer({ dest: 'uploads/' }); // 파일이 임시 저장될 폴더

// // DB 연결 테스트
// connectToDatabase();

// app.use(express.json());
// app.use(express.static(path.join(__dirname, "/public")));
// app.use(express.static(path.join(__dirname, "/node_modules")));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });

// app.post('/chat', upload.single('pdfFile'), async (req, res) => {
//     try {
//         const { message } = req.body;
//         const chatInputs = [message]; // 기본적으로 메시지 포함

//         // ✅ 파일이 업로드된 경우에만 PDF 로직 추가
//         if (req.file) {
//             const pdfData = {
//                 inlineData: {
//                     data: fs.readFileSync(req.file.path).toString("base64"),
//                     mimeType: "application/pdf",
//                 },
//             };
//             chatInputs.push(pdfData);

//             // 분석 후 임시 파일 삭제 (용량 관리)
//             fs.unlinkSync(req.file.path);
//         }

//         const result = await model.generateContent(chatInputs);
//         res.json({ reply: result.response.text() });

//     } catch (error) {
//         console.error("에러:", error);
//         res.status(500).json({ error: "분석 중 오류 발생" });
//     }
// });

// app.post('/chat', async (req, res) => {
//   try {
//     const { message } = req.body;
    
//     // 1. Gemini 답변 생성
//     const chatSession = model.startChat({ history: [] });
//     const result = await chatSession.sendMessage(message);
//     const reply = result.response.text();

//     // 2. MySQL에 데이터 저장 (await를 사용하여 저장이 끝날 때까지 기다리거나 예외처리)
//     const sql = 'INSERT INTO chat_history (user_msg, ai_reply) VALUES (?, ?)';
//     try {
//       await pool.query(sql, [message, reply]);
//     } catch (dbError) {
//       console.error("DB 저장 중 에러 발생:", dbError.message);
//       // DB 저장에 실패해도 AI 답변은 보내주고 싶다면 여기서 멈추지 않습니다.
//     }

//     // 3. 최종 응답 전송
//     res.json({ reply: reply });

//   } catch (error) {
//     console.error("AI 요청 에러:", error);
//     if (!res.headersSent) {
//       res.status(500).json({ error: "Gemini 서버 응답 실패" });
//     }
//   }
// });

// app.listen(port, () => {
//   console.log(`서버 실행 중: http://localhost:${port}`);
// });