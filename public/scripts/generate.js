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
