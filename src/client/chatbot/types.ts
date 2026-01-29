// 파일 저장소 구조 정의 (종류별로 File 객체 배열 관리)
export interface FileStore {
    image: File[];
    video: File[];
    audio: File[];
    file: File[];
}

// 채팅 메시지 인터페이스 (작성자, 내용, 첨부된 파일들)
export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    files?: FileStore;
}

// 애플리케이션 공통 설정 (테마, 언어, 작성 모드 등)
export interface AppSettings {
    theme: 'light' | 'dark' | 'blue';
    language: 'en' | 'ko' | 'zh' | 'ja';
    writingMode: string;
}