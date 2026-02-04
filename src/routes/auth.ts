import express, { type Request, type Response, type Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';

// ESM 규칙에 따라 .js 확장자를 유지합니다.
import { pool as db } from '../config/dbConfig.js';
import { authConfig } from '../config/authConfig.js';
import { 
    type RegisterDTO, 
    type LoginDTO, 
    type AuthResponse, 
    type User 
} from '../types/auth.js';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

/**
 * [Helper] 랜덤 초대코드 생성 함수
 */
const generateInviteCode = (name: string): string => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = (cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName.padEnd(3, 'X'));
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${randomStr}`;
};

// =========================================================================
// 1. 회원가입 API (회사 생성 및 합류 로직)
// =========================================================================
router.post('/register', async (req: Request<{}, {}, RegisterDTO>, res: Response<AuthResponse>) => {
    try {
        const { 
            email, password, name, phone, 
            type, 
            companyName, bizNum, ownerName,
            inviteCode,
            dept_id
        } = req.body;

        if (!email || !password || !name || !type) {
            return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
        }

        const [existing] = await db.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?', [email]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: '이미 가입된 이메일입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, authConfig.bcryptRounds || 10);
        let companyId: number | null = null;
        let rankLevel = 1; 

        if (type === 'create') {
            if (!companyName) return res.status(400).json({ success: false, message: "회사명은 필수입니다." });
            
            const newInviteCode = generateInviteCode(companyName);
            // 007 SQL 패치에 맞춰 컬럼명을 매핑합니다.
            const [result] = await db.query<ResultSetHeader>(
                'INSERT INTO companies (company_name, business_registration_number, owner_name, invite_code) VALUES (?, ?, ?, ?)',
                [companyName, bizNum || null, ownerName || name, newInviteCode]
            );
            companyId = result.insertId;
            rankLevel = 9; 
        } 
        else if (type === 'join' && inviteCode) {
            const [companies] = await db.query<RowDataPacket[]>(
                'SELECT company_id FROM companies WHERE invite_code = ?', [inviteCode]
            );
            if (companies.length === 0) {
                return res.status(404).json({ success: false, message: "유효하지 않은 초대 코드입니다." });
            }
            companyId = companies[0]!.company_id;
            rankLevel = 1;
        }

        await db.query<ResultSetHeader>(
            `INSERT INTO users (email, password, name, phone, company_id, rank_level, role, dept_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email, hashedPassword, name, phone || null, 
                companyId, rankLevel, rankLevel >= 9 ? 'admin' : 'user',
                dept_id || null
            ]
        );

        res.status(201).json({ success: true, message: '회원가입이 완료되었습니다.' });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// =========================================================================
// 2. 로그인 API
// =========================================================================
router.post('/login', async (req: Request<{}, {}, LoginDTO>, res: Response<AuthResponse>) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query<User[]>(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        const user = users[0];
        if (!user || !user.password || !(await bcrypt.compare(password!, user.password))) {
            return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        const token = jwt.sign(
            { id: user.id, company_id: user.company_id, rank_level: user.rank_level },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn as any }
        );

        // [에러 해결] RowDataPacket의 특수 속성을 피하기 위해 as any로 캐스팅하여 Partial<User>에 할당
        const responseUser: any = {
            id: user.id,
            email: user.email,
            name: user.name,
            company_id: user.company_id,
            rank_level: user.rank_level,
            role: user.role
        };

        res.json({
            success: true,
            message: '로그인 성공',
            token,
            user: responseUser
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// =========================================================================
// 3. 내 정보 API (Passport 세션 기반 자동채우기용 데이터 제공)
// =========================================================================
router.get('/me', isAuthenticated, (req, res) => {
    // passportConfig의 deserializeUser에서 JOIN된 풍부한 정보가 담겨있습니다.
    const user = req.user as User;
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser as any });
});

// =========================================================================
// 4. 소셜 로그인
// =========================================================================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { session: true, failureRedirect: '/login' }),
    (req, res) => res.redirect('/')
);

router.get('/naver', passport.authenticate('naver'));
router.get('/naver/callback',
    passport.authenticate('naver', { session: true, failureRedirect: '/login' }),
    (req, res) => res.redirect('/')
);

export default router;