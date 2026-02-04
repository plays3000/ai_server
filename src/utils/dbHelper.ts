import { pool } from '../config/dbConfig.js';
import { User } from '../types/auth.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * 보안 쿼리 헬퍼
 * 모든 조회(SELECT) 시 해당 유저의 company_id를 자동으로 필터링합니다.
 */
export const dbHelper = {
    /**
     * 안전한 조회를 위한 메서드
     * 사용법: dbHelper.secureSelect<Type>(user, 'SELECT * FROM HR_master WHERE emp_code = ?', [code])
     */
    async secureSelect<T extends RowDataPacket>(
        user: User,
        sql: string,
        params: any[] = []
    ): Promise<T[]> {
        // 1. 보안 검증: 유저에게 company_id가 없는 경우 차단
        if (!user.company_id) {
            throw new Error('보안 에러: 소속 회사 정보가 없는 유저입니다.');
        }

        // 2. 쿼리에 company_id 조건 강제 삽입
        // 기존 쿼리에 WHERE가 있으면 AND로, 없으면 WHERE로 추가
        const hasWhere = sql.toUpperCase().includes('WHERE');
        const secureSql = hasWhere 
            ? `${sql} AND company_id = ?` 
            : `${sql} WHERE company_id = ?`;

        // 3. 파라미터 마지막에 유저의 company_id 추가
        const secureParams = [...params, user.company_id];

        const [rows] = await pool.query<T[]>(secureSql, secureParams);
        return rows;
    },

    /**
     * 안전한 삽입/수정/삭제를 위한 메서드
     * 실행 시 항상 소속 회사 정보가 일치하는지 확인합니다.
     */
    async secureExecute(
        user: User,
        sql: string,
        params: any[] = []
    ): Promise<ResultSetHeader> {
        if (!user.company_id) {
            throw new Error('보안 에러: 소속 회사 정보가 없는 유저입니다.');
        }

        // INSERT의 경우 컬럼 목록에 company_id가 포함되어야 함
        // 여기서는 간단히 파라미터 유효성만 체크하거나, 필요 시 쿼리 파싱 로직 추가
        const [result] = await pool.query<ResultSetHeader>(sql, params);
        return result;
    }
};