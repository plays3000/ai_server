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
    // btn_signup: string;

    // // 사용자정보
    // user_idx: string; //UUUID고유값
    // user_id: string; // (String) 사용자ID
    // user_password: string;
    // user_name: string;
    // user_phone: string;
    // user_email: string;

    // // 그룹
    // group_name: string; //그룹이름
    // group_company_reg_num: string; //사업자등록번호

    // // 기업
    // company_name: string; //회사이름
    // company_belonging_group_code: string; // 소속그룹코ㅡ

    // // 로그인
    // placeholder_input_id: string;
    // lbl_find_id: string;
    // placeholder_input_pw: string;
    // lbl_find_pw: string;
    // lbl_login_with_social_account: string;

    // //회원가입
    // lbl_default_info: string;
    // lbl_confirm_id: string;
    // placeholder_reenter_id: string;
    // lbl_confirm_pw: string;
    // placeholder_reenter_pw: string;
    // placeholder_enter_personal_name: string;
    // placeholder_enter_phone_number: string;
    // lbl_select_signup_type: string;
    // title_signup_as_group_manager: string;
    // desc_signup_as_group_manager: string; // 여러 회사를 관리하는<br>그룹 관리자
    // title_signup_as_company: string;
    // desc_signup_as_company: string; // 독립된 회사 또는<br>그룹 산하 법인
    // title_signup_as_employee: string;
    // desc_signup_as_employee: string; // 초대 코드를 통해<br>회사에 소속
}