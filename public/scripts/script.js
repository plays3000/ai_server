let currentModel = 'gpt'; // 기본 모델
const chatContainer = document.getElementById('chatContainer');

// 파일 데이터 저장소
const filesData = { image: [], audio: [], file: [] };

/* ==========================================================================
   2. 시계 및 모델 선택 기능
   ========================================================================== */
// 모델 선택 칩
const chips = document.querySelectorAll('.model-chip');
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentModel = chip.getAttribute('data-model');
        console.log("선택된 모델:", currentModel);
    });
});


// 초기화 버튼
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        if (confirm("대화 내용과 첨부파일을 모두 지우시겠습니까?")) {
            chatContainer.innerHTML = `
                <div class="message-row ai">
                    <div class="bubble ai-bubble"><i class="fas fa-info-circle"></i> 안녕하세요! 보고서 주제를 입력해주세요.</div>
                </div>`;
            clearAllFiles(true);
        }
    });
}

// 첨부파일이 있을 경우 말풍선에 표시하는 헬퍼 함수
function getAttachedFileSummary() {
    const imgCnt = filesData.image.length;
    const audCnt = filesData.audio.length;
    const fileCnt = filesData.file.length;
    if (imgCnt + audCnt + fileCnt === 0) return '';

    return `
        <div style="margin-top:8px; font-size:0.85rem; opacity:0.9; border-top:1px solid rgba(255,255,255,0.3); padding-top:5px;">
            <i class="fas fa-paperclip"></i> 첨부: 
            ${imgCnt ? `이미지 ${imgCnt}개 ` : ''}
            ${audCnt ? `음성 ${audCnt}개 ` : ''}
            ${fileCnt ? `파일 ${fileCnt}개` : ''}
        </div>
    `;
}

// 엔터키 전송
document.getElementById('reportTitle').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') generateReport();
});

// 상태 아이콘 클릭 시 목록 토글
document.querySelectorAll('.status-item').forEach(item => {
    item.addEventListener('click', () => fileListArea.classList.toggle('active'));
});

// 파일 전체 삭제 함수
document.getElementById('clearAllFiles').addEventListener('click', () => {
    if(confirm('모든 파일을 삭제하시겠습니까?')) clearAllFiles(true);
});