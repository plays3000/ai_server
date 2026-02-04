import { Request, Response, NextFunction } from 'express';
import { User } from '../types/auth.js';

/**
 * 1. 기본 로그인 확인
 * - 단순히 로그인만 되어 있으면 통과
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
    // (API 요청인 경우 401 에러를 뱉도록 분기 처리를 할 수도 있음)
    if (req.xhr || req.headers.accept?.indexOf('json')! > -1) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    res.redirect('/auth/login');
};

/**
 * 2. [보안 강화] 회사 소속 확인 (Tenant Check)
 * - 로그인은 했지만, 회사(company_id)가 할당되지 않은 유령 유저 차단
 * - 또는 관리자 승인(is_approved) 대기 중인 유저 차단
 */
export const isCompanyMember = (req: Request, res: Response, next: NextFunction) => {
    // 먼저 로그인 여부 체크
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }

    const user = req.user as User;

    // 회사 ID가 없으면 '소속 없음' 상태
    if (!user.company_id) {
        return res.status(403).send(`
            <script>
                alert('소속된 회사가 없습니다. 회사 생성 또는 초대가 필요합니다.');
                window.location.href = '/auth/setup-company'; // 회사 설정 페이지로 이동
            </script>
        `);
    }

    // (선택 사항) 관리자 승인이 필요한 경우
    /*
    if (user.is_approved === 0) {
        return res.status(403).send('관리자 승인 대기 중입니다.');
    }
    */

    next();
};

/**
 * 3. [보안 강화] 관리자 권한 확인
 * - 특정 직급 이상(rank_level >= 9)이거나 role이 'admin'인 경우만 통과
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }

    const user = req.user as User;

    if (user.role === 'admin' || (user.rank_level && user.rank_level >= 9)) {
        return next();
    }

    res.status(403).json({ message: '관리자 권한이 필요합니다.' });
};