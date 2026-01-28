import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/dbConfig.js';
import { authConfig } from '../config/authConfig.js';
import passport from '../config/passportConfig.js';
const router = express.Router();
// 회원가입
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, companyName } = req.body;
        // 유효성 검사
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: '모든 필드를 입력해주세요.'
            });
        }
        // 이메일 중복 체크
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: '이미 존재하는 이메일입니다.'
            });
        }
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, authConfig.bcryptRounds);
        let companyId;
        let userRole;
        // ✅ 회사명이 입력된 경우
        if (companyName && companyName.trim() !== '') {
            // 기존 회사 검색
            const [companies] = await pool.query('SELECT id FROM companies WHERE name = ?', [companyName.trim()]);
            if (companies.length > 0) {
                // 기존 회사에 사원으로 가입
                companyId = companies[0].id;
                userRole = 'user';
            }
            else {
                // 회사가 없으면 새로 생성 (admin으로)
                const [companyResult] = await pool.query('INSERT INTO companies (name) VALUES (?)', [companyName.trim()]);
                companyId = companyResult.insertId;
                userRole = 'admin';
            }
        }
        else {
            // ✅ 회사명이 없는 경우 개인 워크스페이스 생성
            const [companyResult] = await pool.query('INSERT INTO companies (name) VALUES (?)', [`${name}의 워크스페이스`]);
            companyId = companyResult.insertId;
            userRole = 'admin';
        }
        // 사용자 생성
        const [result] = await pool.query('INSERT INTO users (email, password, name, company_id, role) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, name, companyId, userRole]);
        res.status(201).json({
            success: true,
            message: userRole === 'admin'
                ? '회원가입이 완료되었습니다. (관리자)'
                : `${companyName}의 사원으로 가입되었습니다.`
        });
    }
    catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
// 로그인
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '이메일과 비밀번호를 입력해주세요.'
            });
        }
        // 사용자 조회
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }
        const user = users[0];
        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }
        // JWT 토큰 생성
        const token = jwt.sign({ id: user.id, email: user.email }, authConfig.jwtSecret, // ← as string 추가
        { expiresIn: authConfig.jwtExpiresIn } // ← as jwt.SignOptions 추가
        );
        // 비밀번호 제외한 사용자 정보
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: '로그인 성공',
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
// 구글 로그인
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/test-auth.html' }), async (req, res) => {
    try {
        const user = req.user;
        // JWT 토큰 생성
        const token = jwt.sign({ id: user.id, email: user.email }, authConfig.jwtSecret, { expiresIn: '24h' });
        // 토큰을 쿼리 파라미터로 전달하여 프론트엔드로 리다이렉트
        res.redirect(`/test-auth.html?token=${token}&name=${encodeURIComponent(user.name)}`);
    }
    catch (error) {
        console.error('구글 로그인 콜백 에러:', error);
        res.redirect('/test-auth.html?error=login_failed');
    }
});
// 네이버 로그인
router.get('/naver', passport.authenticate('naver'));
router.get('/naver/callback', passport.authenticate('naver', { session: false, failureRedirect: '/test-auth.html' }), async (req, res) => {
    try {
        const user = req.user;
        // JWT 토큰 생성
        const token = jwt.sign({ id: user.id, email: user.email }, authConfig.jwtSecret, { expiresIn: '24h' });
        // 토큰을 쿼리 파라미터로 전달하여 프론트엔드로 리다이렉트
        res.redirect(`/test-auth.html?token=${token}&name=${encodeURIComponent(user.name)}`);
    }
    catch (error) {
        console.error('네이버 로그인 콜백 에러:', error);
        res.redirect('/test-auth.html?error=login_failed');
    }
});
export default router;
