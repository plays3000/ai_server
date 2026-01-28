const chatContainer = document.getElementById('chatContainer');
let currentModel = 'gpt'; // 기본 모델

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

/* ==========================================================================
   3. 보고서 생성 (채팅) 로직
   ========================================================================== */

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const fileInput = document.getElementById('pdf-file'); // HTML에 <input type="file" id="pdf-file">이 있어야 함
    const message = userInput.value;

    if (!message) return;

    // 내 메시지 화면에 추가
    chatBox.innerHTML += `<div class="user"><b>나:</b> ${message}</div>`;
    userInput.value = '';

    // 1. FormData 객체 생성
    const formData = new FormData();
    formData.append('message', message); // 텍스트 메시지 추가

    // 2. 파일이 선택되었다면 FormData에 추가
    if (fileInput.files && fileInput.files[0]) {
        formData.append('pdfFile', fileInput.files[0]);
    }

    try {
        // 3. fetch 요청 (Content-Type 헤더를 직접 설정하지 마세요! 브라우저가 자동 설정합니다.)
        const response = await fetch('/chat', {
            method: 'POST',
            body: formData 
        });

        const data = await response.json();
        
        // AI 답변 화면에 추가
        chatBox.innerHTML += `<div class="bot"><b>AI:</b> ${data.reply}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        // 전송 후 파일 선택 초기화 (선택사항)
        fileInput.value = '';

    } catch (error) {
        console.error('에러 발생:', error);
        chatBox.innerHTML += `<div style="color:red">서버와 연결할 수 없습니다.</div>`;
    }
}

function generateReport() {
    const titleInput = document.getElementById('reportTitle');
    const detailInput = document.getElementById('reportDetail');
    const title = titleInput.value.trim();
    const detail = detailInput.value.trim();

    if (!title) {
        alert("보고서 주제를 입력해주세요!");
        titleInput.focus();
        return;
    }

    // 1. 사용자 메시지 표시
    const userHtml = `
        <div class="message-row user">
            <div class="bubble user-bubble">
                <strong>${title}</strong>
                ${detail ? detail.replace(/\n/g, '<br>') : ''}
                ${getAttachedFileSummary()} </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('afterbegin', userHtml);
    
    // 입력 초기화
    titleInput.value = '';
    detailInput.value = '';
    clearAllFiles(false); // 파일 데이터 초기화 (화면만)

    // 2. AI 로딩 표시
    const loadingId = 'loading-' + Date.now();
    const loadingHtml = `
        <div class="message-row ai" id="${loadingId}">
            <div class="bubble ai-bubble">
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                    &nbsp; <strong>${getModelName(currentModel)}</strong>가 작성 중입니다...
                </div>
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('afterbegin', loadingHtml);

    // 3. AI 응답 시뮬레이션 (2초 후)
    setTimeout(() => {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        const responseContent = getResponseByModel(currentModel, title);
        const aiResponseHtml = `
            <div class="message-row ai">
                <div class="bubble ai-bubble">
                    ${responseContent}
                </div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('afterbegin', aiResponseHtml);
    }, 2000);
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

function clearAllFiles(resetInput) {
    filesData.image = [];
    filesData.audio = [];
    filesData.file = [];
    updateFileStatus();
    if (resetInput) {
        realFileInput.value = '';
        realImageInput.value = '';
    }
}

function updateFileStatus() {
    const totalCount = filesData.image.length + filesData.audio.length + filesData.file.length;
    if (totalCount > 0) {
        fileStatusArea.style.display = 'flex';
    } else {
        fileStatusArea.style.display = 'none';
        fileListArea.classList.remove('active');
    }
    document.getElementById('countImage').innerText = filesData.image.length;
    document.getElementById('countAudio').innerText = filesData.audio.length;
    document.getElementById('countFile').innerText = filesData.file.length;
}

// 모델 이름 변환
function getModelName(modelId) {
    // const names = { 'gpt': 'GPT-5', 'gemini': 'Gemini 3', 'claude': 'Claude Sonnet', 'llama': 'LLAMA 4', 'deepseek': 'Deepseek' };
    // return names[modelId] || 'AI Model';
    return 'AI Model';
}

// 모델별 응답 내용 생성
function getResponseByModel(model, title) {
    // if (model === 'gemini') {
    //     return `<h3 style="color:#4285F4"><i class="fas fa-star"></i> Gemini 3 리포트</h3><hr style="margin:10px 0;"><p>Gemini가 <strong>'${title}'</strong>을(를) 멀티모달로 분석했습니다.</p>`;
    // } else if (model === 'gpt') {
    //     return `<h3 style="color:#10a37f"><i class="fas fa-robot"></i> GPT-5 리포트</h3><hr style="margin:10px 0;"><p>GPT-5가 <strong>'${title}'</strong>에 대한 체계적인 보고서를 작성했습니다.</p>`;
    // } else {
    //     return `<h3><i class="fas fa-brain"></i> ${getModelName(model)} 결과</h3><hr style="margin:10px 0;"><p>요청하신 <strong>'${title}'</strong> 분석이 완료되었습니다.</p>`;
    // }
    return `<h3><i class="fas fa-brain"></i> ${getModelName(model)} 결과</h3><hr style="margin:10px 0;"><p>요청하신 <strong>'${title}'</strong> 분석이 완료되었습니다.</p>`;
}