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


/* ==========================================================================
   6. 설정(Settings) 및 다국어 쓰기 모드 로직
   ========================================================================== */
const settingModal = document.getElementById('settingModal');
// 설정 버튼 찾기 (하단 상태바)
const openSettingBtn = document.querySelector('.status-btn[title="화면 설정"]');
const closeModalX = document.getElementById('closeModalX');
const btnCancel = document.getElementById('btnCancel');
const btnApply = document.getElementById('btnApply');
const btnOk = document.getElementById('btnOk');

if (openSettingBtn) openSettingBtn.addEventListener('click', () => settingModal.classList.add('show'));
if (closeModalX) closeModalX.addEventListener('click', () => settingModal.classList.remove('show'));
if (btnCancel) btnCancel.addEventListener('click', () => settingModal.classList.remove('show'));

// [핵심] 설정 적용 함수 (CSS 리팩토링 대응)
function applySettings() {
    const writingMode = document.getElementById('writingModeSelect').value;
    const theme = document.getElementById('themeSelect').value;

    // 1. 클래스 초기화
    document.body.classList.remove(
        'vertical-rl', 'vertical-lr-mongolian', 'vertical-lr-maya',
        'horizontal-rtl', 'horizontal-ltr'
    );

    // 2. 쓰기 모드 적용
    if (writingMode === 'vertical-rl') document.body.classList.add('vertical-rl');
    else if (writingMode === 'vertical-lr-mongolian') document.body.classList.add('vertical-lr-mongolian');
    else if (writingMode === 'vertical-lr-maya') document.body.classList.add('vertical-lr-maya');
    else if (writingMode === 'horizontal-rtl') document.body.classList.add('horizontal-rtl');
    else if (writingMode === 'horizontal-ltr') document.body.classList.add('horizontal-ltr');

    // 3. 테마 적용
    const root = document.documentElement;
    if (theme === 'dark') {
        root.style.setProperty('--bg-color', '#222');
        root.style.setProperty('--white', '#333');
        root.style.setProperty('--text-color', '#fff');
        root.style.setProperty('--gray-light', '#444');
        root.style.setProperty('--gray-text', '#d0d0d0');
    } else {
        root.style.setProperty('--bg-color', '#f4f6f8');
        root.style.setProperty('--white', '#ffffff');
        root.style.setProperty('--text-color', '#333');
        root.style.setProperty('--gray-light', '#e0e0e0');
        root.style.setProperty('--gray-text', '#666');
    }
}

if (btnApply) {
    btnApply.addEventListener('click', () => { applySettings(); alert('설정이 적용되었습니다.'); });
}
if (btnOk) {
    btnOk.addEventListener('click', () => { applySettings(); settingModal.classList.remove('show'); });
}

/* ==========================================================================
   4. 파일 업로드 및 관리 로직
   ========================================================================== */
const realFileInput = document.getElementById('realFileInput');
const realImageInput = document.getElementById('realImageInput');
const fileStatusArea = document.getElementById('fileStatusArea');
const fileListArea = document.getElementById('fileListArea');

// 버튼 연결
document.getElementById('btnAttachFile').addEventListener('click', () => realFileInput.click());
document.getElementById('btnAttachImage').addEventListener('click', () => realImageInput.click());

// 파일 변경 감지
realFileInput.addEventListener('change', (e) => handleFiles(e.target.files));
realImageInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) filesData.image.push(file);
        else if (file.type.startsWith('audio/')) filesData.audio.push(file);
        else filesData.file.push(file);
    });
    updateFileStatus();
    renderFileList();
}

function renderFileList() {
    fileListArea.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'file-grid';

    // (1) 이미지 파일
    filesData.image.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        grid.innerHTML += `
            <div class="file-item-box">
                <div class="file-remove-btn" onclick="removeOneFile('image', ${index})">&times;</div>
                <img src="${url}" class="thumb-img">
                <span class="file-name">${file.name}</span>
            </div>
        `;
    });

    // (2) 오디오 파일
    filesData.audio.forEach((file, index) => {
        grid.innerHTML += `
            <div class="file-item-box">
                <div class="file-remove-btn" onclick="removeOneFile('audio', ${index})">&times;</div>
                <div class="thumb-icon"><i class="fas fa-volume-up"></i></div>
                <span class="file-name">${file.name}</span>
            </div>
        `;
    });

    // (3) 일반 파일
    filesData.file.forEach((file, index) => {
        grid.innerHTML += `
            <div class="file-item-box">
                <div class="file-remove-btn" onclick="removeOneFile('file', ${index})">&times;</div>
                <div class="thumb-icon"><i class="fas fa-paperclip"></i></div>
                <span class="file-name">${file.name}</span>
            </div>
        `;
    });

    fileListArea.appendChild(grid);
}

