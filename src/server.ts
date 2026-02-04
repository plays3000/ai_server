import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

// 1. 서버 시작 전 필수 폴더(uploads) 자동 생성 로직
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📂 uploads 폴더가 존재하지 않아 자동으로 생성했습니다.');
}

// 데이터베이스 연결
connectToDatabase();

// 뷰 엔진 및 정적 파일 경로 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 및 패스포트 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // 개발 환경 기준 (HTTPS 사용 시 true로 변경)
}));

app.use(passport.initialize());
app.use(passport.session());

// 라우터 연결 (기능별 분리)
app.use('/auth', authRouter);
app.use('/excel', excelRouter);
app.use('/chat', chatRouter);

// 메인 페이지 렌더링
app.get('/', (req: Request, res: Response) => {
    res.render('chatbot');
});

// Dynamic content routes
app.get('/content/chat', (req: Request, res: Response) => {
    res.render('components/chat-area');
});

app.get('/content/login', (req: Request, res: Response) => {
    res.render('screens/login');
});

app.get('/content/signup', (req: Request, res: Response) => {
    res.render('screens/signup');
});

app.get('/login', (req: Request, res: Response) => {
    res.render('screens/login');
});

app.get('/signup', (req: Request, res: Response) => {
    res.render('screens/signup');
});

// 2. 전역 에러 핸들러 (NextFunction 사용)
// 모든 라우터에서 발생하는 예상치 못한 에러를 여기서 포착합니다.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ 서버 내부 오류 발생:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: '서버 내부에서 오류가 발생했습니다. 관리자에게 문의하세요.' 
    });
});

// 서버 실행
app.listen(port, () => {
    console.log(`🚀 서버가 실행되었습니다: http://localhost:${port}`);
});