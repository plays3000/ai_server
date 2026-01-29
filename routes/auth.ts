import express, { type Request, type Response, type Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/dbConfig.js';
import { authConfig } from '../config/authConfig.js';
import passport from '../config/passportConfig.js';
import { 
    type RegisterDTO, 
    type LoginDTO, 
    type AuthResponse, 
    type User 
} from '../types/auth.js';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';

const router: Router = express.Router();

// 1. 회원가입
router.post('/register', async (req: Request<{}, {}, RegisterDTO>, res: Response<AuthResponse>) => {
    try {
        const { email, password, name, companyName } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
        }

        // 이메일 중복 체크 (User 인터페이스 적용)
        const [existingUsers] = await pool.query<User[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: '이미 존재하는 이메일입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, authConfig.bcryptRounds);
        let companyId: number;
        let userRole: 'admin' | 'user';

        if (companyName && companyName.trim() !== '') {
            const [companies] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM companies WHERE name = ?',
                [companyName.trim()]
            );

            if (companies.length > 0) {
                companyId = (companies[0] as { id: number }).id;
                userRole = 'user';
            } else {
                const [companyResult] = await pool.query<ResultSetHeader>(
                    'INSERT INTO companies (name) VALUES (?)',
                    [companyName.trim()]
                );
                companyId = companyResult.insertId;
                userRole = 'admin';
            }
        } else {
            const [companyResult] = await pool.query<ResultSetHeader>(
                'INSERT INTO companies (name) VALUES (?)',
                [`${name}의 워크스페이스`]
            );
            companyId = companyResult.insertId;
            userRole = 'admin';
        }

        await pool.query<ResultSetHeader>(
            'INSERT INTO users (email, password, name, company_id, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, name, companyId, userRole]
        );

        res.status(201).json({
            success: true,
            message: userRole === 'admin' 
                ? '회원가입이 완료되었습니다. (관리자)' 
                : `${companyName}의 사원으로 가입되었습니다.`
        });

    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// 2. 로그인
router.post('/login', async (req: Request<{}, {}, LoginDTO>, res: Response<AuthResponse>) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: '이메일과 비밀번호를 입력해주세요.' });
        }

        const [users] = await pool.query<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const user = users[0];
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            authConfig.jwtSecret,
            { 
                // as any를 붙여서 strict 옵션 충돌을 방지합니다.
                expiresIn: authConfig.jwtExpiresIn as any 
            }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: '로그인 성공',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// 구글/네이버 라우트는 기존 로직 유지 (타입만 Request, Response로 명시)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/test-auth.html' }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        const token = jwt.sign({ id: user.id, email: user.email }, authConfig.jwtSecret, { expiresIn: '24h' });
        res.redirect(`/test-auth.html?token=${token}&name=${encodeURIComponent(user.name)}`);
    }
);

router.get('/naver', passport.authenticate('naver'));

router.get('/naver/callback',
    passport.authenticate('naver', { session: false, failureRedirect: '/test-auth.html' }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        const token = jwt.sign({ id: user.id, email: user.email }, authConfig.jwtSecret, { expiresIn: '24h' });
        res.redirect(`/test-auth.html?token=${token}&name=${encodeURIComponent(user.name)}`);
    }
);

export default router;