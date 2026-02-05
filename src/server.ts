import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import multer from 'multer';
import fs from 'fs';

// 설정 및 인증 모듈 임포트
import { connectToDatabase } from './config/dbConfig.js';
import session from 'express-session';
import passport from './config/passportConfig.js';
import { model } from './config/geminiConfig.js';
import { pool } from './config/dbConfig.js';

// 분리된 라우터 및 함수 임포트
import authRouter from './routes/auth.js';
import excelRouter from './routes/excel.js';
import { fileToGenerativePart } from './client/readFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const upload = multer({ dest: 'uploads/' });

// 데이터베이스 연결 실행
connectToDatabase();

// 뷰 엔진 및 경로 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 기본 미들웨어 설정
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 세션 설정 (HTTP 접속을 위해 secure: false로 변경)
app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // HTTP 접속 시 true로 하면 세션이 작동하지 않습니다.
        httpOnly: true 
    } 
}));

app.use(passport.initialize());
app.use(passport.session());

// 라우터 연결
app.use('/auth', authRouter);
app.use('/excel', excelRouter);

// 메인 페이지 렌더링
app.get('/', (req: Request, res: Response) => {
    res.render('chatbot');
});

// 채팅 로직
app.post('/chat', upload.array('mediaFile', 10), async (req, res) => {
    try {
        const files = req.files as Express.Multer.File[]; 
        const { message } = req.body;
        const chatInputs: any[] = [];

        if (message) chatInputs.push(message);

        if (files && files.length > 0) {
            files.forEach(file => {
                const mimeType = file.mimetype;
                if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
                    const mediaPart = fileToGenerativePart(file.path, mimeType);
                    chatInputs.push(mediaPart);
                }
            });
        }

        if (chatInputs.length === 0) {
             return res.status(400).json({ reply: "분석할 내용이 없습니다." });
        }

        const result = await model.generateContent(chatInputs);
        const reply = result.response.text();

        if (files && files.length > 0) {
            files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }

        const sql = 'INSERT INTO chat_history (user_msg, ai_reply) VALUES (?, ?)';
        const logMsg = message || (files.length > 0 ? `[파일 있음]` : "데이터 없음");
        await pool.query(sql, [logMsg, reply]);

        res.json({ reply: reply });

    } catch (error) {
        console.error("비서 서비스 에러:", error);
        res.status(500).json({ error: "분석 중 오류 발생" });
    }
});

// 에러 핸들러
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
});

// --- [핵심] 모든 내부 IP에서 접속 가능하도록 설정 ---
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}`);
    console.log(`📢 다른 기기 접속: http://[서버컴퓨터의_내부IP]:${port}`);
});