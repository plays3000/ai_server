import { LocaleResource, LocaleInfo } from '../types.js';

export const ko_info: LocaleInfo = {
    lang_code: "ko",
    lang_name: "한국어",
    lang_direction: 6,
}; 

export const ko: LocaleResource = {
    app_title: "AI 기반 보고서 생성기",
    btn_reset: "초기화",
    reset_chat: "대회 초기화",
    alert_reset: "대화 내용과 첨부파일을 모두 지우시겠습니까?",

    welcome_msg: "안녕하세요! 작성하고 싶은 보고서의 주제와 상세 내용을 입력해주세요.",
    ai_analyzing: "에 대한 분석 결과입니다.",

    placeholder_title: "보고서 주제 또는 제목을 입력하세요...",
    btn_generate: "생성",
    placeholder_detail: "여기에 상세 요구사항이나 추가 설명을 입력하세요 (선택사항)",
    btn_example: "예시값",

    icon_finance: "재무",
    icon_accounting: "회계",
    icon_hr: "인사",
    icon_file: "파일",
    icon_image: "이미지",
    icon_voice: "음성",

    modal_title: "환경 설정",
    label_theme: "화면 테마",
    label_writing_mode: "쓰기 방향",
    btn_apply: "적용",
    btn_confirm: "확인",

    opt_horizontal_ltr: "가로쓰기 (좌 → 우: 기본)",
    opt_horizontal_rtl: "가로쓰기 (우 → 좌: 아람/히브리)",
    opt_vertical_rl: "세로쓰기 (우 → 좌: 한/중/일)",
    opt_vertical_lr_mongolian: "세로쓰기 (좌 → 우: 몽골/만주)",
    opt_vertical_lr_maya: "세로쓰기 (좌 → 우: 마야/블록)",

    tooltip_lang_select: "언어 선택",
    tooltip_settings: "화면 설정",
    btn_settings: "설정",

    btn_login: "로그인",
    btn_logout: "로그아웃"
};