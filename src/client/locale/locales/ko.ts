import { LocaleResource, LocaleInfo } from '../types.js';

export const ko_info: LocaleInfo = {
    lang_code: "ko",
    lang_name: "한국어",
    lang_direction: 6,
}; 

export const ko: LocaleResource = {
    app_title: "AI 기반 보고서 생성기",
    btn_reset: "초기화",
    reset_chat: "대회 초기화",
    alert_reset: "대화 내용과 첨부파일을 모두 지우시겠습니까?",

    welcome_msg: "안녕하세요! 작성하고 싶은 보고서의 주제와 상세 내용을 입력해주세요.",
    ai_analyzing: "에 대한 분석 결과입니다.",

    placeholder_title: "보고서 주제 또는 제목을 입력하세요...",
    btn_generate: "생성",
    placeholder_detail: "여기에 상세 요구사항이나 추가 설명을 입력하세요 (선택사항)",
    btn_example: "예시값",

    icon_finance: "재무",
    icon_accounting: "회계",
    icon_hr: "인사",
    icon_file: "파일",
    icon_image: "이미지",
    icon_voice: "음성",

    modal_title: "환경 설정",
    label_theme: "화면 테마",
    label_writing_mode: "쓰기 방향",
    btn_apply: "적용",
    btn_confirm: "확인",

    opt_horizontal_ltr: "가로쓰기 (좌 → 우: 기본)",
    opt_horizontal_rtl: "가로쓰기 (우 → 좌: 아람/히브리)",
    opt_vertical_rl: "세로쓰기 (우 → 좌: 한/중/일)",
    opt_vertical_lr_mongolian: "세로쓰기 (좌 → 우: 몽골/만주)",
    opt_vertical_lr_maya: "세로쓰기 (좌 → 우: 마야/블록)",

    tooltip_lang_select: "언어 선택",
    tooltip_settings: "화면 설정",
    btn_settings: "설정",

    btn_login: "로그인",
    btn_logout: "로그아웃",
    btn_signup: "회원가입",
    btn_train_template: "양식학습",
    nav_login: "로그인",
    nav_logout: "로그아웃",
    nav_signup: "회원가입",
    nav_train_template: "양식학습",

    // 사용자 정보 (라벨용)
    user_idx: "고유번호",
    user_id: "아이디",
    user_password: "비밀번호",
    user_name: "이름",
    user_phone: "전화번호",
    user_email: "이메일",

    // 그룹 & 기업 정보
    group_name: "그룹명",
    group_company_reg_num: "사업자등록번호",
    company_name: "회사명",
    company_belonging_group_code: "소속 그룹 코드",

    // 로그인 페이지
    title_login: "로그인",
    lbl_id: "아이디",
    placeholder_id: "아이디를 입력하세요",
    lbl_password: "비밀번호",
    placeholder_password: "비밀번호를 입력하세요",
    link_find_id: "아이디 찾기",
    link_find_pw: "비밀번호 찾기",
    btn_login_action: "로그인",
    btn_go_signup: "회원가입",
    lbl_social_login: "소셜 계정으로 로그인",
    confirm_logout: "로그아웃 하시겠습니까?",
    alert_logged_out: "로그아웃 되었습니다.",

    // 회원가입 페이지 - 공통
    title_signup: "회원가입",
    lbl_basic_info: "기본 정보",
    lbl_confirm_id: "아이디 확인",
    placeholder_confirm_id: "아이디를 다시 입력하세요",
    lbl_confirm_pw: "비밀번호 확인",
    placeholder_confirm_pw: "비밀번호를 다시 입력하세요",
    lbl_name: "이름",
    placeholder_name: "실명을 입력하세요",
    lbl_phone: "전화번호",
    placeholder_phone: "010-0000-0000",
    lbl_email: "이메일",
    placeholder_email: "example@email.com",
    lbl_select_role: "가입 유형 선택",

    // 가입 유형 카드
    role_group_title: "그룹 창설",
    role_group_desc: "여러 회사를 관리하는<br>그룹 관리자",
    role_company_title: "법인 창설",
    role_company_desc: "독립된 회사 또는<br>그룹 산하 법인",
    role_employee_title: "일반 직원",
    role_employee_desc: "초대 코드를 통해<br>회사에 소속",

    // 입력 필드 (그룹/법인/직원)
    lbl_group_name: "그룹명",
    placeholder_group_name: "설립할 그룹명을 입력하세요",
    lbl_business_num: "사업자등록번호",
    placeholder_business_num: "- 없이 숫자만 입력",
    
    lbl_company_name: "회사명 (법인명)",
    placeholder_company_name: "회사 이름을 입력하세요",
    lbl_parent_group_code: "소속 그룹 코드",
    placeholder_parent_group_code: "그룹 코드가 있다면 입력",
    lbl_rep_position: "대표자 직급",
    placeholder_rep_position: "예: 대표이사, CEO",

    lbl_invite_code: "회사 초대 코드",
    placeholder_invite_code: "전달받은 초대 코드를 입력하세요",
    lbl_department: "부서명",
    placeholder_department: "소속 부서",
    lbl_position: "직급",
    placeholder_position: "본인 직급",

    btn_complete_signup: "회원가입 완료",
    btn_back: "뒤로가기"
};