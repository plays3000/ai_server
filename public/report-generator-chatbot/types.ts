// [추가됨] 파일 저장소 타입 정의
export interface FileStore {
    image: File[];
    audio: File[];
    file: File[];
}

export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    files?: FileStore; // [수정됨] File[] -> FileStore (구조 맞춤)
}

export interface AppSettings {
    theme: 'light' | 'dark' | 'blue';
    language: 'en' | 'ko' | 'zh' | 'ja';
    writingMode: string;
}