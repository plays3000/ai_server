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
}