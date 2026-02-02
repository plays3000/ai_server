// 1. locales 폴더의 index.ts에서 통합된 데이터와 타입을 가져옵니다.
import { translations, LanguageCode, LocaleResource } from './index.js';

export class I18nManager {
    // 기본 언어 설정
    private static currentLang: LanguageCode = 'ko';

    /**
     * 언어를 변경하고 화면을 갱신합니다.
     */
    public static setLanguage(lang: LanguageCode): void {
        // 정의되지 않은 언어 코드가 들어오면 무시
        if (!translations[lang]) {
            console.warn(`Language '${lang}' is not supported.`);
            return;
        }
        
        this.currentLang = lang;
        
        // HTML 태그(lang 속성) 변경 (접근성 및 폰트 처리를 위해)
        document.documentElement.lang = lang;
        
        this.updatePage();
    }

    /**
     * 현재 설정된 언어 코드를 반환합니다.
     */
    public static getLanguage(): LanguageCode {
        return this.currentLang;
    }

    /**
     * [핵심 변경] 특정 키의 번역 텍스트를 가져옵니다.
     * key 인자는 이제 아무 문자열이 아니라, LocaleResource에 정의된 키만 허용됩니다.
     */
    public static getText(key: keyof LocaleResource): string {
        const resource = translations[this.currentLang];
        return resource[key] || key; // 번역이 없으면 키 자체를 반환
    }

    /**
     * 화면 내 모든 data-i18n 요소를 찾아 텍스트를 업데이트합니다.
     */
    private static updatePage(): void {
        const elements = document.querySelectorAll('[data-i18n]');
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        const resource = translations[this.currentLang];

        elements.forEach((el) => {
            const key = el.getAttribute('data-i18n') as keyof LocaleResource;
            if (!key || !resource[key]) return;

            const text = resource[key];

            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                el.placeholder = text;
            } else if (el instanceof HTMLOptionElement) {
                el.text = text;
            } else if (el instanceof HTMLButtonElement) {
                el.textContent = text;
            } else {
                el.textContent = text;
            }
        });

        titleElements.forEach((el) => {
            const key = el.getAttribute('data-i18n-title') as keyof LocaleResource;
            if (!key || !resource[key]) return;
            el.setAttribute('title', resource[key]);
        });
    }
}