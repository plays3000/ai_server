import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// 설정 및 인증 모듈 임포트
import { connectToDatabase } from './config/dbConfig.js';
import session from 'express-session';
import passport from './config/passportConfig.js';

// 분리된 라우터 임포트
import authRouter from './routes/auth.js';
import excelRouter from './routes/excel.js';
import chatRouter from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

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
app.use('/chat', chatRouter);

// 메인 페이지 렌더링
app.get('/', (req: Request, res: Response) => {
    res.render('chatbot');
});

// 서버 실행
app.listen(port, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});