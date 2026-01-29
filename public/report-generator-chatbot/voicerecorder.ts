

export class VoiceRecorder {
    private recorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    public isRecording: boolean = false;
    private timerInterval: number | null = null;

    private recorderUi: HTMLElement;
    private timerEl: HTMLElement;
    private stopBtn: HTMLButtonElement;

    constructor(private onStop: (file: File) => void) {
        this.recorderUi = document.getElementById('voiceRecorderUi')!;
        this.timerEl = document.getElementById('recordTimer')!;
        this.stopBtn = document.getElementById('stopRecordBtn') as HTMLButtonElement;

        this.stopBtn.addEventListener('click', () => this.stopRecording());
    }

    async startRecording(): Promise<void> {
        if (this.isRecording) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new MediaRecorder(stream);

            this.recorder.addEventListener('dataavailable', (event: BlobEvent) => {
                this.audioChunks.push(event.data);
            });

            this.recorder.addEventListener('stop', () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], `recording_${new Date().toISOString()}.wav`, { type: 'audio/wav' });
                this.onStop(audioFile); // Pass the file to the callback
                this.audioChunks = [];
                stream.getTracks().forEach(track => track.stop());
            });

            this.recorder.start();
            this.isRecording = true;
            this.toggleUi(true);
            this.startTimer();

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
        }
    }

    stopRecording(): void {
        if (!this.isRecording || !this.recorder) return;
        this.recorder.stop();
        this.isRecording = false;
        this.toggleUi(false);
        this.stopTimer();
    }

    toggleUi(isRecording: boolean): void {
        this.recorderUi.style.display = isRecording ? 'flex' : 'none';
    }

    private startTimer(): void {
        let seconds = 0;
        this.timerEl.textContent = '00:00';
        this.timerInterval = window.setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            this.timerEl.textContent = `${minutes}:${secs}`;
        }, 1000);
    }

    private stopTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}
