import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { pool } from './dbConfig.js';
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
import { type User } from '../types/auth.js';
import { type ResultSetHeader } from 'mysql2';
import 'dotenv/config';

// 네이버 프로필 타입 정의 (필요한 필드만 추출)
interface NaverProfile {
    id: string;
    email: string;
    name: string;
    profile_image: string;
}

// 1. 구글 전략 설정
=======
import dotenv from 'dotenv';
dotenv.config();
// 구글 전략
>>>>>>> d30865e (report-generator-chatbot 디렉터리 완전 삭제)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const profileImage = profile.photos?.[0]?.value;
        // ✅ 1. provider_id로 먼저 확인
        const [users] = await pool.query('SELECT * FROM users WHERE provider = ? AND provider_id = ?', ['google', profile.id]);
        if (users.length > 0) {
            return done(null, users[0]);
        }
        // ✅ 2. 같은 이메일이 있는지 확인
        const [emailUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (emailUsers.length > 0) {
            // ✅ 3. 같은 이메일이 있으면 구글 정보 추가
            await pool.query('UPDATE users SET provider = ?, provider_id = ?, profile_image = ? WHERE email = ?', ['google', profile.id, profileImage, email]);
            const updatedUser = {
                ...emailUsers[0],
                provider: 'google',
                provider_id: profile.id,
                profile_image: profileImage
            };
            return done(null, updatedUser);
        }
        // ✅ 4. 새 사용자 생성
        const [result] = await pool.query('INSERT INTO users (email, name, provider, provider_id, profile_image) VALUES (?, ?, ?, ?, ?)', [email, name, 'google', profile.id, profileImage]);
        const newUser = {
            id: result.insertId,
            email,
            name,
            provider: 'google',
            provider_id: profile.id,
            profile_image: profileImage
        };
        done(null, newUser);
    }
    catch (error) {
        done(error);
    }
}));
// 네이버 전략
passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.email;
        const name = profile.name;
        const profileImage = profile.profile_image;
        const [users] = await pool.query('SELECT * FROM users WHERE provider = ? AND provider_id = ?', ['naver', profile.id]);
        if (users.length > 0) {
            return done(null, users[0]);
        }
        const [result] = await pool.query('INSERT INTO users (email, name, provider, provider_id, profile_image) VALUES (?, ?, ?, ?, ?)', [email, name, 'naver', profile.id, profileImage]);
        const newUser = {
            id: result.insertId,
            email,
            name,
            provider: 'naver',
            provider_id: profile.id,
            profile_image: profileImage
        };
        done(null, newUser);
    }
    catch (error) {
        done(error);
    }
}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await pool.query('SELECT id, email, name, provider, profile_image FROM users WHERE id = ?', [id]);
        done(null, users[0]);
    }
    catch (error) {
        done(error);
    }
});
<<<<<<< HEAD

export default passport;
>>>>>>> 43d1307 (다시 리팩터링중...)
=======
export default passport;
>>>>>>> d30865e (report-generator-chatbot 디렉터리 완전 삭제)
