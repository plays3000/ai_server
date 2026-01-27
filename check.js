import 'dotenv/config';

async function check() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("❌ 에러: .env 파일에 GEMINI_API_KEY가 없습니다!");
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        // 에러 응답이 왔는지 먼저 확인
        if (data.error) {
            console.error("❌ API 에러 발생:", data.error.message);
            return;
        }

        if (data.models) {
            console.log("✅ 사용 가능한 모델 목록:");
            data.models.forEach(m => {
                // generateContent를 지원하는 모델만 출력
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("⚠️ 모델 목록을 찾을 수 없습니다. 응답 데이터:", data);
        }
    } catch (err) {
        console.error("❌ 네트워크 에러:", err.message);
    }
}

check();