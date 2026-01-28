// 모델 이름 변환
function getModelName(modelId) {
    // const names = { 'gpt': 'GPT-5', 'gemini': 'Gemini 3', 'claude': 'Claude Sonnet', 'llama': 'LLAMA 4', 'deepseek': 'Deepseek' };
    // return names[modelId] || 'AI Model';
    return 'AI Model';
}

// 모델별 응답 내용 생성
export function getResponseByModel(model, title) {
    // if (model === 'gemini') {
    //     return `<h3 style="color:#4285F4"><i class="fas fa-star"></i> Gemini 3 리포트</h3><hr style="margin:10px 0;"><p>Gemini가 <strong>'${title}'</strong>을(를) 멀티모달로 분석했습니다.</p>`;
    // } else if (model === 'gpt') {
    //     return `<h3 style="color:#10a37f"><i class="fas fa-robot"></i> GPT-5 리포트</h3><hr style="margin:10px 0;"><p>GPT-5가 <strong>'${title}'</strong>에 대한 체계적인 보고서를 작성했습니다.</p>`;
    // } else {
    //     return `<h3><i class="fas fa-brain"></i> ${getModelName(model)} 결과</h3><hr style="margin:10px 0;"><p>요청하신 <strong>'${title}'</strong> 분석이 완료되었습니다.</p>`;
    // }
    return `<h3><i class="fas fa-brain"></i> ${getModelName(model)} 결과</h3><hr style="margin:10px 0;"><p>요청하신 <strong>'${title}'</strong> 분석이 완료되었습니다.</p>`;
}