import { LocaleInfo, LocaleResource } from '../types.js';

export const en_info: LocaleInfo = {
    lang_code: 'en',
    lang_name: 'English',
    lang_direction: 0,
}; 

export const en: LocaleResource = {
    app_title: "AI Report Generator",
    btn_reset: "Reset",
    reset_chat: "Reset Chat",
    alert_reset: "Clear all chat history and files?",

    welcome_msg: "Hello! Please enter the report topic and details.",
    ai_analyzing: "Analysis result for",

    placeholder_title: "Enter report topic...",
    btn_generate: "Generate",
    placeholder_detail: "Enter details (Optional)",
    btn_example: "Example",

    icon_finance: "Finance",
    icon_accounting: "Account",
    icon_hr: "HR",
    icon_file: "File",
    icon_image: "Image",
    icon_voice: "Voice",

    modal_title: "Settings",
    label_theme: "Theme",
    label_writing_mode: "Writing Mode",
    btn_apply: "Apply",
    btn_confirm: "OK",

    opt_horizontal_ltr: "Horizontal (LTR: Latin/Cyrillic/Greek/etc.)",
    opt_horizontal_rtl: "Horizontal (RTL: Hebrew/Arabic)",
    opt_vertical_rl: "Vertical (R-L: CJK)",
    opt_vertical_lr_mongolian: "Vertical (L-R: Mongolian)",
    opt_vertical_lr_maya: "Vertical (L-R: Maya)",

    tooltip_lang_select: "Select Language",
    tooltip_settings: "Screen Settings",
    btn_settings: "Settings",
};