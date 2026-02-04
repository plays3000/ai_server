import { HeaderManager } from './header.js';
import { FooterManager } from './footer.js';
import type { FileStore } from './types.js';
import { VoiceRecorder } from './voicerecorder.js';
import configs from "#config" with { type: "json" };

export class ChatbotApp {
    private chatContainer: HTMLElement;
    private filesData: FileStore = { image: [], video: [], audio: [], file: [] };
    
    private titleInput: HTMLInputElement;
    private detailInput: HTMLTextAreaElement;
    private fileListArea: HTMLElement;
    private voiceRecorder: VoiceRecorder;
    
    constructor() {
        this.chatContainer = document.getElementById('chatContainer')!;
        this.titleInput = document.getElementById('reportTitle') as HTMLInputElement;
        this.detailInput = document.getElementById('reportDetail') as HTMLTextAreaElement;
        this.fileListArea = document.getElementById('fileListArea')!;

        this.voiceRecorder = new VoiceRecorder((audioFile) => {
            this.filesData.audio.push(audioFile);
            this.renderFileList();
        });

        this.init();
    }

    private init(): void {
        new HeaderManager(() => this.resetChat());
        new FooterManager();
        
        const fileGrid = document.createElement('div');
        fileGrid.className = 'file-grid';
        this.fileListArea.appendChild(fileGrid);

        this.setupInputEvents();
        this.setupFileEvents();
    }

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
        this.detailInput.value = `- 주요 성과 요약\n- 지역별 매출 분석\n- 신규 고객 확보 현황`;
    }

    private async generateReport(): Promise<void> {
        const userInput = this.detailInput.value;
        const title: string = this.titleInput.value.trim();

        if (!title) {
            alert('주제를 입력해주세요.');
            return;
        }

        const currentFiles: FileStore = {
            image: [...this.filesData.image],
            video: [...this.filesData.video],
            audio: [...this.filesData.audio],
            file: [...this.filesData.file]
        };

        const loadingId = `loading-${Date.now()}`;
        
        // 파일 유효성 검사
        const limit = configs.maxCount;
        const validationErrors: string[] = [];
        if (currentFiles.image.length > limit) validationErrors.push(`이미지는 최대 ${limit}개까지 가능합니다.`);
        if (currentFiles.file.length > limit) validationErrors.push(`파일은 최대 ${limit}개까지 가능합니다.`);

        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            return;
        }

        // UI 업데이트: 사용자 메시지 및 로딩 표시
        this.appendMessage('user', title, userInput, currentFiles);
        this.appendLoading(loadingId);

        // 전송 데이터 준비
        const formData = new FormData();
        formData.append('message', `${title}\n${userInput}`);

        const toSend = [...currentFiles.file, ...currentFiles.image, ...currentFiles.video, ...currentFiles.audio];
        toSend.forEach(f => formData.append('mediaFile', f));

        try {
            // [개선] 서버 통신 및 상세 에러 처리
            const response = await fetch('/chat', {
                method: 'POST',
                body: formData 
                // 세션 기반(쿠키)이므로 credentials 설정은 생략 가능 (기본값 include/same-origin)
            });

            // 응답이 성공(200~299)이 아닌 경우
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 401) {
                    throw new Error('로그인이 필요하거나 세션이 만료되었습니다. 다시 로그인해주세요.');
                }
                throw new Error(errorData.message || `서버 오류가 발생했습니다. (상태 코드: ${response.status})`);
            }

            const data = await response.json();
            
            // 로딩 제거 및 결과 표시
            document.getElementById(loadingId)?.remove();

            // AI 답변 표시
            this.appendMessage('ai', `[분석 결과] ${title}`, data.reply);
            
            // 엑셀 다운로드 링크가 있는 경우 처리
            if (data.downloadUrl) {
                this.appendDownloadLink(data.downloadUrl);
            }

            // 입력창 초기화
            this.titleInput.value = '';
            this.detailInput.value = '';
            this.clearFiles();

        } catch (error: any) {
            console.error('Chatbot Error:', error);
            document.getElementById(loadingId)?.remove();
            
            // 사용자가 알아보기 쉬운 에러 메시지 출력
            alert(error.message || '서버와 통신하는 중 문제가 발생했습니다.');
        }
    }

    // 엑셀 파일 다운로드 링크 전용 렌더링
    private appendDownloadLink(url: string): void {
        const html = `
            <div class="message-row ai">
                <div class="bubble ai-bubble report-link">
                    <i class="fas fa-file-excel"></i>
                    <a href="${url}" target="_blank" style="color: #27ae60; font-weight: bold; text-decoration: underline;">
                        생성된 보고서 다운로드 하기
                    </a>
                </div>
            </div>`;
        this.chatContainer.insertAdjacentHTML('afterbegin', html);
    }

    private appendMessage(role: 'user' | 'ai', title: string, detail: string = '', files?: FileStore): void {
        let attachmentHtml = '';
        if (files) {
            attachmentHtml = '<div class="msg-attachment-area">';
            const mediaFiles = [...files.image, ...files.video];
            if (mediaFiles.length > 0) {
                attachmentHtml += '<div class="msg-media-grid">';
                files.image.forEach(file => {
                    attachmentHtml += `<img src="${URL.createObjectURL(file)}" class="msg-media-item">`;
                });
                files.video.forEach(file => {
                    attachmentHtml += `<video src="${URL.createObjectURL(file)}" controls class="msg-media-item"></video>`;
                });
                attachmentHtml += '</div>';
            }
            const docFiles = [...files.audio, ...files.file];
            if (docFiles.length > 0) {
                attachmentHtml += '<div class="msg-file-list">';
                docFiles.forEach(file => {
                    const icon = file.type.startsWith('audio') ? 'fa-volume-up' : 'fa-file-alt';
                    attachmentHtml += `<div class="msg-file-item"><i class="fas ${icon}"></i> <span>${file.name}</span></div>`;
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
                <div class="bubble ai-bubble">안녕하세요! 대화가 초기화되었습니다.</div>
            </div>`;
        this.clearFiles();
    }

    private setupFileEvents(): void {
        const fileBtn = document.getElementById('btnAttachFile');
        const fileInput = document.getElementById('realFileInput') as HTMLInputElement;
        const imageBtn = document.getElementById('btnAttachImage');
        const imageInput = document.getElementById('realImageInput') as HTMLInputElement;
        const voiceRecordBtn = document.getElementById('btnVoiceRecord');

        fileBtn?.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if ((e.target as HTMLInputElement).files) this.handleFiles((e.target as HTMLInputElement).files!);
        });

        imageBtn?.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => {
            if ((e.target as HTMLInputElement).files) this.handleFiles((e.target as HTMLInputElement).files!);
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
        const total = this.filesData.image.length + this.filesData.video.length + this.filesData.audio.length + this.filesData.file.length;
        if (total === 0) {
            this.fileListArea.classList.remove('active');
            return;
        }
        ['image', 'video', 'audio', 'file'].forEach(type => {
            this.renderCategory(fileGrid, type as keyof FileStore);
        });
        this.fileListArea.classList.add('active');
    }
    
    private renderCategory(container: Element, type: keyof FileStore): void {
        this.filesData[type].forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item-box';
            fileItem.innerHTML = `
                <div class="file-remove-btn">&times;</div>
                <div class="thumbnail"></div>
                <div class="file-name">${file.name}</div>
            `;
            fileItem.querySelector('.file-remove-btn')!.addEventListener('click', () => this.removeFile(type, index));
            
            const thumbArea = fileItem.querySelector('.thumbnail')!;
            if (type === 'image') {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'thumb-img';
                thumbArea.appendChild(img);
            } else {
                const iconClass = type === 'video' ? 'fa-film' : (type === 'audio' ? 'fa-music' : 'fa-file-alt');
                thumbArea.innerHTML = `<div class="thumb-icon"><i class="fas ${iconClass}"></i></div>`;
            }
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