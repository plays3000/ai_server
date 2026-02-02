// 음성 녹음 및 파일 변환 클래스
export class VoiceRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private onRecordComplete: (audioFile: File) => void;

    // 녹음 완료 시 실행할 콜백 함수를 주입받음
    constructor(onRecordComplete: (audioFile: File) => void) {
        this.onRecordComplete = onRecordComplete;
    }

    // 마이크 권한 획득 및 녹음 시작
    async startRecording(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            // 데이터 가용 시 청크 배열에 추가
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            // 녹음 중지 시 Blob 생성 및 File 객체 전달
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], `voice_record_${Date.now()}.wav`, { type: 'audio/wav' });
                this.onRecordComplete(audioFile);
            };

            this.mediaRecorder.start();
            console.log('녹음 시작');
            
            // 5초 후 자동 종료 (필요에 따라 조정 가능)
            setTimeout(() => this.stopRecording(), 5000);

        } catch (error) {
            console.error('마이크 접근 실패:', error);
            alert('마이크 접근 권한이 필요합니다.');
        }
    }

    // 녹음 중지 처리
    stopRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            console.log('녹음 중지');
        }
    }
}