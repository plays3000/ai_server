import { readFile } from 'fs/promises';
import path from 'path';
import { pool } from '../config/dbConfig.js'; // 기존에 만든 pool 가져오기

/**
 * JSON 파일을 읽어 특정 테이블에 저장하는 함수
 * @param jsonFileName 실행할 JSON 파일명 (예: 'employees.json')
 * @param tableName 저장할 대상 테이블명
 */
export const insertJsonToDb = async (jsonFileName: string, tableName: string) => {
    let connection;
    try {
        // 1. JSON 파일 읽기 (절대 경로 설정)
        const jsonPath = path.resolve(process.cwd(), 'public', jsonFileName);
        const rawData = await readFile(jsonPath, 'utf8');
        const jsonData = JSON.parse(rawData);

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            console.log('📝 삽입할 데이터가 없습니다.');
            return;
        }

        // 2. 쿼리 생성 (벌크 인서트를 위한 준비)
        // JSON의 key들을 컬럼명으로 추출
        const columns = Object.keys(jsonData[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

        connection = await pool.getConnection();
        console.log(`🚀 ${tableName} 테이블에 ${jsonData.length}건의 데이터 저장을 시작합니다.`);

        // 3. 트랜잭션 시작 (데이터 안전성 보장)
        await connection.beginTransaction();

        for (const item of jsonData) {
            // value들을 배열 순서대로 추출
            const values = columns.map(col => item[col]);
            await connection.query(sql, values);
        }

        await connection.commit();
        console.log(`✅ ${tableName} 저장 완료!`);

    } catch (error) {
        if (connection) await connection.rollback(); // 에러 발생 시 롤백
        if (error instanceof Error) {
            console.error('❌ JSON 저장 중 에러:', error.message);
        }
    } finally {
        if (connection) connection.release();
    }
};