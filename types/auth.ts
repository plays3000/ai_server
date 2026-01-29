import { type RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
    id: number;
    email: string;
    name: string;
    company_id?: number;  
    role?: 'admin' | 'user';  
    password?: string;
    provider?: string;
    provider_id?: string;
    profile_image?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface Company extends RowDataPacket {
    id: number;
    name: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface RegisterDTO {
    email: string;
    password: string;
    name: string;
    companyName?: string; 
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: Omit<User, 'password'>;
}

export interface ChatHistory extends RowDataPacket {
    id: number;
    user_id: number;
    company_id: number;
    user_msg: string;
    ai_reply: string;
    created_at?: Date;
}