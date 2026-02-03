import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai";
import { SchemaType } from "@google/generative-ai"; // 1. SchemaType 임포트
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 환경 변수에 설정되어 있지 않습니다. .env 파일을 확인해주세요.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 1. 설정 객체에 명시적 타입 부여
export const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain"
};

// 2. 모델 설정 및 시스템 프롬프트 정의
export const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig, // 정의한 설정을 모델에 주입
    systemInstruction: `
        너는 보고서를 정리해주는 비서야.
        보고서를 읽고 DB에 저장할 수 있도록 필요한 데이터를 수집해서 JSON 형식으로 출력해.
    `
});

export const chatbot = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig, // 정의한 설정을 모델에 주입
    // tools: [
    //     {
    //         googleSearchRetrieval: {},
    //     }
    // ]
    tools: [
    {
        googleSearchRetrieval: {},
        codeExecution: {},
        functionDeclarations: [
            {
                name: "get_user_orders",
                description: "특정 사용자의 최근 주문 내역을 DB에서 가져옵니다.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        userId: { type: SchemaType.NUMBER, description: "사용자 고유 ID" }
                    },
                    required: ["userId"]
                }
            }
        ]
    }
],
});