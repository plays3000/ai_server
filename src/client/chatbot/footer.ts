import { I18nManager } from '../../client/locale/i18n.js';
import { LanguageCode, locale_infos } from '../../client/locale/index.js';

export class FooterManager {
    private readonly DIRECTION_MAP: Record<number, string> = {
        0: 'horizontal-ltr',
        1: 'horizontal-rtl',
        2: 'vertical-lr-maya',
        3: 'vertical-lr-mongolian',
        6: 'vertical-rl'
    };

    // [New] 설정 저장을 위한 키
    private readonly STORAGE_KEY_THEME = 'app_theme';
    private readonly STORAGE_KEY_MODE = 'app_writing_mode';

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
        this.renderLanguageOptions();
        this.initializeSettings();
        
        // [수정] 초기 로드시 저장된 설정 불러오기
        this.loadSavedSettings();
        
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

    // [New] 저장된 설정 불러오기
    private loadSavedSettings(): void {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY_THEME);
        const savedMode = localStorage.getItem(this.STORAGE_KEY_MODE);
        const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
        const writingModeSelect = document.getElementById('writingModeSelect') as HTMLSelectElement;

        if (savedTheme) {
            if (themeSelect) themeSelect.value = savedTheme;
            this.applyTheme(savedTheme);
        }

        if (savedMode) {
            if (writingModeSelect) writingModeSelect.value = savedMode;
            // 모드 적용
            document.body.className = Array.from(document.body.classList)
                .filter(c => !c.startsWith('horizontal-') && !c.startsWith('vertical-'))
                .join(' ');
            document.body.classList.add(savedMode);
        } else {
            // 기본값
            document.body.classList.add('horizontal-ltr');
        }
    }

    private initializeSettings(): void {
        const openBtn = document.querySelector('.status-btn[title="화면 설정"]');
        const closeBtn = document.getElementById('closeModalX');
        const applyBtn = document.getElementById('btnApply');
        const okBtn = document.getElementById('btnOk');

        openBtn?.addEventListener('click', () => {
            if (this.langSelect) this.langSelect.value = I18nManager.getLanguage();
            // 현재 모드 UI 동기화
            const writingModeSelect = document.getElementById('writingModeSelect') as HTMLSelectElement;
            const currentMode = Array.from(document.body.classList).find(c => c.startsWith('horizontal-') || c.startsWith('vertical-'));
            if (writingModeSelect && currentMode) {
                writingModeSelect.value = currentMode;
            }
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
            this.currentLangDisplay.textContent = langInfo.lang_name;
        }
    }
    
    // [수정됨] 색상을 JS에서 지정하지 않고, 클래스만 붙였다 뗐다 함 (CSS가 처리)
    private applyTheme(theme: string): void {
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        // ★ 삭제됨: root.style.setProperty(...) 코드들
        // 이유: CSS 변수(body.dark)로 옮겨서 더 이상 필요 없음
    }
    
    private applyThemeAndMode(): void {
        const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
        const writingModeSelect = document.getElementById('writingModeSelect') as HTMLSelectElement;
        
        // 1. 테마 적용 및 저장
        if (themeSelect) {
            const theme = themeSelect.value;
            this.applyTheme(theme);
            localStorage.setItem(this.STORAGE_KEY_THEME, theme);
        }

        // 2. 쓰기 모드 적용 (수동 선택 우선)
        let appliedMode = 'horizontal-ltr';
        if (writingModeSelect) {
             const manualMode = writingModeSelect.value;
             document.body.className = Array.from(document.body.classList)
                .filter(c => !c.startsWith('horizontal-') && !c.startsWith('vertical-') && c !== 'dark') // dark 클래스 보존 주의
                .join(' ');
             
             // 다크모드였다면 다시 추가 (className 덮어쓰기 방지)
             if (localStorage.getItem(this.STORAGE_KEY_THEME) === 'dark') {
                 document.body.classList.add('dark');
             }

             document.body.classList.add(manualMode);
             appliedMode = manualMode;
             localStorage.setItem(this.STORAGE_KEY_MODE, manualMode);
        }

        // 3. 언어 적용
        if (this.langSelect) {
            const selectedLang = this.langSelect.value as LanguageCode;
            I18nManager.setLanguage(selectedLang);
            this.updateStatusText(selectedLang);

            // 언어에 따른 기본 방향 자동 제안 (이미 수동 설정이 있다면 무시하거나 덮어쓸지 결정 필요)
            // 여기서는 사용자가 직접 선택한 'writingModeSelect' 값을 우선시하므로
            // 언어 변경 시 자동으로 모드를 바꾸는 코드는 생략하거나, 
            // '자동' 옵션이 있을 때만 동작하도록 하는 것이 좋습니다.
        }
    }
}