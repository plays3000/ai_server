import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { pool } from './dbConfig.js';
import { authConfig } from './authConfig.js';
// 1. 사용자 직렬화 (세션에 ID 저장)
passport.serializeUser((user, done) => {
    done(null, user.id);
});
// 2. 사용자 역직렬화 (ID로 DB에서 사용자 정보 복구)
passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, users[0] || null);
    }
    catch (error) {
        done(error);
    }
});
// 3. 구글 전략 설정
passport.use(new GoogleStrategy({
    clientID: authConfig.googleClientId,
    clientSecret: authConfig.googleClientSecret,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleId = profile.id;
        if (!email)
            return done(new Error("구글 계정에 이메일 정보가 없습니다."));
        // 기존 사용자 확인
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        let user = existingUsers[0];
        if (!user) {
            // 신규 사용자 등록 (기본 워크스페이스 생성)
            const [companyResult] = await pool.query('INSERT INTO companies (name) VALUES (?)', [`${name}의 워크스페이스`]);
            const companyId = companyResult.insertId;
            const [insertResult] = await pool.query('INSERT INTO users (email, name, google_id, company_id, role) VALUES (?, ?, ?, ?, ?)', [email, name, googleId, companyId, 'admin']);
            const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
            user = newUser[0];
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
// 4. 네이버 전략 설정
passport.use(new NaverStrategy({
    clientID: authConfig.naverClientId,
    clientSecret: authConfig.naverClientSecret,
    callbackURL: "/auth/naver/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.email;
        const name = profile.name || profile.nickname;
        const naverId = profile.id;
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        let user = existingUsers[0];
        if (!user) {
            const [companyResult] = await pool.query('INSERT INTO companies (name) VALUES (?)', [`${name}의 워크스페이스`]);
            const companyId = companyResult.insertId;
            const [insertResult] = await pool.query('INSERT INTO users (email, name, naver_id, company_id, role) VALUES (?, ?, ?, ?, ?)', [email, name, naverId, companyId, 'admin']);
            const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
            user = newUser[0];
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
export default passport;
//# sourceMappingURL=passportConfig.js.map