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

/**
 * [Helper] 랜덤 초대코드 생성 함수
 * 회사명 앞 3글자 + 랜덤 4자리 조합 (예: GOL-X82A)
 */
const generateInviteCode = (name: string): string => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = (cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName.padEnd(3, 'X'));
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${randomStr}`;
};

// =========================================================================
// 1. 회원가입 API (그룹/법인 생성 및 초대 코드 합류 로직 포함)
// =========================================================================
router.post('/register', async (req: Request<{}, {}, RegisterDTO>, res: Response<AuthResponse>) => {
    try {
        const { 
            email, password, name, phone, 
            type, 
            companyName, groupName, bizNum,
            inviteCode,
            dept, position
        } = req.body;

        // 필수값 검증
        if (!email || !password || !name || !phone || !type) {
            return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
        }

        // 이메일 및 전화번호 중복 체크
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: '이미 가입된 이메일 또는 전화번호입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, authConfig.bcryptRounds);
        let companyId: number;
        let userRole: 'admin' | 'user';

        // -----------------------------------------------------------------
        // [Case A] 신규 법인/그룹 생성 (관리자 권한)
        // -----------------------------------------------------------------
        if (type === 'create') {
            if (!companyName) {
                return res.status(400).json({ success: false, message: "법인명은 필수입니다." });
            }

            const newInviteCode = generateInviteCode(companyName);

            // 회사(법인) 정보 저장
            const [result] = await pool.query<ResultSetHeader>(
                'INSERT INTO companies (name, group_name, biz_num, invite_code) VALUES (?, ?, ?, ?)',
                [companyName, groupName || null, bizNum || null, newInviteCode]
            );
            
            companyId = result.insertId;
            userRole = 'admin'; 
            console.log(`🏢 신규 법인 생성: ${companyName} (초대코드: ${newInviteCode})`);
        } 
        // -----------------------------------------------------------------
        // [Case B] 기존 법인 합류 (일반 직원 권한)
        // -----------------------------------------------------------------
        else if (type === 'join') {
            if (!inviteCode) {
                return res.status(400).json({ success: false, message: "초대 코드를 입력해주세요." });
            }

            const [companies] = await pool.query<RowDataPacket[]>(
                'SELECT id, name FROM companies WHERE invite_code = ?',
                [inviteCode]
            );

            const foundCompany = companies[0]; // TS 에러 방지를 위한 변수 할당

            if (!foundCompany) {
                return res.status(404).json({ success: false, message: "유효하지 않은 초대 코드입니다." });
            }

            companyId = foundCompany.id;
            userRole = 'user'; 
        } 
        else {
            return res.status(400).json({ success: false, message: "잘못된 가입 유형입니다." });
        }

        // 최종 유저 데이터 저장
        await pool.query<ResultSetHeader>(
            `INSERT INTO users (email, password, name, phone, company_id, role, dept, position) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email, hashedPassword, name, phone, 
                companyId, userRole, 
                dept || '미정', position || '사원'
            ]
        );

        res.status(201).json({
            success: true,
            message: userRole === 'admin' 
                ? '법인 생성 및 회원가입이 완료되었습니다.' 
                : '소속 법인 합류 및 회원가입이 완료되었습니다.',
            role: userRole
        });

    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// =========================================================================
// 2. 로그인 API
// =========================================================================
router.post('/login', async (req: Request<{}, {}, LoginDTO>, res: Response<AuthResponse>) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: '이메일과 비밀번호를 입력해주세요.' });
        }

        // [수정] User 인터페이스와 mysql2의 RowDataPacket을 교차 타입(&)으로 결합하여 타입 에러 해결
        const [users] = await pool.query<(User & RowDataPacket)[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const user = users[0];

        // 유저가 존재하지 않거나 비밀번호가 없는 경우 처리
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // [핵심] JWT 토큰에 데이터 격리를 위한 company_id, role, dept, position 등을 포함
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                company_id: user.company_id, // 향후 모든 API에서 데이터 격리에 사용됨
                name: user.name,
                role: user.role,
                dept: user.dept,
                position: user.position
            },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn as any }
        );

        // 보안을 위해 비밀번호 필드를 제외하고 응답
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

// =========================================================================
// 3. 소셜 로그인 (Passport)
// =========================================================================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/test-auth.html' }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        const token = jwt.sign({ id: user.id, email: user.email, company_id: user.company_id }, authConfig.jwtSecret, { expiresIn: '24h' });
        res.redirect(`/test-auth.html?token=${token}&name=${encodeURIComponent(user.name)}`);
    }
);

router.get('/naver', passport.authenticate('naver'));

router.get('/naver/callback',
    passport.authenticate('naver', { session: false, failureRedirect: '/test-auth.html' }),
    async (req: Request, res: Response) => {
        const user = req.user as User;
        const token = jwt.sign({ id: user.id, email: user.email, company_id: user.company_id }, authConfig.jwtSecret, { expiresIn: '24h' });
        res.redirect(`/test-auth.html?token=${token}&name=${encodeURIComponent(user.name)}`);
    }
);

export default router;