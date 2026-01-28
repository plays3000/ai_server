import fs from 'fs';

// PDF를 Gemini용 데이터로 변환하는 함수
export function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType,
        },
    };
}