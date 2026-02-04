import { RowDataPacket } from 'mysql2';

/**
 * DB 조회 결과와 애플리케이션 유저 정보를 통합한 인터페이스
 * RowDataPacket을 상속받아 DB 쿼리 결과로 바로 사용할 수 있습니다.
 */
export interface User extends RowDataPacket {
    id: number;
    email: string;
    password?: string;
    name: string;
    phone?: string;
    company_id: number | null;
    dept_id?: number;
    rank_level?: number;
    is_approved?: number;
    company_name?: string; // JOIN 결과용
    dept_name?: string;    // JOIN 결과용
    role: 'admin' | 'user';
    provider?: string;
    sns_id?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface RegisterDTO {
    email: string;
    password?: string;
    name: string;
    phone?: string;
    type: 'create' | 'join'; 
    companyName?: string;
    bizNum?: string;
    ownerName?: string;
    inviteCode?: string;
    dept_id?: number;
}

export interface LoginDTO {
    email: string;
    password?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: Partial<User>; // 민감정보 제외 전달
    token?: string;
    role?: 'admin' | 'user';
}