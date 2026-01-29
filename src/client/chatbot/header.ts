// 상단 헤더의 버튼 이벤트 및 UI 관리 클래스
export class HeaderManager {
    private resetBtn: HTMLButtonElement | null;

    // 초기화 버튼 클릭 시 실행할 콜백 함수를 주입받음
    constructor(private onResetRequest: () => void) {
        this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
        this.initializeEvents();
    }

    // 이벤트 리스너 초기화
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