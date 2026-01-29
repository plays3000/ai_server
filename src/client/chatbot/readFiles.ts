import * as fs from 'fs';

/**
 * Gemini API 전송을 위한 파일 데이터 구조 인터페이스
 */
interface GenerativePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

/**
 * 로컬 파일을 읽어 Base64로 인코딩된 Gemini 파트 객체로 변환합니다.
 * @param path 파일 경로 (string 또는 Buffer 등 fs 지원 타입)
 * @param mimeType 파일의 MIME 타입 (예: 'application/pdf', 'image/jpeg')
 */
export function fileToGenerativePart(
  path: fs.PathOrFileDescriptor, 
  mimeType: string
): GenerativePart {
  // fs.readFileSync는 Buffer를 반환하며, 이를 base64 문자열로 변환합니다.
  const data = fs.readFileSync(path).toString("base64");

  return {
    inlineData: {
      data,
      mimeType,
    },
  };
}