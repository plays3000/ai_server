import { HeaderManager } from './header.js';
import { FooterManager } from './footer.js';
import { FileStore } from './types.js';
import { VoiceRecorder } from './voicerecorder.js';

class ChatbotApp {
    private chatContainer: HTMLElement;
    // [확인] types.ts의 FileStore 인터페이스에도 video: File[]가 있어야 합니다.
    private filesData: FileStore = { image: [], video: [], audio: [], file: [] };
    
    // UI Elements
    private titleInput: HTMLInputElement;
    private detailInput: HTMLTextAreaElement;
    private fileListArea: HTMLElement;
    private voiceRecorder: VoiceRecorder;
    
    constructor() {
        this.chatContainer = document.getElementById('chatContainer')!;
        this.titleInput = document.getElementById('reportTitle') as HTMLInputElement;
        this.detailInput = document.getElementById('reportDetail') as HTMLTextAreaElement;
        this.fileListArea = document.getElementById('fileListArea')!;

        // 음성 녹음 완료 시 오디오 배열에 추가
        this.voiceRecorder = new VoiceRecorder((audioFile) => {
            this.filesData.audio.push(audioFile); // audio 배열로 저장
            this.renderFileList();
        });

        this.init();
    }

    private init(): void {
        new HeaderManager(() => this.resetChat());
        new FooterManager();
        
        // 파일 그리드 영역 생성
        const fileGrid = document.createElement('div');
        fileGrid.className = 'file-grid';
        this.fileListArea.appendChild(fileGrid);

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
        this.detailInput.value = `- 주요 성과 요약\n- 지역별 매출 분석 (그래프 포함)\n- 신규 고객 확보 현황\n- 2분기 목표 및 전략 제안`;
    }

    private generateReport(): void {
        const title = this.titleInput.value.trim();
        if (!title) {
            alert('주제를 입력해주세요.');
            return;
        }

        this.appendMessage('user', title, this.detailInput.value);

        const loadingId = `loading-${Date.now()}`;
        this.appendLoading(loadingId);

        this.titleInput.value = '';
        this.detailInput.value = '';
        this.clearFiles();

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
                    ${detail ? `<br>${detail.replace(/\n/g, '<br>')}` : ''}
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
        const imageBtn = document.getElementById('btnAttachImage');
        const imageInput = document.getElementById('realImageInput') as HTMLInputElement;

        // 일반 파일 버튼
        fileBtn?.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) this.handleFiles(target.files);
        });

        // 이미지 전용 버튼 (추가됨)
        imageBtn?.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) this.handleFiles(target.files);
        });

        // 음성 녹음 버튼
        const voiceRecordBtn = document.getElementById('btnVoiceRecord');
        voiceRecordBtn?.addEventListener('click', () => this.voiceRecorder.startRecording());
    }

    private handleFiles(files: FileList): void {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.filesData.image.push(file);
            } else if (file.type.startsWith('video/')) {
                this.filesData.video.push(file);
            } else if (file.type.startsWith('audio/')) {
                this.filesData.audio.push(file);
            } else {
                this.filesData.file.push(file);
            }
        });
        this.renderFileList();
    }

    private renderFileList(): void {
        const fileGrid = this.fileListArea.querySelector('.file-grid');
        if (!fileGrid) return;
        
        fileGrid.innerHTML = '';
        
        const totalFiles = this.filesData.image.length + 
                           this.filesData.video.length + 
                           this.filesData.audio.length + 
                           this.filesData.file.length;

        if (totalFiles === 0) {
            this.fileListArea.classList.remove('active');
            return;
        }

        // 각 카테고리별 렌더링
        this.renderCategory(fileGrid, 'image');
        this.renderCategory(fileGrid, 'video');
        this.renderCategory(fileGrid, 'audio');
        this.renderCategory(fileGrid, 'file');

        this.fileListArea.classList.add('active');
    }
    
    // [중요 수정됨] DOM 생성 로직 구현
    private renderCategory(container: Element, type: keyof FileStore): void {
        this.filesData[type].forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item-box';

            // 1. 삭제 버튼 (type과 index를 함께 전달해야 함)
            const removeBtn = document.createElement('div');
            removeBtn.className = 'file-remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(type, index); // ★ 핵심 수정: 종류와 인덱스를 넘김
            });
            fileItem.appendChild(removeBtn);

            // 2. 썸네일/아이콘 영역
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';

            if (type === 'image') {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'thumb-img';
                img.onload = () => URL.revokeObjectURL(img.src);
                thumbnail.appendChild(img);
            } else {
                const icon = document.createElement('div');
                icon.className = 'thumb-icon';
                
                let iconClass = 'fa-file-alt'; // 기본값
                if (type === 'video') iconClass = 'fa-film';
                else if (type === 'audio') iconClass = 'fa-music';

                icon.innerHTML = `<i class="fas ${iconClass}"></i>`;
                thumbnail.appendChild(icon);
            }
            fileItem.appendChild(thumbnail);

            // 3. 파일명
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            fileName.title = file.name;
            fileItem.appendChild(fileName);

            container.appendChild(fileItem);
        });
    }

    // [중요 수정됨] 삭제 시 어떤 배열(type)에서 지울지 알아야 함
    private removeFile(type: keyof FileStore, index: number): void {
        this.filesData[type].splice(index, 1);
        this.renderFileList();
    }

    private clearFiles(): void {
        this.filesData = { image: [], video: [], audio: [], file: [] };
        this.renderFileList();
    }
}

new ChatbotApp();