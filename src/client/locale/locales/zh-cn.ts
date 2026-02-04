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
    btn_settings: "设置",
    
    btn_login: '登录',
    btn_logout: '退出',
    btn_signup: "注册",
    btn_train_template: "模板学习",
    nav_login: "登录",
    nav_logout: "退出",
    nav_signup: "注册",
    nav_train_template: "模板学习",

    // User Info
    user_idx: "唯一编号",
    user_id: "账号",
    user_password: "密码",
    user_name: "姓名",
    user_phone: "电话号码",
    user_email: "电子邮箱",

    // Group & Company
    group_name: "集团名称",
    group_company_reg_num: "企业注册号",
    company_name: "公司名称",
    company_belonging_group_code: "所属集团代码",

    // Login Page
    title_login: "登录",
    lbl_id: "账号",
    placeholder_id: "请输入账号",
    lbl_password: "密码",
    placeholder_password: "请输入密码",
    link_find_id: "找回账号",
    link_find_pw: "找回密码",
    btn_login_action: "登录",
    btn_go_signup: "注册会员",
    lbl_social_login: "使用社交账号登录",

    // Signup Page - Common
    title_signup: "会员注册",
    lbl_basic_info: "基本信息",
    lbl_confirm_id: "确认账号",
    placeholder_confirm_id: "请再次输入账号",
    lbl_confirm_pw: "确认密码",
    placeholder_confirm_pw: "请再次输入密码",
    lbl_name: "姓名",
    placeholder_name: "请输入真实姓名",
    lbl_phone: "电话号码",
    placeholder_phone: "010-0000-0000",
    lbl_email: "电子邮箱",
    placeholder_email: "example@email.com",
    lbl_select_role: "选择注册类型",

    // Role Cards
    role_group_title: "创建集团",
    role_group_desc: "管理多家公司的<br>集团管理员",
    role_company_title: "创建法人",
    role_company_desc: "独立公司或<br>集团旗下法人",
    role_employee_title: "普通员工",
    role_employee_desc: "通过邀请码<br>加入公司",

    // Input Fields
    lbl_group_name: "集团名称",
    placeholder_group_name: "请输入欲创建的集团名称",
    lbl_business_num: "企业注册号",
    placeholder_business_num: "请输入数字，无需横线",
    
    lbl_company_name: "公司名称（法人名）",
    placeholder_company_name: "请输入公司名称",
    lbl_parent_group_code: "所属集团代码",
    placeholder_parent_group_code: "如有则输入",
    lbl_rep_position: "代表人职务",
    placeholder_rep_position: "例：董事长、CEO",

    lbl_invite_code: "公司邀请码",
    placeholder_invite_code: "请输入收到的邀请码",
    lbl_department: "部门名称",
    placeholder_department: "所属部门",
    lbl_position: "职务",
    placeholder_position: "个人职务",

    btn_complete_signup: "完成注册",
    btn_back: "返回"
};