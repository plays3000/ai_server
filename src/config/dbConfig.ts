import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', // .env에 없으면 root 사용
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'gemini_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const connectToDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ 데이터베이스 연결 성공');
        connection.release();
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error);
    }
};
