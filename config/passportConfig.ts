import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { pool } from './dbConfig.js';
import dotenv from 'dotenv';

dotenv.config();

// 구글 전략
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!
}, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
    try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const profileImage = profile.photos?.[0]?.value;

        // ✅ 1. provider_id로 먼저 확인
        const [users] = await pool.query<any[]>(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
            ['google', profile.id]
        );

        if (users.length > 0) {
            return done(null, users[0]);
        }

        // ✅ 2. 같은 이메일이 있는지 확인
        const [emailUsers] = await pool.query<any[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (emailUsers.length > 0) {
            // ✅ 3. 같은 이메일이 있으면 구글 정보 추가
            await pool.query(
                'UPDATE users SET provider = ?, provider_id = ?, profile_image = ? WHERE email = ?',
                ['google', profile.id, profileImage, email]
            );
            
            const updatedUser = {
                ...emailUsers[0],
                provider: 'google',
                provider_id: profile.id,
                profile_image: profileImage
            };
            
            return done(null, updatedUser);
        }

        // ✅ 4. 새 사용자 생성
        const [result] = await pool.query<any>(
            'INSERT INTO users (email, name, provider, provider_id, profile_image) VALUES (?, ?, ?, ?, ?)',
            [email, name, 'google', profile.id, profileImage]
        );

        const newUser = {
            id: result.insertId,
            email,
            name,
            provider: 'google',
            provider_id: profile.id,
            profile_image: profileImage
        };

        done(null, newUser);
    } catch (error) {
        done(error as Error);
    }
}));

// 네이버 전략
passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID!,
    clientSecret: process.env.NAVER_CLIENT_SECRET!,
    callbackURL: process.env.NAVER_CALLBACK_URL!
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
        const email = profile.email;
        const name = profile.name;
        const profileImage = profile.profile_image;

        const [users] = await pool.query<any[]>(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
            ['naver', profile.id]
        );

        if (users.length > 0) {
            return done(null, users[0]);
        }

        const [result] = await pool.query<any>(
            'INSERT INTO users (email, name, provider, provider_id, profile_image) VALUES (?, ?, ?, ?, ?)',
            [email, name, 'naver', profile.id, profileImage]
        );

        const newUser = {
            id: result.insertId,
            email,
            name,
            provider: 'naver',
            provider_id: profile.id,
            profile_image: profileImage
        };

        done(null, newUser);
    } catch (error) {
        done(error as Error);
    }
}));

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const [users] = await pool.query<any[]>(
            'SELECT id, email, name, provider, profile_image FROM users WHERE id = ?',
            [id]
        );
        done(null, users[0]);
    } catch (error) {
        done(error);
    }
});

export default passport;