import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    // 개발 모드 설정 (배포 시 'production'으로 변경 가능)
    mode: 'development',
    
    // 빌드 시작점 (메인 챗봇 로직)
    entry: './src/client/chatbot/chatbot.ts',
    
    // TypeScript 파일 처리 규칙
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    
    // 파일 확장자 해석 순서
    resolve: {
        extensions: ['.ts', '.js'],
        // ESM 모듈의 .js 확장자 임포트를 .ts로 해석하도록 설정
        extensionAlias: {
            '.js': ['.ts', '.js'],
        },
    },
    
    // 최종 빌드 결과물 저장 위치 및 파일명
    output: {
        filename: 'chatbot.bundle.js',
        path: path.resolve(__dirname, 'public/js'),
        clean: true, // 빌드 시 이전 파일 삭제
    },
};