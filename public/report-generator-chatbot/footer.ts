import { AppSettings } from './types.js';

export class FooterManager {
    private modal: HTMLElement | null;
    private clockEl: HTMLElement | null;

    constructor() {
        this.modal = document.getElementById('settingModal');
        this.clockEl = document.getElementById('realTimeClock');
        
        this.initializeClock();
        this.initializeSettings();
    }

    // 시계 기능
    private initializeClock(): void {
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ko-KR', { 
                hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
            if (this.clockEl) this.clockEl.innerText = timeString;
        }, 1000);
    }

    // 설정 모달 및 적용 기능
    private initializeSettings(): void {
        const openBtn = document.querySelector('.status-btn[title="화면 설정"]');
        const closeBtn = document.getElementById('closeModalX');
        const applyBtn = document.getElementById('btnApply');
        const okBtn = document.getElementById('btnOk');

        // 이벤트 바인딩
        openBtn?.addEventListener('click', () => this.modal?.classList.add('show'));
        closeBtn?.addEventListener('click', () => this.modal?.classList.remove('show'));

        const applyHandler = () => {
            this.applyThemeAndMode();
            alert('설정이 적용되었습니다.');
        };

        applyBtn?.addEventListener('click', applyHandler);
        okBtn?.addEventListener('click', () => {
            this.applyThemeAndMode();
            this.modal?.classList.remove('show');
        });
        
    }private applyThemeAndMode(): void {
        const writingMode = (document.getElementById('writingModeSelect') as HTMLSelectElement).value;
        const theme = (document.getElementById('themeSelect') as HTMLSelectElement).value;
        const root = document.documentElement;

        // 1. 쓰기 모드 적용
        document.body.className = ''; 
        document.body.classList.add(writingMode);

        // 2. 테마 적용 (모든 CSS 변수 업데이트)
        if (theme === 'dark') {
            root.style.setProperty('--bg-color', '#222222');        // 전체 배경
            root.style.setProperty('--white', '#333333');           // 박스 배경 (입력창, 모달 등)
            root.style.setProperty('--text-color', '#ffffff');      // 기본 글자
            root.style.setProperty('--gray-light', '#444444');      // 테두리
            root.style.setProperty('--gray-text', '#cccccc');       // 보조 글자 (밝게)
            root.style.setProperty('--input-bg-color', '#333333');  // 입력창 배경
            root.style.setProperty('--bubble-ai-bg-color', '#333333'); // AI 말풍선 배경
            root.style.setProperty('--bubble-ai-text-color', '#ffffff'); // AI 말풍선 글자
            root.style.setProperty('--footer-text-color', '#cccccc');
            root.style.setProperty('--file-list-bg-color', '#444444');
        } else {
            // 라이트 모드 (기본값 복구)
            root.style.setProperty('--bg-color', '#f4f6f8');
            root.style.setProperty('--white', '#ffffff');
            root.style.setProperty('--text-color', '#333');
            root.style.setProperty('--gray-light', '#e0e0e0');
            root.style.setProperty('--gray-text', '#888');
            root.style.setProperty('--input-bg-color', '#ffffff');
            root.style.setProperty('--bubble-ai-bg-color', '#ffffff');
            root.style.setProperty('--bubble-ai-text-color', '#333');
            root.style.setProperty('--footer-text-color', '#888');
            root.style.setProperty('--file-list-bg-color', '#ffffff');
        }
    }
}