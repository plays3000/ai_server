
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