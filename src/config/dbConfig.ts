import mysql from 'mysql2/promise';
import { readFile, readdir } from 'fs/promises';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. multipleStatements 옵션 추가 (SQL 파일 실행용)
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'company1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true 
});

export const connectToDatabase = async () => {
    // 타입을 PoolConnection으로 명시
    let connection: mysql.PoolConnection | null = null;
    
    try {
        connection = await pool.getConnection();
        console.log('✅ 데이터베이스 연결 성공');

        const migrationsDir = path.resolve(process.cwd(), 'public/sql');
        
        // 2. 폴더 내 모든 파일 읽기
        const files = await readdir(migrationsDir);
        
        // 3. .sql 확장자만 필터링하고 이름순으로 정렬 (실행 순서 보장 중요!)
        const sqlFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort();

        if (sqlFiles.length === 0) {
            console.log('📝 실행할 SQL 파일이 없습니다.');
            return;
        }

        connection = await pool.getConnection();
        console.log(`✅ DB 연결 성공. 총 ${sqlFiles.length}개의 파일을 처리합니다.`);

        // 4. 반복문을 통한 순차 실행
        for (const file of sqlFiles) {
            const filePath = path.join(migrationsDir, file);
            const sql = await readFile(filePath, 'utf8');

            console.log(`⏳ 실행 중: ${file}`);
            await connection.query(sql);
            console.log(`✨ 완료: ${file}`);
        }

        console.log('🎉 모든 마이그레이션 파일이 성공적으로 실행되었습니다.');

    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ 마이그레이션 중 에러 발생:', error.message);
        }
        throw error; // 상위 호출자에게 에러 전달
    } finally {
        if (connection) {
            connection.release();
            console.log('🔌 DB 커넥션 풀 반납 완료');
        }
    }
};
