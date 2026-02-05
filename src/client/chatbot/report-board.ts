// client/board.ts

export class BoardManager {
    private container: HTMLElement;
    private onCloseCallback: () => void;

    /**
     * @param targetElement 보드가 그려질 부모 요소 (주로 main-content)
     * @param onClose 보드가 닫힐 때 실행할 함수 (채팅창 복귀용)
     */
    constructor(targetElement: HTMLElement, onClose: () => void) {
        this.container = targetElement;
        this.onCloseCallback = onClose;
    }

    /**
     * 보드 화면을 보여줍니다.
     */
    public show(): void {
        // 1. HTML 템플릿 주입 (서버 API가 있다면 fetch로 대체 가능)
        this.container.innerHTML = this.getBoardTemplate();

        // 2. 닫기 버튼 이벤트 연결
        const closeBtn = document.getElementById('closeBoardBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.onCloseCallback(); // 챗봇 화면으로 돌아가기
            });
        }
    }

    /**
     * HTML 문자열을 반환합니다.
     */
    private getBoardTemplate(): string {
        return `
            <div class="board-container">
                <div class="board-header">
                    <h2>생성된 보고서 목록</h2>
                    <button class="close-board-btn" id="closeBoardBtn"><i class="fas fa-times"></i></button>
                </div>
                
                <div class="board-columns">
                    <div class="board-column">
                        <div class="column-header color-finance">
                            <span class="col-title">회계 (Accounting)</span>
                            <span class="col-count">3</span>
                        </div>
                        <div class="card-list">
                            <div class="report-card">
                                <div class="card-title">2024년 1분기 결산</div>
                                <div class="card-desc">매출액 및 영업이익 상세 분석 포함</div>
                                <div class="card-meta"><i class="far fa-clock"></i> 10분 전</div>
                            </div>
                            <div class="report-card">
                                <div class="card-title">세무 조정 보고서</div>
                                <div class="card-desc">법인세 신고 관련 주요 조정 항목</div>
                                <div class="card-meta"><i class="far fa-clock"></i> 2시간 전</div>
                            </div>
                            <div class="report-card">
                                <div class="card-title">감가상각비 명세서</div>
                                <div class="card-desc">자산별 내용연수 및 상각액</div>
                                <div class="card-meta"><i class="far fa-clock"></i> 1일 전</div>
                            </div>
                        </div>
                    </div>

                    <div class="board-column">
                        <div class="column-header color-hr">
                            <span class="col-title">인사 (HR)</span>
                            <span class="col-count">2</span>
                        </div>
                        <div class="card-list">
                            <div class="report-card">
                                <div class="card-title">상반기 채용 계획</div>
                                <div class="card-desc">부서별 TO 및 예상 인건비 산출</div>
                                <div class="card-meta"><i class="far fa-clock"></i> 30분 전</div>
                            </div>
                            <div class="report-card">
                                <div class="card-title">인사고과 평가 기준안</div>
                                <div class="card-desc">성과지표(KPI) 재설정 및 등급 배분</div>
                                <div class="card-meta"><i class="far fa-clock"></i> 5시간 전</div>
                            </div>
                        </div>
                    </div>

                    <div class="board-column">
                        <div class="column-header color-labor">
                            <span class="col-title">노무 (Labor)</span>
                            <span class="col-count">1</span>
                        </div>
                        <div class="card-list">
                            <div class="report-card">
                                <div class="card-title">주 52시간 근무 현황</div>
                                <div class="card-desc">초과근무 내역 및 연차 사용 촉진안</div>
                                <div class="card-meta"><i class="far fa-clock"></i> 어제</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}