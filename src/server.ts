import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import fs from 'fs';
import multer from 'multer';

// 설정 및 인증 모듈 임포트
import { connectToDatabase } from './config/dbConfig.js';
import session from 'express-session';
import passport from 'passport'; 
import passportConfig from './config/passportConfig.js';

// 분리된 라우터 임포트
import authRouter from './routes/auth.js';
import excelRouter from './routes/excel.js';
import chatRouter from './routes/chat.js';
import templateRouter from './routes/templetes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

// 데이터베이스 연결 및 패스포트 설정 실행
connectToDatabase();
passportConfig();

// 뷰 엔진 및 경로 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// [중요] 기본 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// 세션 및 패스포트 인증 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // HTTP 환경이므로 false
        httpOnly: true 
    } 
}));

app.use(passport.initialize());
app.use(passport.session());

// [디버깅용] 모든 요청을 로그로 남깁니다 (404 원인 파악용)
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// -----------------------------------------------------
// 라우터 연결
// -----------------------------------------------------
app.use('/auth', authRouter);
app.use('/excel', excelRouter);
app.use('/templates', templateRouter);

// chatRouter를 '/'에 연결하면 chat.ts 내부의 '/chat' 경로가 최종적으로 '/chat'이 됩니다.
app.use('/', chatRouter);

// 메인 페이지 (챗봇 화면)
app.get('/', (req: Request, res: Response) => {
    res.render('chatbot');
});

// 회원가입/로그인 테스트 페이지
app.get('/auth-test', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../views/auth-test.html'));
});

// 템플릿 학습용 테스트 페이지 (기존 로직)
app.get('/test-learn', (req: Request, res: Response) => {
    const filePath = path.resolve(__dirname, '..', 'views', 'test-learn.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send("파일을 찾을 수 없습니다.");
    }
});

// -----------------------------------------------------
// 에러 핸들링
// -----------------------------------------------------

// 404 처리 (위에서 정의되지 않은 모든 경로)
app.use((req: Request, res: Response) => {
    console.warn(`⚠️ 404 발생: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, message: '경로를 찾을 수 없습니다.' });
});

// 500 서버 에러 처리
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('🔥 서버 에러:', err.stack);
    res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
});

// 서버 실행
app.listen(port, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});