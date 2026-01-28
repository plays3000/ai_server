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
