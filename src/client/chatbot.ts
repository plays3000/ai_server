import { HeaderManager } from './header.js';
import { FooterManager } from './footer.js';
import type { FileStore } from './types.js';
import { VoiceRecorder } from './voicerecorder.js';
import configs from "#config" with { type: "json" };

// 챗봇 애플리케이션의 메인 컨트롤러 클래스
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

        // 음성 녹음 완료 시 오디오 배열에 추가하고 UI 갱신
        this.voiceRecorder = new VoiceRecorder((audioFile) => {
            this.filesData.audio.push(audioFile);
            this.renderFileList();
        });

        this.init();
    }

    // 초기 설정 및 이벤트 바인딩
    private init(): void {
        new HeaderManager(() => this.resetChat());
        new FooterManager();
        
        const fileGrid = document.createElement('div');
        fileGrid.className = 'file-grid';
        this.fileListArea.appendChild(fileGrid);

        this.setupInputEvents();
        this.setupFileEvents();
    }

    // 입력창 관련 이벤트 설정
    private setupInputEvents(): void {
        const sendBtn = document.querySelector('.generate-btn');
        sendBtn?.addEventListener('click', () => this.generateReport());

        this.titleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateReport();
        });

        const exampleBtn = document.getElementById('btnExample');
        exampleBtn?.addEventListener('click', () => this.fillExampleData());
    }

    // 예시 데이터 입력 기능
    private fillExampleData(): void {
        this.titleInput.value = '2024년 1분기 영업 실적 보고서';
        this.detailInput.value = `- 주요 성과 요약\n- 지역별 매출 분석\n- 신규 고객 확보 현황`;
    }

    // 보고서 생성 요청 및 채팅 UI 업데이트
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

        // 1. 사용자 메시지 화면 표시
        this.appendMessage('user', title, userInput, currentFiles);

        // 2. 로딩 표시
        const loadingId = `loading-${Date.now()}`;
        this.appendLoading(loadingId);

        // 3. 파일 업로드 갯수 제한
        const limit = configs.maxCount;
        const validationErrors: string[] = [];

        if (currentFiles.image.length > limit) validationErrors.push(`이미지는 최대 ${limit}개까지 가능합니다.`);
        if (currentFiles.video.length > limit) validationErrors.push(`비디오는 최대 ${limit}개까지 가능합니다.`);
        if (currentFiles.audio.length > limit) validationErrors.push(`오디오는 최대 ${limit}개까지 가능합니다.`);
        if (currentFiles.file.length > limit) validationErrors.push(`일반 파일은 최대 ${limit}개까지 가능합니다.`);

        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            // 로딩 표시가 이미 추가되었다면 제거
            const loadingEl = document.getElementById(loadingId);
            loadingEl?.remove();
            return;
        }

        // 4. 서버로 보낼 데이터 준비
        const formData = new FormData();
        formData.append('message', `${title}\n${userInput}`); // message 변수 대신 조합해서 전달

        // 파일 입력 요소 가져오기

        const fileToSend = currentFiles.file;
        const imgToSend = currentFiles.image;
        const videoToSend = currentFiles.video;
        const audioToSend = currentFiles.audio;
        const toSend = fileToSend.concat(imgToSend).concat(videoToSend).concat(audioToSend)
        if (toSend) {
            // 키 이름을 반드시 'mediaFile'로 서버와 맞춥니다.
            for (const f of toSend){
                formData.append('mediaFile', f);
            }
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

    // 채팅창에 메시지 및 첨부파일 추가
    private appendMessage(role: 'user' | 'ai', title: string, detail: string = '', files?: FileStore): void {
        let attachmentHtml = '';
        if (files) {
            attachmentHtml = '<div class="msg-attachment-area">';

            // 미디어 파일(이미지, 비디오) 렌더링
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

            // 일반 파일 및 오디오 리스트 렌더링
            const docFiles = [...files.audio, ...files.file];
            if (docFiles.length > 0) {
                attachmentHtml += '<div class="msg-file-list">';
                files.audio.forEach(file => {
                    attachmentHtml += `
                        <div class="msg-file-item">
                            <i class="fas fa-volume-up"></i> <span>${file.name}</span>
                        </div>`;
                });
                files.file.forEach(file => {
                    attachmentHtml += `
                        <div class="msg-file-item">
                            <i class="fas fa-file-alt"></i> <span>${file.name}</span>
                        </div>`;
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

    // 로딩 애니메이션 표시
    private appendLoading(id: string): void {
        const html = `
            <div class="message-row ai" id="${id}">
                <div class="bubble ai-bubble">
                    <div class="loading-dots"><span></span><span></span><span></span></div>
                </div>
            </div>`;
        this.chatContainer.insertAdjacentHTML('afterbegin', html);
    }

    // 채팅창 내용 및 파일 초기화
    public resetChat(): void {
        this.chatContainer.innerHTML = `
            <div class="message-row ai">
                <div class="bubble ai-bubble">안녕하세요! 대화가 초기화되었습니다.</div>
            </div>`;
        this.clearFiles();
    }

    // 파일 첨부 관련 버튼 이벤트 설정
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

    // 업로드된 파일을 종류별로 분류하여 저장
    private handleFiles(files: FileList): void {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) this.filesData.image.push(file);
            else if (file.type.startsWith('video/')) this.filesData.video.push(file);
            else if (file.type.startsWith('audio/')) this.filesData.audio.push(file);
            else this.filesData.file.push(file);
        });
        this.renderFileList();
    }

    // 첨부된 파일 목록을 UI에 렌더링
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
    
    // 카테고리별 파일 아이템 생성
    private renderCategory(container: Element, type: keyof FileStore): void {
        this.filesData[type].forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item-box';

            const removeBtn = document.createElement('div');
            removeBtn.className = 'file-remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => this.removeFile(type, index);
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

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            fileItem.appendChild(thumbnail);
            fileItem.appendChild(fileName);
            container.appendChild(fileItem);
        });
    }

    // 특정 파일 삭제
    private removeFile(type: keyof FileStore, index: number): void {
        this.filesData[type].splice(index, 1);
        this.renderFileList();
    }

    // 모든 파일 데이터 삭제
    private clearFiles(): void {
        this.filesData = { image: [], video: [], audio: [], file: [] };
        this.renderFileList();
    }
}