// 실시간 시계
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', { 
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
    const clockElement = document.getElementById('realTimeClock');
    if (clockElement) clockElement.innerText = timeString;
}
setInterval(updateClock, 1000);
updateClock();