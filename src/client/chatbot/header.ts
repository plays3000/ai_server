import { I18nManager } from '../../client/locale/i18n.js';

export class HeaderManager {
    private resetBtn: HTMLButtonElement | null;
    private loginBtn: HTMLButtonElement | null;
    private loginBtnText: HTMLElement | null;
    private loginIcon: HTMLElement | null;
    
    // [추가 1] 양식학습 버튼 변수 선언
    private trainTemplateBtn: HTMLButtonElement | null;

    // 생성자에서 콜백 함수(델리게이트)를 받습니다.
    constructor(private onResetRequest: () => void) {
        this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
        this.loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
        this.loginBtnText = document.getElementById('loginBtnText');
        this.loginIcon = this.loginBtn?.querySelector('i') || null;

        // [추가 2] DOM 요소 가져오기 (HTML id와 일치해야 함)
        this.trainTemplateBtn = document.getElementById('nav-train-template') as HTMLButtonElement;

        this.initializeEvents();
        this.checkLoginStatus(); 
    }

    private initializeEvents(): void {
        // 1. 초기화 버튼 이벤트
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                const msg = I18nManager.getText('alert_reset') || "대화 내용과 첨부파일을 모두 지우시겠습니까?";
                if (confirm(msg)) {
                    this.onResetRequest();
                }
            });
        }

        // 2. 로그인/로그아웃 버튼 이벤트
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.handleLoginClick());
        }

        // [추가 3] 양식학습 버튼 클릭 이벤트
        if (this.trainTemplateBtn) {
            this.trainTemplateBtn.addEventListener('click', () => {
                // 원하는 경로로 이동 (라우터 설정에 따라 주소 변경 필요)
                // 예: '/train-template' 또는 '/content/train' 등
                window.location.href = '/train-template'; 
            });
        }
    }

    private checkLoginStatus(): void {
        if (!this.loginBtn || !this.loginBtnText || !this.loginIcon) return;

        const token = localStorage.getItem('accessToken'); 

        if (token) {
            // [로그인 상태]
            this.loginBtnText.textContent = I18nManager.getText('btn_logout') || '로그아웃';
            this.loginBtn.title = I18nManager.getText('btn_logout') || '로그아웃';
            this.loginIcon.className = 'fas fa-sign-out-alt'; 
            this.loginBtn.classList.add('logged-in'); 
        } else {
            // [비로그인 상태]
            this.loginBtnText.textContent = I18nManager.getText('btn_login') || '로그인';
            this.loginBtn.title = I18nManager.getText('btn_login') || '로그인';
            this.loginIcon.className = 'fas fa-sign-in-alt'; 
            this.loginBtn.classList.remove('logged-in');
        }
    }

    private handleLoginClick(): void {
        const token = localStorage.getItem('accessToken');

        if (token) {
            if (confirm(I18nManager.getText('confirm_logout') || '로그아웃 하시겠습니까?')) {
                localStorage.removeItem('accessToken'); 
                alert(I18nManager.getText('alert_logged_out') || '로그아웃 되었습니다.');
                this.checkLoginStatus(); 
                window.location.reload(); 
            }
        } else {
            window.location.href = '/login'; 
        }
    }
}