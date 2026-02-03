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
    btn_logout: 'ログアウト'
};