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

    btn_login: "Login",
    btn_logout: "Logout",
    btn_signup: "Sign Up",
    btn_train_template: "Template Training",
    nav_login: "Login",
    nav_logout: "Logout",
    nav_signup: "Sign Up",
    nav_train_template: "Train Template",

    // User Info
    user_idx: "User Index",
    user_id: "User ID",
    user_password: "Password",
    user_name: "Name",
    user_phone: "Phone Number",
    user_email: "Email",

    // Group & Company
    group_name: "Group Name",
    group_company_reg_num: "Business Registration No.",
    company_name: "Company Name",
    company_belonging_group_code: "Group Code",

    // Login Page
    title_login: "Login",
    lbl_id: "User ID",
    placeholder_id: "Enter your ID",
    lbl_password: "Password",
    placeholder_password: "Enter your password",
    link_find_id: "Forgot ID?",
    link_find_pw: "Forgot Password?",
    btn_login_action: "Login",
    btn_go_signup: "Sign Up",
    lbl_social_login: "Sign in with Social Account",
    confirm_logout: "Are you sure you want to log out?",
    alert_logged_out: "You have been logged out.",

    // Signup Page - Common
    title_signup: "Sign Up",
    lbl_basic_info: "Basic Information",
    lbl_confirm_id: "Confirm ID",
    placeholder_confirm_id: "Re-enter your ID",
    lbl_confirm_pw: "Confirm Password",
    placeholder_confirm_pw: "Re-enter your password",
    lbl_name: "Name",
    placeholder_name: "Enter your real name",
    lbl_phone: "Phone Number",
    placeholder_phone: "e.g., 010-0000-0000",
    lbl_email: "Email",
    placeholder_email: "example@email.com",
    lbl_select_role: "Select Account Type",

    // Role Cards
    role_group_title: "Create Group",
    role_group_desc: "Group manager managing<br>multiple companies",
    role_company_title: "Create Company",
    role_company_desc: "Independent company or<br>group subsidiary",
    role_employee_title: "General Employee",
    role_employee_desc: "Join a company via<br>invitation code",

    // Input Fields
    lbl_group_name: "Group Name",
    placeholder_group_name: "Enter group name",
    lbl_business_num: "Business Reg. No.",
    placeholder_business_num: "Numbers only, no dashes",
    
    lbl_company_name: "Company Name",
    placeholder_company_name: "Enter company name",
    lbl_parent_group_code: "Parent Group Code",
    placeholder_parent_group_code: "Enter if applicable",
    lbl_rep_position: "Representative Position",
    placeholder_rep_position: "e.g., CEO, President",

    lbl_invite_code: "Invitation Code",
    placeholder_invite_code: "Enter the code you received",
    lbl_department: "Department",
    placeholder_department: "Your department",
    lbl_position: "Position",
    placeholder_position: "Your job title",

    btn_complete_signup: "Complete Signup",
    btn_back: "Back"
};