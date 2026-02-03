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

// src/types/auth.ts

/**
 * 시스템의 핵심 유저 인터페이스
 * Express.User와 병합되거나 DB 조회 결과의 타입 캐스팅에 사용됩니다.
 */
export interface User {
    id: number;
    email: string;
    name: string;
    phone: string;         // 추가
    company_id: number;    // 추가 (데이터 격리 핵심)
    role: 'admin' | 'user'; // 추가
    dept?: string;         // 추가
    position?: string;     // 추가
    password?: string;
    provider?: string;            // 소셜 로그인 제공자 (google, naver 등)
    sns_id?: string;              // 소셜 로그인 고유 ID
    created_at?: Date;
}

/**
 * 회원가입 시 클라이언트로부터 받는 데이터 전송 객체 (DTO)
 */
export interface RegisterDTO {
    // 공통 정보
    email: string;
    password?: string;
    name: string;
    phone: string;
    
    // 가입 로직 제어
    type: 'create' | 'join';      // 'create': 신규 법인 생성, 'join': 기존 법인 합류
    
    // 법인 생성 시 필요한 정보 (type === 'create' 일 때 필수)
    companyName?: string;
    groupName?: string;           // 그룹 소속일 경우
    bizNum?: string;              // 사업자 번호
    
    // 기존 법인 합류 시 필요한 정보 (type === 'join' 일 때 필수)
    inviteCode?: string;
    
    // 기타 선택 정보
    dept?: string;
    position?: string;
}

/**
 * 로그인 시 클라이언트로부터 받는 데이터 전송 객체 (DTO)
 */
export interface LoginDTO {
    email: string;
    password?: string;
}

/**
 * 인증 성공 시 클라이언트에 돌려주는 응답 구조
 */
export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;               // JWT 토큰
    user?: Omit<User, 'password'>; // 비밀번호를 제외한 유저 정보
    role?: 'admin' | 'user';
}