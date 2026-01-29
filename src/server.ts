import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import 'dotenv/config';

// 설정 및 라우터 임포트
import { pool, connectToDatabase } from './config/dbConfig.js';
import { model } from './config/geminiConfig.js';
import excelRouter from './routes/excel.js';
import authRouter from './routes/auth.js';
import session from 'express-session';
import passport from './config/passportConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

// DB 연결
connectToDatabase();

// 업로드 폴더 설정
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

// 뷰 엔진 설정 (views 폴더를 직접 참조하도록 경로 간소화)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 정적 파일 미들웨어 (public 폴더를 루트로 설정)
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

app.use(passport.initialize());
app.use(passport.session());

// 라우터 연결
app.use('/excel', excelRouter);
app.use('/auth', authRouter);

// 메인 페이지 (중첩 디렉터리 경로 'report-generator-chatbot/' 제거)
app.get('/', (req: Request, res: Response) => {
  res.render('chatbot'); // views/chatbot.ejs를 바로 호출
});

// 채팅 분석 및 DB 저장 로직
app.post('/chat', upload.fields([
    { name: 'pdfFile', maxCount: 10 },
    { name: 'images', maxCount: 10 }
]), async (req: Request, res: Response) => {
    try {
        const { title, detail } = req.body;
        const userMessage = `${title}\n${detail || ''}`;
        const chatInputs: any[] = [{ text: userMessage }];

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        const processFiles = (fileArray: Express.Multer.File[] | undefined, defaultMime: string) => {
            if (!fileArray) return;
            fileArray.forEach(file => {
                chatInputs.push({
                    inlineData: {
                        data: fs.readFileSync(file.path).toString("base64"),
                        mimeType: file.mimetype || defaultMime 
                    }
                });
                fs.unlinkSync(file.path); 
            });
        };

        processFiles(files['pdfFile'], "application/pdf");
        processFiles(files['images'], "image/jpeg");

        const result = await model.generateContent(chatInputs);
        const reply = result.response.text();

        await pool.query('INSERT INTO chat_history (user_msg, ai_reply) VALUES (?, ?)', [userMessage, reply]);
        res.json({ reply });

    } catch (error) {
        console.error("분석 실패:", error);
        res.status(500).json({ error: "파일 분석 중 오류 발생" });
    }
});

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});