export interface LocaleInfo {
    // 언어코드
    lang_code: string;
    // 언어이름
    lang_name: string;
    /**
     * 0: 가로 LTR (영어, 한국어-웹표준)
     * 1: 가로 RTL (아랍어)
     * 2: 세로 LR (마야)
     * 3: 세로 LR (몽골)
     * 6: 세로 RL (한자, 한글-전통)
     */
    lang_direction: number;
}

export interface LocaleResource {

    // [공통]
    app_title: string;
    btn_reset: string;
    reset_chat: string;
    alert_reset: string;

    // [채팅 영역]
    welcome_msg: string;
    ai_analyzing: string;

    // [입력창 및 툴바]
    placeholder_title: string;
    btn_generate: string;
    placeholder_detail: string;
    btn_example: string;
    
    // [아이콘 툴바]
    icon_finance: string;
    icon_accounting: string;
    icon_hr: string;
    icon_file: string;
    icon_image: string;
    icon_voice: string;

    // [설정 모달]
    modal_title: string;
    label_theme: string;
    label_writing_mode: string;
    btn_apply: string;
    btn_confirm: string;
    
    // [쓰기 모드 옵션 이름]
    opt_horizontal_ltr: string;
    opt_horizontal_rtl: string;
    opt_vertical_rl: string;
    opt_vertical_lr_mongolian: string;
    opt_vertical_lr_maya: string;

    // [푸터]
    tooltip_lang_select: string;
    tooltip_settings: string;
    btn_settings: string;

    btn_login: string;
    btn_logout: string;
    btn_signup: string;
    btn_train_template: string; // 양식학습
    nav_login: string;
    nav_logout: string;
    nav_signup: string;
    nav_train_template: string; // 

    // 사용자정보
    user_idx: string; // UUID고유값
    user_id: string; // (String) 사용자ID
    user_password: string;
    user_name: string;
    user_phone: string;
    user_email: string;

    // 그룹
    group_name: string; //그룹이름
    group_company_reg_num: string; //사업자등록번호

    // 기업
    company_name: string; //회사이름
    company_belonging_group_code: string; // 소속그룹코ㅡ

    // [신규] 로그인 페이지
    title_login: string;            // 로그인
    lbl_id: string;                 // 아이디
    placeholder_id: string;         // 아이디 입력
    lbl_password: string;           // 비밀번호
    placeholder_password: string;   // 비밀번호 입력
    link_find_id: string;           // 아이디 찾기
    link_find_pw: string;           // 비밀번호 찾기
    btn_login_action: string;       // (동사) 로그인
    btn_go_signup: string;          // 회원가입 (이동 버튼)
    lbl_social_login: string;       // 소셜 계정으로 로그인

    // [신규] 회원가입 페이지 - 공통
    title_signup: string;           // 회원가입
    lbl_basic_info: string;         // 기본 정보
    lbl_confirm_id: string;         // 아이디 확인
    placeholder_confirm_id: string; // 아이디 재입력
    lbl_confirm_pw: string;         // 비밀번호 확인
    placeholder_confirm_pw: string; // 비밀번호 재입력
    lbl_name: string;               // 이름
    placeholder_name: string;       // 실명 입력
    lbl_phone: string;              // 전화번호
    placeholder_phone: string;      // 010-0000-0000
    lbl_email: string;              // 이메일
    placeholder_email: string;      // example@email.com
    lbl_select_role: string;        // 가입 유형 선택

    // [신규] 가입 유형 카드
    role_group_title: string;       // 그룹 창설
    role_group_desc: string;        // 여러 회사를 관리하는...
    role_company_title: string;     // 법인 창설
    role_company_desc: string;      // 독립된 회사 또는...
    role_employee_title: string;    // 일반 직원
    role_employee_desc: string;     // 초대 코드를 통해...

    // [신규] 입력 필드 (그룹/법인/직원)
    lbl_group_name: string;
    placeholder_group_name: string;
    lbl_business_num: string;
    placeholder_business_num: string;
    
    lbl_company_name: string;
    placeholder_company_name: string;
    lbl_parent_group_code: string;
    placeholder_parent_group_code: string;
    lbl_rep_position: string;
    placeholder_rep_position: string;

    lbl_invite_code: string;
    placeholder_invite_code: string;
    lbl_department: string;
    placeholder_department: string;
    lbl_position: string;
    placeholder_position: string;

    btn_complete_signup: string;    // 회원가입 완료
    btn_back: string;               // 뒤로가기
}