// 2. 개별 파일 삭제 함수
function removeOneFile(type, index) {
    // 해당 종류의 배열에서 index 번째 파일을 제거 (splice)
    filesData[type].splice(index, 1);
    
    // 화면 갱신
    updateFileStatus(); // 상단 개수 업데이트
    renderFileList();   // 목록 다시 그리기
}

// 상태 아이콘 클릭 시 목록 토글
document.querySelectorAll('.status-item').forEach(item => {
    item.addEventListener('click', () => fileListArea.classList.toggle('active'));
});

// 파일 전체 삭제 함수
document.getElementById('clearAllFiles').addEventListener('click', () => {
    if(confirm('모든 파일을 삭제하시겠습니까?')) clearAllFiles(true);
});

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

/* ==========================================================================
   3. 보고서 생성 (채팅) 로직
   ========================================================================== */
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

async function generateReport() {
    const titleInput = document.getElementById('reportTitle');
    const detailInput = document.getElementById('reportDetail');
    const fileInput = document.getElementById('pdf-file');
    // const chatContainer = document.getElementById('chat-box'); // 또는 기존의 chatContainer

    const title = titleInput.value.trim();
    const detail = detailInput.value.trim();

    // 1. 유효성 검사
    if (!title) {
        alert("보고서 주제를 입력해주세요!");
        titleInput.focus();
        return;
    }

    // 2. 사용자 메시지 화면에 표시
    const userHtml = `
        <div class="message-row user">
            <div class="bubble user-bubble">
                <strong>${title}</strong><br>
                ${detail ? detail.replace(/\n/g, '<br>') : ''}
                ${typeof getAttachedFileSummary === 'function' ? getAttachedFileSummary() : ''}
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('afterbegin', userHtml);

    // 3. 로딩 표시 시작
    const loadingId = 'loading-' + Date.now();
    const loadingHtml = `
        <div class="message-row ai" id="${loadingId}">
            <div class="bubble ai-bubble">
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                    &nbsp; <strong>AI</strong>가 작성 중입니다...
                </div>
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('afterbegin', loadingHtml);

    // 4. 데이터 준비 (FormData)
    // const formData = new FormData();
    // formData.append('title', title);
    // formData.append('detail', detail);
    // formData.append('model', currentModel); // 선택된 모델 정보 추가

    // // [수정 포인트] filesData에 저장된 모든 파일을 formData에 추가
    // // 일반 파일(PDF 포함) 추가
    // filesData.file.forEach((file) => {
    //     formData.append('pdfFile', file); // 서버에서 받는 키값에 맞춰 수정
    // });
    
    // // 이미지 파일도 필요하다면 추가
    // filesData.image.forEach((file) => {
    //     formData.append('images', file);
    // });

    const formData = new FormData();
    formData.append('title', title);
    formData.append('detail', detail);
    formData.append('model', currentModel); // 현재 선택된 gpt, gemini 등의 모델명

    // [핵심] 여러 개의 PDF/일반 파일 처리
    if (filesData.file && filesData.file.length > 0) {
        filesData.file.forEach((file) => {
            // 서버의 Multer가 'pdfFiles'라는 이름으로 여러 장을 받도록 설정되어야 함
            formData.append('pdfFile', file); 
        });
    }

    // [핵심] 이미지 파일도 여러 장이 있다면 포함
    if (filesData.image && filesData.image.length > 0) {
        filesData.image.forEach((file) => {
            formData.append('images', file);
        });
    }

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            body: formData  // 이제 진짜 파일이 포함되어 전송됩니다.
        });

        if (!response.ok) throw new Error('서버 응답 오류');

        const data = await response.json();

        // 6. 로딩 제거 및 AI 답변 출력
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        const aiResponseHtml = `
            <div class="message-row ai">
                <div class="bubble ai-bubble">
                    ${data.reply}
                </div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('afterbegin', aiResponseHtml);

    } catch (error) {
        console.error('에러 발생:', error);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();
        
        chatContainer.insertAdjacentHTML('afterbegin', `
            <div class="message-row ai">
                <div class="bubble ai-bubble" style="color:red">
                    오류가 발생했습니다. 다시 시도해주세요.
                </div>
            </div>
        `);
    } finally {
        if (fileInput) fileInput.value = '';
        if (typeof clearAllFiles === 'function') clearAllFiles(false);
    }
}
