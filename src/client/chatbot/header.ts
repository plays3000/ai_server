import { I18nManager } from '../../client/locale/i18n.js';

export class HeaderManager {
    private resetBtn: HTMLButtonElement | null;
    private loginBtn: HTMLButtonElement | null;
    private loginBtnText: HTMLElement | null;
    private loginIcon: HTMLElement | null;

    // 생성자에서 콜백 함수(델리게이트)를 받습니다.
    constructor(private onResetRequest: () => void) {
        this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
        this.loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
        this.loginBtnText = document.getElementById('loginBtnText');
        this.loginIcon = this.loginBtn?.querySelector('i') || null;

        this.initializeEvents();
        this.checkLoginStatus(); // 시작할 때 로그인 상태 확인
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
    }

    /**
     * 현재 로그인 상태를 확인하고 UI를 업데이트합니다.
     */
    private checkLoginStatus(): void {
        if (!this.loginBtn || !this.loginBtnText || !this.loginIcon) return;

        const token = localStorage.getItem('accessToken'); // 백엔드 연동 시 저장한 토큰 키

        if (token) {
            // [로그인 상태] -> 로그아웃 버튼으로 변경
            this.loginBtnText.textContent = '로그아웃'; // 다국어 적용 시 I18nManager.getText('btn_logout')
            this.loginBtn.title = '로그아웃';
            this.loginIcon.className = 'fas fa-sign-out-alt'; // 나가는 아이콘
            this.loginBtn.classList.add('logged-in'); // 필요 시 CSS 추가 스타일링
        } else {
            // [비로그인 상태] -> 로그인 버튼으로 변경
            this.loginBtnText.textContent = I18nManager.getText('btn_login') || '로그인';
            this.loginBtn.title = '로그인';
            this.loginIcon.className = 'fas fa-sign-in-alt'; // 들어가는 아이콘
            this.loginBtn.classList.remove('logged-in');
        }
    }

    /**
     * 로그인/로그아웃 버튼 클릭 핸들러
     */
    private handleLoginClick(): void {
        const token = localStorage.getItem('accessToken');

        if (token) {
            // [로그아웃 처리]
            if (confirm('로그아웃 하시겠습니까?')) {
                localStorage.removeItem('accessToken'); // 토큰 삭제
                // 필요하다면 사용자 정보도 삭제
                // localStorage.removeItem('userProfile'); 
                
                alert('로그아웃 되었습니다.');
                this.checkLoginStatus(); // UI 갱신
                window.location.reload(); // 페이지 새로고침 (상태 초기화)
            }
        } else {
            // [로그인 페이지로 이동]
            window.location.href = '/login'; // 로그인 페이지 경로 (라우터 설정에 맞게 변경)
        }
    }
}