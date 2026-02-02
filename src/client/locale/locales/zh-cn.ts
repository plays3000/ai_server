import { LocaleResource, LocaleInfo } from '../types.js';

export const zh_cn_info: LocaleInfo = {
    lang_code: "zh-CN",
    lang_name: "简体中文",
    lang_direction: 6, 
};

export const zh_cn: LocaleResource = {
    app_title: "AI 报告生成器",
    btn_reset: "重置",
    reset_chat: "重置对话",
    alert_reset: "确定要清除所有对话和文件吗？",
    
    welcome_msg: "你好！请输入报告主题和详细信息。",
    ai_analyzing: "的分析结果。",
    
    placeholder_title: "请输入报告主题或标题...",
    btn_generate: "生成",
    placeholder_detail: "在此输入详细要求或补充说明（可选）",
    btn_example: "示例",
    
    icon_finance: "财务",
    icon_accounting: "会计",
    icon_hr: "人事",
    icon_file: "文件",
    icon_image: "图片",
    icon_voice: "语音",

    modal_title: "设置",
    label_theme: "主题",
    label_writing_mode: "书写方向",
    btn_apply: "应用",
    btn_confirm: "确认",

    opt_horizontal_ltr: "横排 (左→右: 默认)",
    opt_horizontal_rtl: "横排 (右→左: 阿拉伯/希伯来)",
    opt_vertical_rl: "竖排 (右→左: 中/日/韩)",
    opt_vertical_lr_mongolian: "竖排 (左→右: 蒙古/满语)",
    opt_vertical_lr_maya: "竖排 (左→右: 玛雅)",

    tooltip_lang_select: "选择语言",
    tooltip_settings: "屏幕设置",
    btn_settings: "设置"
};