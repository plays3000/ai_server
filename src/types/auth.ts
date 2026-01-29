import { type RowDataPacket } from 'mysql2';

// DB users 테이블 구조 정의 (mysql2 쿼리 결과 타입 지원)
export interface User extends RowDataPacket {
    id: number;
    email: string;
    password?: string; // 소셜 가입자는 없을 수 있음
    name: string;
    company_id: number;
    role: 'admin' | 'user';
    google_id?: string;
    naver_id?: string;
    created_at?: Date;
}

// 회원가입 요청 데이터 구조
export interface RegisterDTO {
    email: string;
    password?: string;
    name: string;
    companyName?: string; // 미입력 시 개인 워크스페이스 생성
}

// 로그인 요청 데이터 구조
export interface LoginDTO {
    email: string;
    password?: string;
}

// 인증 API 공통 응답 구조
export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: Partial<User>; // 민감 정보 제외 유저 데이터
}