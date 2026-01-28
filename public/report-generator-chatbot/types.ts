export interface FileStore {
    image: File[];
    audio: File[];
    file: File[];
}

export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    files?: FileStore;
}

// 설정 관련 DTO
export interface AppSettings {
    theme: 'light' | 'dark' | 'blue';
    language: 'en' | 'ko' | 'zh' | 'ja';
    writingMode: string;
}