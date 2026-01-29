import express, { type Request, type Response } from 'express';import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import 'dotenv/config';

// 기존 .js 참조를 모두 소스 코드(.ts 또는 .js) 기준으로 변경
import { pool, connectToDatabase } from './config/dbConfig.js';
import { model } from './config/geminiConfig.js';
import excelRouter from './routes/excel.js';
import authRouter from './routes/auth.js'; // dist 참조 제거
import session from 'express-session';
import passport from './config/passportConfig.js'; // dist 참조 제거

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

// 업로드 폴더 생성 로직 유지
if (!fs.existsSync('uploads/')) {
    fs.mkdirSync('uploads/');
}

const upload = multer({ dest: 'uploads/' });

connectToDatabase();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules")));

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

app.get('/', (req: Request, res: Response) => {
  res.render('report-generator-chatbot/chatbot');
});

// 채팅 로직 (기존 통합된 로직 유지하되 타입 지정)
app.post('/chat', upload.fields([
    { name: 'pdfFile', maxCount: 10 },
    { name: 'images', maxCount: 10 }
]), async (req: Request, res: Response) => {
    try {
        const { title, detail } = req.body;
        const userMessage = `${title}\n${detail || ''}`;
        const chatInputs: any[] = [{ text: userMessage }];

        const processFiles = (files: any, defaultMime: string) => {
            if (!files) return;
            files.forEach((file: any) => {
                chatInputs.push({
                    inlineData: {
                        data: fs.readFileSync(file.path).toString("base64"),
                        mimeType: file.mimetype || defaultMime 
                    }
                });
                fs.unlinkSync(file.path); 
            });
        };

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
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