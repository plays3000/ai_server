
/* ==========================================================================
   6. 설정(Settings) 및 다국어 쓰기 모드 로직
   ========================================================================== */
const settingModal = document.getElementById('settingModal');
// 설정 버튼 찾기 (하단 상태바)
const openSettingBtn = document.querySelector('.status-btn[title="화면 설정"]');
const closeModalX = document.getElementById('closeModalX');
const btnCancel = document.getElementById('btnCancel');
const btnApply = document.getElementById('btnApply');
const btnOk = document.getElementById('btnOk');

if (openSettingBtn) openSettingBtn.addEventListener('click', () => settingModal.classList.add('show'));
if (closeModalX) closeModalX.addEventListener('click', () => settingModal.classList.remove('show'));
if (btnCancel) btnCancel.addEventListener('click', () => settingModal.classList.remove('show'));

// [핵심] 설정 적용 함수 (CSS 리팩토링 대응)
function applySettings() {
    const writingMode = document.getElementById('writingModeSelect').value;
    const theme = document.getElementById('themeSelect').value;

    // 1. 클래스 초기화
    document.body.classList.remove(
        'vertical-rl', 'vertical-lr-mongolian', 'vertical-lr-maya',
        'horizontal-rtl', 'horizontal-ltr'
    );

    // 2. 쓰기 모드 적용
    if (writingMode === 'vertical-rl') document.body.classList.add('vertical-rl');
    else if (writingMode === 'vertical-lr-mongolian') document.body.classList.add('vertical-lr-mongolian');
    else if (writingMode === 'vertical-lr-maya') document.body.classList.add('vertical-lr-maya');
    else if (writingMode === 'horizontal-rtl') document.body.classList.add('horizontal-rtl');
    else if (writingMode === 'horizontal-ltr') document.body.classList.add('horizontal-ltr');

    // 3. 테마 적용
    const root = document.documentElement;
    if (theme === 'dark') {
        root.style.setProperty('--bg-color', '#222');
        root.style.setProperty('--white', '#333');
        root.style.setProperty('--text-color', '#fff');
        root.style.setProperty('--gray-light', '#444');
        root.style.setProperty('--gray-text', '#d0d0d0');
    } else {
        root.style.setProperty('--bg-color', '#f4f6f8');
        root.style.setProperty('--white', '#ffffff');
        root.style.setProperty('--text-color', '#333');
        root.style.setProperty('--gray-light', '#e0e0e0');
        root.style.setProperty('--gray-text', '#666');
    }
}

if (btnApply) {
    btnApply.addEventListener('click', () => { applySettings(); alert('설정이 적용되었습니다.'); });
}
if (btnOk) {
    btnOk.addEventListener('click', () => { applySettings(); settingModal.classList.remove('show'); });
}