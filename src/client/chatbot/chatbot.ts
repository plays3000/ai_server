import { HeaderManager } from './header.js';
import { FooterManager } from './footer.js';
import type { FileStore } from './types.js';
import { VoiceRecorder } from './voicerecorder.js';
import { I18nManager } from '../../client/locale/i18n.js';

class ChatbotApp {
    private chatContainer: HTMLElement;
    private filesData: FileStore = { image: [], video: [], audio: [], file: [] };
    
    // UI Elements
    private titleInput: HTMLInputElement;
    private detailInput: HTMLTextAreaElement;
    private fileListArea: HTMLElement;
    private voiceRecorder: VoiceRecorder;
    
    private mainContent: HTMLElement;

    constructor() {
        this.chatContainer = document.getElementById('chatContainer')!;
        this.titleInput = document.getElementById('reportTitle') as HTMLInputElement;
        this.detailInput = document.getElementById('reportDetail') as HTMLTextAreaElement;
        this.fileListArea = document.getElementById('fileListArea')!;
        this.mainContent = document.getElementById('main-content')!;

        // 음성 녹음 완료 시 오디오 배열에 추가하고 UI 갱신
        this.voiceRecorder = new VoiceRecorder((audioFile) => {
            this.filesData.audio.push(audioFile);
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
        this.setupNavigationEvents(); // mine 버전의 네비게이션 기능 유지

        // [New] 초기화 버튼 (확인 메시지 포함) - mine 버전
        document.getElementById('chatClearBtn')?.addEventListener('click', () => {
            if (confirm(I18nManager.getText('alert_reset'))) {
                this.resetChat();
            }
        });
    }

    private setupNavigationEvents(): void {
        document.getElementById('nav-chat')?.addEventListener('click', () => this.loadContent('/content/chat'));
        document.getElementById('nav-login')?.addEventListener('click', () => this.loadContent('/content/login'));
        document.getElementById('nav-signup')?.addEventListener('click', () => this.loadContent('/content/signup'));
    }

    private async loadContent(url: string): Promise<void> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.mainContent.innerHTML = html;
        } catch (error) {
            console.error('Failed to load content:', error);
            this.mainContent.innerHTML = '<p>Error loading content. Please try again.</p>';
        }
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

    // [병합 중요] 메인 로직: mine의 UI 흐름 + main의 서버 통신
    private async generateReport(): Promise<void> {
        const title = this.titleInput.value.trim();
        const userInput = this.detailInput.value;

        if (!title) {
            alert('주제를 입력해주세요.');
            return;
        }

        // 현재 파일 상태 복사
        const currentFiles: FileStore = {
            image: [...this.filesData.image],
            video: [...this.filesData.video],
            audio: [...this.filesData.audio],
            file: [...this.filesData.file]
        };

        // 1. 사용자 메시지 화면 표시
        this.appendMessage('user', title, userInput, currentFiles);

        // 2. 로딩 표시
        const loadingId = `loading-${Date.now()}`;
        this.appendLoading(loadingId);

        // 3. 서버 전송 준비 (main 버전 로직 채용)
        const formData = new FormData();
        formData.append('message', `${title}\n${userInput}`);

        const allFiles = [
            ...currentFiles.file, 
            ...currentFiles.image, 
            ...currentFiles.video, 
            ...currentFiles.audio
        ];

        for (const f of allFiles) {
            formData.append('mediaFile', f);
        }

        try {
            // 4. 서버 통신
            const response = await fetch('/chat', {
                method: 'POST',
                body: formData 
            });

            if (!response.ok) throw new Error('서버 응답 실패');

            const data = await response.json();
            
            // 5. 로딩 제거 및 AI 답변 표시
            const loadingEl = document.getElementById(loadingId);
            loadingEl?.remove();

            this.appendMessage('ai', `[분석 결과] ${title}`, data.reply);
            
            // 6. 입력창 초기화
            this.titleInput.value = '';
            this.detailInput.value = '';
            this.clearFiles();

        } catch (error) {
            console.error('에러 발생:', error);
            const loadingEl = document.getElementById(loadingId);
            loadingEl?.remove();
            alert('서버와 연결할 수 없습니다.');
        }
    }

    // [mine 버전] 스크롤 처리 함수 (세로쓰기 모드 지원)
    private scrollToBottom(): void {
        const container = this.chatContainer;
        const mode = Array.from(document.body.classList).find(c => c.startsWith('vertical-'));
        
        if (mode === 'vertical-rl') {
            container.scrollLeft = 0; 
        } else if (mode === 'vertical-lr-mongolian' || mode === 'vertical-lr-maya') {
             container.scrollLeft = container.scrollWidth;
        } else {
            container.scrollTop = container.scrollHeight; 
        }
    }

    // [mine 버전] 메시지 추가 (DOM 조작 방식이 더 최신)
    private appendMessage(role: 'user' | 'ai', title: string, detail: string = '', files?: FileStore): void {
        let attachmentHtml = '';
        if (files) {
            attachmentHtml = '<div class="msg-attachment-area">';

            // 미디어 파일
            const mediaFiles = [...files.image, ...files.video];
            if (mediaFiles.length > 0) {
                attachmentHtml += '<div class="msg-media-grid">';
                files.image.forEach(file => {
                    const url = URL.createObjectURL(file);
                    attachmentHtml += `<img src="${url}" class="msg-media-item" alt="${file.name}">`;
                });
                files.video.forEach(file => {
                    const url = URL.createObjectURL(file);
                    attachmentHtml += `<video src="${url}" controls class="msg-media-item"></video>`;
                });
                attachmentHtml += '</div>';
            }

            // 일반 파일
            const docFiles = [...files.audio, ...files.file];
            if (docFiles.length > 0) {
                attachmentHtml += '<div class="msg-file-list">';
                files.audio.forEach(file => {
                    attachmentHtml += `<div class="msg-file-item"><i class="fas fa-volume-up"></i><span>${file.name}</span></div>`;
                });
                files.file.forEach(file => {
                    attachmentHtml += `<div class="msg-file-item"><i class="fas fa-file-alt"></i><span>${file.name}</span></div>`;
                });
                attachmentHtml += '</div>';
            }
            attachmentHtml += '</div>';
        }

        const html = `
            <div class="message-row ${role}">
                <div class="bubble ${role}-bubble">
                    <strong>${title}</strong>
                    ${detail ? `<br>${detail.replace(/\n/g, '<br>')}` : ''}
                    ${attachmentHtml}
                </div>
            </div>`;
            
        this.chatContainer.insertAdjacentHTML('afterbegin', html);
        requestAnimationFrame(() => this.scrollToBottom());
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

    // --- 파일 처리 로직 (mine 버전 사용) ---
    private setupFileEvents(): void {
        const fileBtn = document.getElementById('btnAttachFile');
        const fileInput = document.getElementById('realFileInput') as HTMLInputElement;
        const imageBtn = document.getElementById('btnAttachImage');
        const imageInput = document.getElementById('realImageInput') as HTMLInputElement;
        const voiceRecordBtn = document.getElementById('btnVoiceRecord');

        fileBtn?.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) this.handleFiles(target.files);
        });

