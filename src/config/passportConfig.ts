import passport from 'passport';
import { 
    Strategy as GoogleStrategy, 
    type Profile as GoogleProfile, 
    type VerifyCallback 
} from 'passport-google-oauth20';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { pool } from './dbConfig.js';
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
interface User {
            id: string,
            email: string,
            name: string,
            provider: string,
            provider_id: string,
            profile_image: any
        };

// 1. 구글 전략 설정
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!
}, async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
    try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const profileImage = profile.photos?.[0]?.value;

        // provider_id로 기존 사용자 확인
        const [users] = await pool.query<User[]>(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
            ['google', profile.id]
        );

        if (users.length > 0 && users[0]) {
            return done(null, users[0]);
        }

        // 동일 이메일 존재 여부 확인
        const [emailUsers] = await pool.query<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (emailUsers.length > 0 && emailUsers[0]) {
            // 기존 계정에 구글 정보 연동
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

        // 새 사용자 생성
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (email, name, provider, provider_id, profile_image) VALUES (?, ?, ?, ?, ?)',
            [email, name, 'google', profile.id, profileImage]
        );

        const newUser: User = {
            id: result.insertId,
            email: email || '',
            name,
            provider: 'google',
            provider_id: profile.id,
            profile_image: profileImage
        } as User;

        done(null, newUser);
    } catch (error) {
        done(error as Error);
    }
}));

// 2. 네이버 전략 설정
passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID!,
    clientSecret: process.env.NAVER_CLIENT_SECRET!,
    callbackURL: process.env.NAVER_CALLBACK_URL!
}, async (_accessToken: string, _refreshToken: string, profile: NaverProfile, done: (error: any, user?: any) => void) => {
    try {
        const { id, email, name, profile_image } = profile;

        const [users] = await pool.query<User[]>(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
            ['naver', id]
        );

        if (users.length > 0 && users[0]) {
            return done(null, users[0]);
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (email, name, provider, provider_id, profile_image) VALUES (?, ?, ?, ?, ?)',
            [email, name, 'naver', id, profile_image]
        );

        const newUser: User = {
            id: result.insertId,
            email,
            name,
            provider: 'naver',
            provider_id: id,
            profile_image: profile_image
        } as User;

        done(null, newUser);
    } catch (error) {
        done(error as Error);
    }
}));

// 세션 저장 및 복구
passport.serializeUser((user: any, done) => {
    done(null, (user as User).id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const [users] = await pool.query<User[]>(
            'SELECT id, email, name, provider, profile_image FROM users WHERE id = ?',
            [id]
        );
        done(null, users[0] || null);
    } catch (error) {
        done(error);
    }
});

export default passport;