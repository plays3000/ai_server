import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    // 1. 모드 설정 (에러 로그의 경고 해결)
    mode: 'development',
    
    // 2. 진입점 설정 (기존 src/index.js 대신 실제 경로 지정)
    entry: './src/client/chatbot/chatbot.ts',
    
    // 3. TypeScript 처리 규칙
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    
    // 4. 확장자 처리
    resolve: {
        extensions: ['.ts', '.js'],
        extensionAlias: {
            '.js': ['.ts', '.js'],
        },
    },
    
    // 5. 출력 설정
    output: {
        filename: 'chatbot.bundle.js',
        path: path.resolve(__dirname, 'public/js'),
        clean: true,
    },
};