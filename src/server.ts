import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import multer from 'multer'; // multer 임포트 확인
import fs from 'fs'; // fs 임포트 확인

// 설정 및 인증 모듈 임포트
import { connectToDatabase } from './config/dbConfig.js';
import session from 'express-session';
import passport from './config/passportConfig.js';
import {model} from './config/geminiConfig.js'
import {pool} from './config/dbConfig.js';

// 분리된 라우터 임포트
import authRouter from './routes/auth.js';
import excelRouter from './routes/excel.js';
import chatRouter from './routes/chat.js';
import {fileToGenerativePart} from './client/chatbot/readFiles.js'


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

// 세션 및 패스포트 인증 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

app.use(passport.initialize());
app.use(passport.session());

// 라우터 연결 (관심사 분리)
app.use('/auth', authRouter);
app.use('/excel', excelRouter);
// app.use('/chat', chatRouter);

// 메인 페이지 렌더링
app.get('/', (req: Request, res: Response) => {
    res.render('chatbot');
});

// Dynamic content routes
app.get('/content/chat', (req: Request, res: Response) => {
    res.render('components/chat-area');
});

app.get('/login', (req: Request, res: Response) => {
    res.render('screens/login');
});

app.get('/signup', (req: Request, res: Response) => {
    res.render('screens/signup');
});

app.get('/board', (req: Request, res: Response) => {
    res.render('screens/report-board');
});

app.post('/chat', upload.array('mediaFile', 10), async (req, res) => {
    try {
        const files = req.files as Express.Multer.File[]; 

        const { message } = req.body;
        const chatInputs = [];

        // 1. 텍스트 메시지 추가
        if (message) {
            chatInputs.push(message);
        }

        // 2. 여러 파일 처리 (req.files 사용)
        if (files && files.length > 0) {
            files.forEach(file => {
                const mimeType = file.mimetype;
                // 이미지 또는 PDF만 필터링하여 추가
                if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
                    const mediaPart = fileToGenerativePart(file.path, mimeType);
                    chatInputs.push(mediaPart);
                }
            });
        }

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
        const logMsg = message || (req.file ? `[파일: ${req.file.originalname}]` : "데이터 없음");
        await pool.query(sql, [logMsg, reply]);

        res.json({ reply: reply });

    } catch (error) {
        // 에러 발생 시에도 파일이 남아있다면 삭제
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error("비서 서비스 에러:", error);
        res.status(500).json({ error: "분석 중 오류 발생" });
    }
});


// 서버 실행
app.listen(port, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});

// 어떤 상황에서도 서버가 죽지 않게 하기위한 함수
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
});