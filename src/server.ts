import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import fs from 'fs';
import multer from 'multer'; // multer 임포트 확인

// 설정 및 인증 모듈 임포트
import { connectToDatabase } from './config/dbConfig.js';
import session from 'express-session';
import passport from './config/passportConfig.js';

// 분리된 라우터 임포트
import authRouter from './routes/auth.js';
import excelRouter from './routes/excel.js';
import chatRouter from './routes/chat.js';
import templateRouter from './routes/templetes.js';

import {insertJsonToDb} from './backend/json_to_db.js';

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
app.use('/', chatRouter);
app.use('/templates', templateRouter);

// 메인 페이지 렌더링
app.get('/', (req: Request, res: Response) => {
    res.render('chatbot');
});

app.get('/templates', (req: Request, res: Response) => {
    // dist 폴더 내부에서 밖으로 한 칸 나가서 views 폴더로 진입
    const filePath = path.resolve(__dirname, '..', 'views', 'test-learn.html');

    // 디버깅을 위해 서버 터미널에 실제 찾는 경로를 출력해보세요
    console.log("🔍 찾는 파일 경로:", filePath);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        console.error("❌ 파일이 존재하지 않습니다!");
        res.status(404).send("파일을 찾을 수 없습니다.");
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