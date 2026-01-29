import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY2;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY2가 환경 변수에 설정되어 있지 않습니다.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 직접 타입을 정의하여 할당
export const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain"
};

export const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    systemInstruction: `
        너는 보고서를 정리해주는 비서야.
        보고서를 읽고 db에 저장할 수 있도록 필요한 데이터를 수집해서 json 형식으로 출력해.
    `
});