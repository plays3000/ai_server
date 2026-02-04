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
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { 
            username, email, password, name, phone, type,
            group_name, biz_num, 
            company_name, group_code, owner_position,
            invite_code, dept_name, position_name
        } = req.body;

        // 1. 공통 필수값 검증
        if (!username || !email || !password || !name || !phone) {
            return res.status(400).json({ success: false, message: '개인 필수 정보가 누락되었습니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let companyId: number | null = null;
        let rankLevel = 1;

        // -----------------------------------------------------------------
        // [CASE 1] 그룹 창설
        // -----------------------------------------------------------------
        if (type === 'group_create') {
            if (!group_name || !biz_num) return res.status(400).json({ success: false, message: '그룹명과 사업자번호는 필수입니다.' });
            
            // 그룹 생성 -> 해당 그룹에 속한 기본 회사(본사) 생성 로직
            const [groupResult] = await db.query<ResultSetHeader>('INSERT INTO `groups` (group_name) VALUES (?)', [group_name]);
            const [compResult] = await db.query<ResultSetHeader>(
                'INSERT INTO companies (group_id, company_name, business_registration_number, invite_code) VALUES (?, ?, ?, ?)',
                [groupResult.insertId, group_name + " 본사", biz_num, generateInviteCode(group_name)]
            );
            companyId = compResult.insertId;
            rankLevel = 9; // 그룹장
        }
        // -----------------------------------------------------------------
        // [CASE 2] 법인 창설
        // -----------------------------------------------------------------
        else if (type === 'company_create') {
            if (!company_name) return res.status(400).json({ success: false, message: '회사명은 필수입니다.' });
            
            const newInviteCode = generateInviteCode(company_name);
            const [result] = await db.query<ResultSetHeader>(
                'INSERT INTO companies (company_name, invite_code) VALUES (?, ?)',
                [company_name, newInviteCode]
            );
            companyId = result.insertId;
            rankLevel = 8; // 법인 관리자
        }
        // -----------------------------------------------------------------
        // [CASE 3] 일반 직원 합류 (초대 코드 필수)
        // -----------------------------------------------------------------
        else if (type === 'join') {
            if (!invite_code) return res.status(400).json({ success: false, message: '초대 코드가 필요합니다.' });
            
            const [companies] = await db.query<RowDataPacket[]>('SELECT company_id FROM companies WHERE invite_code = ?', [invite_code]);
            if (companies.length === 0) return res.status(404).json({ success: false, message: '유효하지 않은 초대 코드입니다.' });
            
            companyId = companies[0]!.company_id;
            rankLevel = 1; // 일반 직원
        }

        // 최종 유저 저장
        await db.query(
            `INSERT INTO users (username, email, password, name, phone, company_id, rank_level, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, name, phone, companyId, rankLevel, rankLevel >= 8 ? 'admin' : 'user']
        );

        res.status(201).json({ success: true, message: '회원가입 성공!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: '서버 에러' });
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
    if (!req.user) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    // passportConfig에서 JOIN으로 가져온 모든 정보가 담겨있습니다.
    const user = req.user as User;
    
    // 보안을 위해 비밀번호 필드는 제거하고 응답합니다.
    const { password, ...safeUserInfo } = user;

    res.json({
        success: true,
        user: safeUserInfo
    });
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