import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    // tools: [{ googleSearch: {} }],
    // ✅ 시스템 지침 추가
    systemInstruction: `
        너는 보고서를 정리해주는 비서야.
        보고서를 읽고 db에 저장할 수 있도록 필요한 데이터를 수집해서 json 형식으로 출력해.
    `
});

// 생성 옵션도 분리하면 관리하기 편합니다.
export const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain"
};
