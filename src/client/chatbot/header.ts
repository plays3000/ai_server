export class HeaderManager {
    private resetBtn: HTMLButtonElement | null;

    // 생성자에서 콜백 함수(델리게이트)를 받습니다.
    constructor(private onResetRequest: () => void) {
        this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
        this.initializeEvents();
    }

    private initializeEvents(): void {
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                if (confirm("대화 내용과 첨부파일을 모두 지우시겠습니까?")) {
                    this.onResetRequest(); // 메인 로직의 초기화 함수 호출
                }
            });
        }
    }
}