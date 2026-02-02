import { AppSettings } from './types.js';
import { I18nManager } from '../../client/locale/i18n.js';
// [확인] 데이터 import 잘 하셨습니다.
import { LanguageCode, locale_infos } from '../../client/locale/index.js';

export class FooterManager {
    // 방향 번호 매핑
    private readonly DIRECTION_MAP: Record<number, string> = {
        0: 'horizontal-ltr',
        1: 'horizontal-rtl',
        2: 'vertical-lr-maya',
        3: 'vertical-lr-mongolian',
        6: 'vertical-rl'
    };

    private modal: HTMLElement | null;
    private clockEl: HTMLElement | null;
    private langSelect: HTMLSelectElement | null;
    private currentLangDisplay: HTMLElement | null;

    constructor() {
        this.modal = document.getElementById('settingModal');
        this.clockEl = document.getElementById('realTimeClock');
        this.langSelect = document.getElementById('languageSelect') as HTMLSelectElement;
        this.currentLangDisplay = document.getElementById('currentLangDisplay');

        this.initializeClock();
        
        // [확인] 순서 변경 잘 하셨습니다. (옵션 생성 -> 이벤트 연결)
        this.renderLanguageOptions();
        this.initializeSettings();
        
        // 초기 상태바 텍스트 설정
        const currentLang = I18nManager.getLanguage();
        this.updateStatusText(currentLang);
    }

    private initializeClock(): void {
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ko-KR', { 
                hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
            if (this.clockEl) this.clockEl.innerText = timeString;
        }, 1000);
    }

    private initializeSettings(): void {
        const openBtn = document.querySelector('.status-btn[title="화면 설정"]');
        const closeBtn = document.getElementById('closeModalX');
        const applyBtn = document.getElementById('btnApply');
        const okBtn = document.getElementById('btnOk');

        openBtn?.addEventListener('click', () => {
            if (this.langSelect) this.langSelect.value = I18nManager.getLanguage();
            this.modal?.classList.add('show');
        });
        
        closeBtn?.addEventListener('click', () => this.modal?.classList.remove('show'));

        const applyHandler = () => {
            this.applyThemeAndMode();
            alert(I18nManager.getText('modal_title') + ' 적용 완료');
        };

        applyBtn?.addEventListener('click', applyHandler);
        okBtn?.addEventListener('click', () => {
            this.applyThemeAndMode();
            this.modal?.classList.remove('show');
        });
    }
    
    // [확인] Object.values로 수정 잘 하셨습니다!
    private renderLanguageOptions(): void {
        if (!this.langSelect) return;

        this.langSelect.innerHTML = ''; 

        Object.values(locale_infos).forEach(info => {
            const option = document.createElement('option');
            option.value = info.lang_code;
            option.textContent = info.lang_name;
            this.langSelect?.appendChild(option);
        });

        this.langSelect.value = I18nManager.getLanguage();
    }
    
    private updateStatusText(langCode: LanguageCode): void {
        if (!this.currentLangDisplay) return;
        
        const langInfo = locale_infos[langCode];
        
        if (langInfo) {
            // const displayName = langInfo.lang_name.split(' (')[0];
            const displayName = langInfo.lang_name;
            this.currentLangDisplay.textContent = displayName;
        }
    }
    
    // ★ [중요 수정] 문법 오류가 있던 함수를 복구했습니다.
    private applyThemeAndMode(): void {
        const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
        const writingModeSelect = document.getElementById('writingModeSelect') as HTMLSelectElement;
        const root = document.documentElement;

        // 1. 언어 및 쓰기 모드 자동 적용
        if (this.langSelect) {
            // (1) 현재 선택된 언어 가져오기
            const selectedLang = this.langSelect.value as LanguageCode;
            
            // (2) 언어 매니저에 적용
            I18nManager.setLanguage(selectedLang);
            this.updateStatusText(selectedLang);

            // (3) 해당 언어의 정보 가져오기 (여기서 끊겨 있었음)
            const langInfo = locale_infos[selectedLang];
            
            if (langInfo) {
                const dirNumber = langInfo.lang_direction;
                
                // 기본 매핑 가져오기
                let cssClass = this.DIRECTION_MAP[dirNumber];
                
                // 예외 처리: 6번(CJK)은 웹 기본 가로쓰기로 시작
                if (dirNumber === 6) {
                     cssClass = 'horizontal-ltr'; 
                }

                // Body 클래스 초기화 및 적용
                document.body.className = '';
                document.body.classList.add(cssClass);
                
                // 설정창 UI 동기화
                if (writingModeSelect) writingModeSelect.value = cssClass;
            }
        }

        // 2. 수동 쓰기 모드 오버라이드 (사용자가 굳이 다른 걸 선택했을 때)
        if (writingModeSelect) {
             const manualMode = writingModeSelect.value;
             if (!document.body.classList.contains(manualMode)) {
                 document.body.className = '';
                 document.body.classList.add(manualMode);
             }
        }

        // 3. 테마 적용
        const theme = themeSelect.value;
        if (theme === 'dark') {
            root.style.setProperty('--bg-color', '#222222');
            root.style.setProperty('--white', '#333333');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--gray-light', '#444444');
            root.style.setProperty('--gray-text', '#cccccc');
            root.style.setProperty('--input-bg-color', '#333333');
            root.style.setProperty('--bubble-ai-bg-color', '#333333');
            root.style.setProperty('--bubble-ai-text-color', '#ffffff');
            root.style.setProperty('--footer-text-color', '#cccccc');
            root.style.setProperty('--file-list-bg-color', '#444444');
        } else {
            root.style.setProperty('--bg-color', '#f4f6f8');
            root.style.setProperty('--white', '#ffffff');
            root.style.setProperty('--text-color', '#333');
            root.style.setProperty('--gray-light', '#e0e0e0');
            root.style.setProperty('--gray-text', '#888');
            root.style.setProperty('--input-bg-color', '#ffffff');
            root.style.setProperty('--bubble-ai-bg-color', '#ffffff');
            root.style.setProperty('--bubble-ai-text-color', '#333');
            root.style.setProperty('--footer-text-color', '#888');
            root.style.setProperty('--file-list-bg-color', '#ffffff');
        }
    }
}