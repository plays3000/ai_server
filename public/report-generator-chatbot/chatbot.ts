import { HeaderManager } from './header.js';
import { FooterManager } from './footer.js';
import { FileStore } from './types.js';
import { VoiceRecorder } from './voicerecorder.js';

class ChatbotApp {
    private chatContainer: HTMLElement;
    private filesData: FileStore = { image: [], audio: [], file: [] };
    
    // UI Elements
    private titleInput: HTMLInputElement;
    private detailInput: HTMLTextAreaElement;
    private fileListArea: HTMLElement;
    private voiceRecorder: VoiceRecorder;
    
    constructor() {
        // DOM 요소 캐싱 (Non-null assertion '!' 사용 - 존재한다고 가정)
        this.chatContainer = document.getElementById('chatContainer')!;
        this.titleInput = document.getElementById('reportTitle') as HTMLInputElement;
        this.detailInput = document.getElementById('reportDetail') as HTMLTextAreaElement;
        this.fileListArea = document.getElementById('fileListArea')!;

        this.voiceRecorder = new VoiceRecorder((audioFile) => {
            this.filesData.file.push(audioFile);
            this.renderFileList();
        });

        this.init();
    }

    private init(): void {
        // 1. 모듈 조립
        new HeaderManager(() => this.resetChat()); // 헤더의 리셋 이벤트 연결
        new FooterManager(); // 푸터(설정) 연결
        // 2. 파일 그리드 영역 추가
        const fileGrid = document.createElement('div');
        fileGrid.className = 'file-grid';
        this.fileListArea.appendChild(fileGrid);

        // 3. 이벤트 리스너 등록
        this.setupInputEvents();
        this.setupFileEvents();
    }

    // --- 채팅 로직 ---
    private setupInputEvents(): void {
        const sendBtn = document.querySelector('.generate-btn');
        sendBtn?.addEventListener('click', () => this.generateReport());

        this.titleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateReport();
        });

        const exampleBtn = document.getElementById('btnExample');
        exampleBtn?.addEventListener('click', () => this.fillExampleData());
    }

    private fillExampleData(): void {
        this.titleInput.value = '2024년 1분기 영업 실적 보고서';
        this.detailInput.value = `- 주요 성과 요약
- 지역별 매출 분석 (그래프 포함)
- 신규 고객 확보 현황
- 2분기 목표 및 전략 제안`;
    }

    private generateReport(): void {
        const title = this.titleInput.value.trim();
        if (!title) {
            alert('주제를 입력해주세요.');
            return;
        }

        // 사용자 메시지 추가
        this.appendMessage('user', title, this.detailInput.value);

        // 로딩 UI
        const loadingId = `loading-${Date.now()}`;
        this.appendLoading(loadingId);

        // 입력창 초기화
        this.titleInput.value = '';
        this.detailInput.value = '';
        this.clearFiles();

        // AI 응답 시뮬레이션
        setTimeout(() => {
            const loadingEl = document.getElementById(loadingId);
            loadingEl?.remove();
            this.appendMessage('ai', `<strong>${title}</strong>에 대한 분석 결과입니다.`);
        }, 2000);
    }

    private appendMessage(role: 'user' | 'ai', title: string, detail: string = ''): void {
        const html = `
            <div class="message-row ${role}">
                <div class="bubble ${role}-bubble">
                    <strong>${title}</strong>
                    ${detail ? `<br>${detail}` : ''}
                </div>
            </div>`;
        this.chatContainer.insertAdjacentHTML('afterbegin', html);
    }

    private appendLoading(id: string): void {
        const html = `
            <div class="message-row ai" id="${id}">
                <div class="bubble ai-bubble">
                    <div class="loading-dots"><span></span><span></span><span></span></div>
                </div>
            </div>`;
        this.chatContainer.insertAdjacentHTML('afterbegin', html);
    }

    public resetChat(): void {
        this.chatContainer.innerHTML = `
            <div class="message-row ai">
                <div class="bubble ai-bubble">안녕하세요! 초기화되었습니다.</div>
            </div>`;
        this.clearFiles();
    }

    // --- 파일 처리 로직 ---
    private setupFileEvents(): void {
        const fileBtn = document.getElementById('btnAttachFile');
        const fileInput = document.getElementById('realFileInput') as HTMLInputElement;

        fileBtn?.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) this.handleFiles(target.files);
        });

        const voiceRecordBtn = document.getElementById('btnVoiceRecord');
        voiceRecordBtn?.addEventListener('click', () => this.voiceRecorder.startRecording());
    }

    private handleFiles(files: FileList): void {
        Array.from(files).forEach(file => {
            this.filesData.file.push(file); // 로직 단순화
        });
        this.renderFileList();
    }

    private renderFileList(): void {
        const fileGrid = this.fileListArea.querySelector('.file-grid');
        if (!fileGrid) return;

        fileGrid.innerHTML = '';
        if (this.filesData.file.length === 0) {
            this.fileListArea.classList.remove('active');
            return;
        }

        this.filesData.file.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item-box';

            // 썸네일 영역
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'thumb-img';
                img.onload = () => URL.revokeObjectURL(img.src); // 메모리 해제
                thumbnail.appendChild(img);
            } else {
                const icon = document.createElement('div');
                icon.className = 'thumb-icon';
                icon.innerHTML = '<i class="fas fa-file-alt"></i>'; // Font Awesome 아이콘
                thumbnail.appendChild(icon);
            }
            
            // 삭제 버튼
            const removeBtn = document.createElement('div');
            removeBtn.className = 'file-remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(index);
            });

            thumbnail.appendChild(removeBtn);
            fileItem.appendChild(thumbnail);

            // 파일 이름
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            fileItem.appendChild(fileName);

            fileGrid.appendChild(fileItem);
        });

        this.fileListArea.classList.add('active');
    }

    private removeFile(index: number): void {
        this.filesData.file.splice(index, 1);
        this.renderFileList();
    }

    private clearFiles(): void {
        this.filesData = { image: [], audio: [], file: [] };
        this.renderFileList();
    }
}

// 앱 실행 (Main 진입점)
new ChatbotApp();