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
    btn_settings: "設定"
};