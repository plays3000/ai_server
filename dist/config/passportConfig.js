import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import bcrypt from 'bcrypt';
// 1. dbConfig에서 'pool'을 'db'라는 별칭으로 가져옵니다.
import { pool as db } from './dbConfig.js';
// 2. authConfig에서 명명된 내보내기(Named Export)인 { authConfig }를 가져옵니다.
import { authConfig } from './authConfig.js';
export default function passportConfig() {
    // 세션 저장: 유저 ID만 저장
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    // 세션 복원: 유저 정보 및 회사/부서 정보 JOIN
    passport.deserializeUser(async (id, done) => {
        try {
            // [수정] 회사명(company_name)과 부서명(dept_name)을 JOIN으로 함께 가져옵니다.
            const query = `
                SELECT 
                    u.*, 
                    c.company_name, 
                    d.dept_name 
                FROM users u
                LEFT JOIN companies c ON u.company_id = c.company_id
                LEFT JOIN departments d ON u.dept_id = d.dept_id
                WHERE u.id = ?
            `;
            const [rows] = await db.query(query, [id]);
            if (rows.length > 0) {
                done(null, rows[0]); // 이제 req.user에 소속 정보가 포함됩니다.
            }
            else {
                done(null, false);
            }
        }
        catch (err) {
            console.error('Passport Deserialize Error:', err);
            done(err);
        }
    });
    // 로컬 로그인 전략
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) {
                return done(null, false, { message: '등록되지 않은 이메일입니다.' });
            }
            const user = rows[0];
            if (!user.password) {
                return done(null, false, { message: '소셜 로그인 계정입니다.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, user);
            }
            else {
                return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
        }
        catch (err) {
            return done(err);
        }
    }));
    // 구글 로그인 전략
    passport.use(new GoogleStrategy({
        clientID: authConfig.googleClientId, // authConfig의 속성명에 맞게 수정
        clientSecret: authConfig.googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const [rows] = await db.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [profile.id, email]);
            if (rows.length > 0) {
                return done(null, rows[0]);
            }
            else {
                const [result] = await db.query('INSERT INTO users (email, name, google_id, provider, role) VALUES (?, ?, ?, ?, ?)', [email, profile.displayName, profile.id, 'google', 'user']);
                const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
                return done(null, newUser[0]);
            }
        }
        catch (err) {
            return done(err);
        }
    }));
    // 네이버 로그인 전략
    passport.use(new NaverStrategy({
        clientID: authConfig.naverClientId, // authConfig의 속성명에 맞게 수정
        clientSecret: authConfig.naverClientSecret,
        callbackURL: process.env.NAVER_CALLBACK_URL || 'http://localhost:3000/auth/naver/callback',
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.email;
            const [rows] = await db.query('SELECT * FROM users WHERE naver_id = ? OR email = ?', [profile.id, email]);
            if (rows.length > 0) {
                return done(null, rows[0]);
            }
            else {
                const [result] = await db.query('INSERT INTO users (email, name, naver_id, provider, role) VALUES (?, ?, ?, ?, ?)', [email, profile.name || profile.nickname, profile.id, 'naver', 'user']);
                const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
                return done(null, newUser[0]);
            }
        }
        catch (err) {
            return done(err);
        }
    }));
}
//# sourceMappingURL=passportConfig.js.map