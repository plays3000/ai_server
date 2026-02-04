import { LocaleResource, LocaleInfo } from '../types.js';

export const zh_tw_info: LocaleInfo = {
    lang_code: "zh-TW",
    lang_name: "繁體中文",
    lang_direction: 6, 
};

export const zh_tw: LocaleResource = {
    app_title: "AI 報告產生器",          // 报告 -> 報告, 生成器 -> 產生器
    btn_reset: "重設",     
    reset_chat: "重設對話",             // 重置 -> 重設
    alert_reset: "確定要清除所有對話和檔案嗎？", // 确定 -> 確定, 文件 -> 檔案
    
    welcome_msg: "你好！請輸入報告主題和詳細資訊。",
    ai_analyzing: "的分析結果。",
    
    placeholder_title: "請輸入報告主題或標題...",
    btn_generate: "產生",
    placeholder_detail: "在此輸入詳細需求或補充說明（可選）",
    btn_example: "範例",
    
    icon_finance: "財務",
    icon_accounting: "會計",
    icon_hr: "人事",
    icon_file: "檔案",
    icon_image: "圖片",
    icon_voice: "語音",

    modal_title: "設定",                // 设置 -> 設定
    label_theme: "佈景主題",
    label_writing_mode: "書寫方向",
    btn_apply: "套用",                  // 应用 -> 套用
    btn_confirm: "確認",

    opt_horizontal_ltr: "橫排 (左→右: 預設)",
    opt_horizontal_rtl: "橫排 (右→左: 阿拉伯/希伯來)",
    opt_vertical_rl: "直排 (右→左: 中/日/韓)",
    opt_vertical_lr_mongolian: "直排 (左→右: 蒙古/滿語)",
    opt_vertical_lr_maya: "直排 (左→右: 馬雅)",

    tooltip_lang_select: "選擇語言",
    tooltip_settings: "螢幕設定",
    btn_settings: "設定",
    
    btn_login: '登入',
    btn_logout: '登出',
    btn_signup: "註冊",
    btn_train_template: "範本學習",
    nav_login: "登入",
    nav_logout: "登出",
    nav_signup: "註冊",
    nav_train_template: "範本學習",

    // User Info
    user_idx: "唯一編號",
    user_id: "帳號",
    user_password: "密碼",
    user_name: "姓名",
    user_phone: "電話號碼",
    user_email: "電子郵件",

    // Group & Company
    group_name: "群組名稱",
    group_company_reg_num: "統一編號",
    company_name: "公司名稱",
    company_belonging_group_code: "所屬群組代碼",

    // Login Page
    title_login: "登入",
    lbl_id: "帳號",
    placeholder_id: "請輸入帳號",
    lbl_password: "密碼",
    placeholder_password: "請輸入密碼",
    link_find_id: "忘記帳號？",
    link_find_pw: "忘記密碼？",
    btn_login_action: "登入",
    btn_go_signup: "註冊會員",
    lbl_social_login: "使用社群帳號登入",

    // Signup Page - Common
    title_signup: "會員註冊",
    lbl_basic_info: "基本資料",
    lbl_confirm_id: "確認帳號",
    placeholder_confirm_id: "請再次輸入帳號",
    lbl_confirm_pw: "確認密碼",
    placeholder_confirm_pw: "請再次輸入密碼",
    lbl_name: "姓名",
    placeholder_name: "請輸入真實姓名",
    lbl_phone: "電話號碼",
    placeholder_phone: "010-0000-0000",
    lbl_email: "電子郵件",
    placeholder_email: "example@email.com",
    lbl_select_role: "選擇註冊類型",

    // Role Cards
    role_group_title: "建立群組",
    role_group_desc: "管理多家公司的<br>群組管理員",
    role_company_title: "建立法人",
    role_company_desc: "獨立公司或<br>群組旗下法人",
    role_employee_title: "一般員工",
    role_employee_desc: "透過邀請碼<br>加入公司",

    // Input Fields
    lbl_group_name: "群組名稱",
    placeholder_group_name: "請輸入欲建立的群組名稱",
    lbl_business_num: "統一編號",
    placeholder_business_num: "請輸入數字，無需橫線",
    
    lbl_company_name: "公司名稱（法人名）",
    placeholder_company_name: "請輸入公司名稱",
    lbl_parent_group_code: "所屬群組代碼",
    placeholder_parent_group_code: "若有則輸入",
    lbl_rep_position: "代表人職稱",
    placeholder_rep_position: "例：董事長、CEO",

    lbl_invite_code: "公司邀請碼",
    placeholder_invite_code: "請輸入收到的邀請碼",
    lbl_department: "部門名稱",
    placeholder_department: "所屬部門",
    lbl_position: "職稱",
    placeholder_position: "個人職稱",

    btn_complete_signup: "完成註冊",
    btn_back: "返回"
};