        imageBtn?.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) this.handleFiles(target.files);
        });

        voiceRecordBtn?.addEventListener('click', () => this.voiceRecorder.startRecording());
    }

    private handleFiles(files: FileList): void {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) this.filesData.image.push(file);
            else if (file.type.startsWith('video/')) this.filesData.video.push(file);
            else if (file.type.startsWith('audio/')) this.filesData.audio.push(file);
            else this.filesData.file.push(file);
        });
        this.renderFileList();
    }

    private renderFileList(): void {
        const fileGrid = this.fileListArea.querySelector('.file-grid');
        if (!fileGrid) return;
        
        fileGrid.innerHTML = '';
        const totalFiles = this.filesData.image.length + this.filesData.video.length + 
                           this.filesData.audio.length + this.filesData.file.length;

        if (totalFiles === 0) {
            this.fileListArea.classList.remove('active');
            return;
        }

        ['image', 'video', 'audio', 'file'].forEach(type => {
            this.renderCategory(fileGrid, type as keyof FileStore);
        });

        this.fileListArea.classList.add('active');
    }
    
    // [mine 버전] 이벤트 버블링 방지(stopPropagation)가 포함된 안전한 버전
    private renderCategory(container: Element, type: keyof FileStore): void {
        this.filesData[type].forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item-box';

            const removeBtn = document.createElement('div');
            removeBtn.className = 'file-remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 중요: 클릭 이벤트 전파 방지
                this.removeFile(type, index);
            });
            fileItem.appendChild(removeBtn);

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
                const iconClass = type === 'video' ? 'fa-film' : (type === 'audio' ? 'fa-music' : 'fa-file-alt');
                icon.innerHTML = `<i class="fas ${iconClass}"></i>`;
                thumbnail.appendChild(icon);
            }
            fileItem.appendChild(thumbnail);

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            fileName.title = file.name;
            fileItem.appendChild(fileName);

            container.appendChild(fileItem);
        });
    }

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