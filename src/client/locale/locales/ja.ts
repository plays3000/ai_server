import { LocaleResource, LocaleInfo } from '../types.js';

export const ja_info: LocaleInfo = {
    lang_code: "ja",
    lang_name: "日本語",
    lang_direction: 6, 
};

export const ja: LocaleResource = {
    app_title: "AIレポート作成ツール",
    btn_reset: "初期化",
    reset_chat: "チャットをリセット",
    alert_reset: "会話の内容と添付ファイルをすべて削除しますか？",

    welcome_msg: "こんにちは！レポートのトピックと詳細を入力してください。",
    ai_analyzing: "に対する分析結果です。",

    placeholder_title: "レポートのトピックまたはタイトルを入力...",
    btn_generate: "生成",
    placeholder_detail: "詳細な要件や追加の説明を入力（オプション）",
    btn_example: "例",

    icon_finance: "財務",
    icon_accounting: "会計",
    icon_hr: "人事",
    icon_file: "ファイル",
    icon_image: "画像",
    icon_voice: "音声",

    modal_title: "環境設定",
    label_theme: "画面テーマ",
    label_writing_mode: "書き込み方向",
    btn_apply: "適用",
    btn_confirm: "確認",

    opt_horizontal_ltr: "横書き (左→右: デフォルト)",
    opt_horizontal_rtl: "横書き (右→左: ヘブライ/アラビア)",
    opt_vertical_rl: "縦書き (右→左: 日/中/韓)",
    opt_vertical_lr_mongolian: "縦書き (左→右: モンゴル/満州)",
    opt_vertical_lr_maya: "縦書き (左→右: マヤ)",

    tooltip_lang_select: "言語選択",
    tooltip_settings: "画面設定",
    btn_settings: "設定",

    btn_login: 'ログイン',
    btn_logout: 'ログアウト',
    btn_signup: "会員登録",
    btn_train_template: "テンプレート学習",
    nav_login: "ログイン",
    nav_logout: "ログアウト",
    nav_signup: "会員登録",
    nav_train_template: "テンプレート学習",

    // User Info
    user_idx: "固有番号",
    user_id: "ユーザーID",
    user_password: "パスワード",
    user_name: "氏名",
    user_phone: "電話番号",
    user_email: "メールアドレス",

    // Group & Company
    group_name: "グループ名",
    group_company_reg_num: "事業者登録番号",
    company_name: "会社名",
    company_belonging_group_code: "所属グループコード",

    // Login Page
    title_login: "ログイン",
    lbl_id: "ID",
    placeholder_id: "IDを入力してください",
    lbl_password: "パスワード",
    placeholder_password: "パスワードを入力してください",
    link_find_id: "IDをお忘れの方",
    link_find_pw: "パスワードをお忘れの方",
    btn_login_action: "ログイン",
    btn_go_signup: "会員登録",
    lbl_social_login: "ソーシャルアカウントでログイン",
    confirm_logout: "ログアウトしますか？",
    alert_logged_out: "ログアウトしました。",

    // Signup Page - Common
    title_signup: "会員登録",
    lbl_basic_info: "基本情報",
    lbl_confirm_id: "ID確認",
    placeholder_confirm_id: "IDを再入力してください",
    lbl_confirm_pw: "パスワード確認",
    placeholder_confirm_pw: "パスワードを再入力してください",
    lbl_name: "氏名",
    placeholder_name: "実名を入力してください",
    lbl_phone: "電話番号",
    placeholder_phone: "010-0000-0000",
    lbl_email: "メールアドレス",
    placeholder_email: "example@email.com",
    lbl_select_role: "登録タイプ選択",

    // Role Cards
    role_group_title: "グループ設立",
    role_group_desc: "複数の会社を管理する<br>グループ管理者",
    role_company_title: "法人設立",
    role_company_desc: "独立した会社、または<br>グループ傘下の法人",
    role_employee_title: "一般社員",
    role_employee_desc: "招待コードを通じて<br>会社に所属",

    // Input Fields
    lbl_group_name: "グループ名",
    placeholder_group_name: "設立するグループ名を入力",
    lbl_business_num: "事業者登録番号",
    placeholder_business_num: "ハイフンなしで数字のみ",
    
    lbl_company_name: "会社名（法人名）",
    placeholder_company_name: "会社名を入力してください",
    lbl_parent_group_code: "所属グループコード",
    placeholder_parent_group_code: "ある場合は入力してください",
    lbl_rep_position: "代表者役職",
    placeholder_rep_position: "例：代表取締役、CEO",

    lbl_invite_code: "会社招待コード",
    placeholder_invite_code: "受け取った招待コードを入力",
    lbl_department: "部署名",
    placeholder_department: "所属部署",
    lbl_position: "役職",
    placeholder_position: "現在の役職",

    btn_complete_signup: "登録完了",
    btn_back: "戻る"
};