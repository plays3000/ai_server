// src/middleware/authMiddleware.ts
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig.js';
import { User as MyUser } from '../types/auth.js';

declare global {
    namespace Express {
        // [핵심] 별도의 인터페이스 대신 기존 User를 그대로 사용하도록 병합
        // 이렇게 하면 index.d.ts에 선언된 User 타입과 충돌하지 않습니다.
        interface User extends MyUser {}
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "로그인이 필요합니다." });

    jwt.verify(token, authConfig.jwtSecret, (err: any, decoded: any) => {
        if (err) return res.status(403).json({ success: false, message: "유효하지 않은 토큰입니다." });
        
        // decoded에 담긴 유저 정보를 req.user에 할당
        // 이제 req.user는 company_id를 가진 User 타입으로 인식됩니다.
        req.user = decoded as Express.User; 
        next();
    });
};