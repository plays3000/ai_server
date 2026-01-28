import dotenv from 'dotenv';
dotenv.config();
export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this',
    jwtExpiresIn: '24h',
    bcryptRounds: 10,
    sessionSecret: process.env.SESSION_SECRET || 'session-secret-change-this'
};
