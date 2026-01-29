import type { AppSettings } from './types.js';

// 하단 시계, 설정 모달 및 테마 제어 클래스
export class FooterManager {
    private modal: HTMLElement | null;
    private clockEl: HTMLElement | null;

    constructor() {
        this.modal = document.getElementById('settingModal');
        this.clockEl = document.getElementById('realTimeClock');
        
        this.initializeClock();
        this.initializeSettings();
    }

    // 1초마다 현재 시간을 업데이트하는 시계 기능
    private initializeClock(): void {
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ko-KR', { 
                hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
            if (this.clockEl) this.clockEl.innerText = timeString;
        }, 1000);
    }

    // 설정 모달 열기/닫기 및 버튼 이벤트 바인딩
    private initializeSettings(): void {
        const openBtn = document.querySelector('.status-btn[title="화면 설정"]');
        const closeBtn = document.getElementById('closeModalX');
        const applyBtn = document.getElementById('btnApply');
        const okBtn = document.getElementById('btnOk');

        // 모달 표시 및 숨김 이벤트
        openBtn?.addEventListener('click', () => this.modal?.classList.add('show'));
        closeBtn?.addEventListener('click', () => this.modal?.classList.remove('show'));

        // 설정 적용 핸들러
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

    // 선택된 값에 따라 테마(CSS 변수)와 쓰기 모드 적용
    private applyThemeAndMode(): void {
        const writingMode = (document.getElementById('writingModeSelect') as HTMLSelectElement).value;
        const theme = (document.getElementById('themeSelect') as HTMLSelectElement).value;
        const root = document.documentElement;

        // body 클래스 변경을 통한 쓰기 모드 전환
        document.body.className = ''; 
        document.body.classList.add(writingMode);

        // 테마 선택에 따른 전역 CSS 변수 업데이트
        if (theme === 'dark') {
            root.style.setProperty('--bg-color', '#222222');
            root.style.setProperty('--white', '#333333');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--gray-light', '#444444');
            root.style.setProperty('--gray-text', '#cccccc');
            root.style.setProperty('--input-bg-color', '#333333');
            root.style.setProperty('--bubble-ai-bg-color', '#333333');
            root.style.setProperty('--bubble-ai-text-color', '#ffffff');
            root.style.setProperty('--footer-text-color', '#cccccc');
            root.style.setProperty('--file-list-bg-color', '#444444');
        } else {
            // 라이트 모드 기본값 복구
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