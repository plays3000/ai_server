// 상단 헤더의 버튼 이벤트 및 UI 관리 클래스
export class HeaderManager {
    private resetBtn: HTMLButtonElement | null;
    private userInfoEl: HTMLElement | null; // 사용자 정보가 표시될 엘리먼트

    // 초기화 버튼 클릭 시 실행할 콜백 함수를 주입받음
    constructor(private onResetRequest: () => void) {
        this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
        this.userInfoEl = document.getElementById('header-user-info');
        
        this.initializeEvents();
        this.fetchAndDisplayUserInfo(); // 객체 생성 시 사용자 정보 로드 시작
    }

    /**
     * 서버로부터 내 정보를 가져와 헤더에 표시합니다.
     */
    private async fetchAndDisplayUserInfo(): Promise<void> {
        try {
            const response = await fetch('/auth/me');
            const data = await response.json();

            if (data.success && data.user) {
                const user = data.user;
                
                // 1. 헤더 텍스트 업데이트
                if (this.userInfoEl) {
                    const company = user.company_name || '개인';
                    const rank = user.rank_name || user.position || '사원';
                    this.userInfoEl.innerText = `[${company}] ${user.name} ${rank}`;
                }

                // 2. 전역 변수에 저장 (타 모듈에서 자동채우기 등에 활용 가능)
                (window as any).currentUser = user;
            }
        } catch (err) {
            // 로그인 전이거나 세션이 없는 경우 조용히 넘어갑니다.
            console.log('Header: User information not available.');
        }
    }

    // 이벤트 리스너 초기화 (기존 로직 유지)
    private initializeEvents(): void {
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                // 사용자 확인 후 메인 앱의 초기화 로직 실행
                if (confirm("대화 내용과 첨부파일을 모두 지우시겠습니까?")) {
                    this.onResetRequest();
                }
            });
        }
    }
}