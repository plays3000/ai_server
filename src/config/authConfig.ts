import 'dotenv/config';

/**
 * 인증 및 소셜 로그인 환경 설정 인터페이스
 */
export interface AuthConfig {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    googleClientId: string;
    googleClientSecret: string;
    naverClientId: string;
    naverClientSecret: string;
}

/**
 * 환경 변수(.env)를 기반으로 한 인증 설정 객체
 */
export const authConfig: AuthConfig = {
    // JWT 및 보안 설정
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,

    // Google OAuth 설정
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

    // Naver OAuth 설정
    naverClientId: process.env.NAVER_CLIENT_ID || '',
    naverClientSecret: process.env.NAVER_CLIENT_SECRET || '',
};