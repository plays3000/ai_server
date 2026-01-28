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
    }

    private applyThemeAndMode(): void {
        const writingMode = (document.getElementById('writingModeSelect') as HTMLSelectElement).value;
        const theme = (document.getElementById('themeSelect') as HTMLSelectElement).value;
        const root = document.documentElement;

        // 1. 쓰기 모드 초기화 및 적용
        document.body.className = ''; // 기존 클래스 제거
        document.body.classList.add(writingMode);

        // 2. 테마 적용
        if (theme === 'dark') {
            root.style.setProperty('--bg-color', '#222');
            root.style.setProperty('--text-color', '#fff');
        } else {
            root.style.setProperty('--bg-color', '#f4f6f8');
            root.style.setProperty('--text-color', '#333');
        }
    }
}