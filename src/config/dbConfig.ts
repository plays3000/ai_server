import mysql from 'mysql2/promise';
import 'dotenv/config';

// DB 연결 설정
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || '', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function connectToDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL 데이터베이스 연결 성공');
        connection.release();
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error);
        process.exit(1);
    }
}