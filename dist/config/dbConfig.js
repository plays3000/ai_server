// config/dbConfig.js
import mysql from 'mysql2/promise';
import 'dotenv/config';
// Pool 생성 (서버 실행 시 자동으로 연결 관리)
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});
// 연결 테스트용 함수 (선택 사항)
export const connectToDatabase = async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ MySQL DB 연결 성공!');
        conn.release(); // 테스트 후 연결 반환
    }
    catch (err) {
        console.error('❌ DB 연결 실패:', err.message);
    }
};
