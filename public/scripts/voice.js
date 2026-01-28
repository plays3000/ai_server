/* ==========================================================================
   5. 음성 녹음기 (Voice Recorder) 로직
   ========================================================================== */
const voiceUi = document.getElementById('voiceRecorderUi');
const btnVoice = document.getElementById('btnVoiceRecord');
const btnStop = document.getElementById('stopRecordBtn');
let recordInterval;

btnVoice.addEventListener('click', (e) => {
    e.stopPropagation();
    if (voiceUi.style.display === 'flex') closeRecorder();
    else openRecorder();
});

function openRecorder() {
    voiceUi.style.display = 'flex';
    let sec = 0;
    const timerElem = document.getElementById('recordTimer');
    timerElem.innerText = "00:00";
    clearInterval(recordInterval);
    recordInterval = setInterval(() => {
        sec++;
        const min = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        timerElem.innerText = `${min}:${s}`;
    }, 1000);
}

function closeRecorder() {
    voiceUi.style.display = 'none';
    clearInterval(recordInterval);
}

btnStop.addEventListener('click', () => {
    closeRecorder();
    const fakeAudio = new File(["dummy"], `녹음_${new Date().toLocaleTimeString()}.mp3`, {type: "audio/mp3"});
    filesData.audio.push(fakeAudio);
    updateFileStatus();
    renderFileList();
    fileListArea.classList.add('active');
});

window.addEventListener('click', (e) => {
    if (!voiceUi.contains(e.target) && e.target !== btnVoice && !btnVoice.contains(e.target)) {
        if(voiceUi.style.display === 'flex') closeRecorder();
    }
});
