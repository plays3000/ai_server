import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'development',
    optimization: {
        minimize: false, // 난독화를 방지
    },
    devtool: 'eval-source-map',
    
    entry: './src/index.js',
    output: {
        filename: "./public/main.js",
        path: path.resolve(__dirname, "public"),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    
    // 4. 확장자 및 별칭(Alias) 처리
    resolve: {
        // .json 확장자를 추가해야 config.json을 찾을 수 있습니다.
        extensions: ['.ts', '.js', '.json'], 
        extensionAlias: {
            '.js': ['.ts', '.js'],
        },
        // 별칭 추가
        alias: {
            "@config": path.resolve(__dirname, "config.json"),
        },
    },
    
    output: {
        filename: 'chatbot.bundle.js',
        path: path.resolve(__dirname, 'public/js'),
        clean: true,
    },
};