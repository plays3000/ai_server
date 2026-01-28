/* ==============================================
   예시값 자동 입력 기능
   ============================================== */
const btnExample = document.getElementById('btnExample');

if (btnExample) {
    btnExample.addEventListener('click', () => {
        const titleInput = document.getElementById('reportTitle');
        const detailInput = document.getElementById('reportDetail');

        // 이미 내용이 있다면 덮어쓸지 물어보기
        if (titleInput.value.trim() !== '' || detailInput.value.trim() !== '') {
            if (!confirm('현재 입력된 내용을 지우고 예시 데이터를 입력하시겠습니까?')) {
                return;
            }
        }

        // 예시 데이터 입력
        titleInput.value = "2024년 상반기 AI 서비스 도입 타당성 검토 보고서";
        detailInput.value = `- 목적: 사내 업무 효율화를 위한 생성형 AI 도입 필요성 분석\n- 주요 내용:\n  1. 국내외 도입 사례 및 효과 분석\n  2. 예상 비용 및 ROI(투자 대비 효과) 산출\n  3. 보안 리스크 및 대응 방안\n- 결론: 3분기 내 시범 도입 추천`;
        
        // 입력창으로 포커스 이동 효과
        detailInput.focus();
    });
}