/**
 * 增强语音输入模块
 * 支持多语言语音识别功能，提供更好的跨平台兼容性
 */
class VoiceRecognition {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.isSupported = false;
        this.fallbackMode = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.supportedLanguages = {
            'zh-CN': '中文 (简体)',
            'zh-TW': '中文 (繁体)',
            'en-US': 'English (US)',
            'en-GB': 'English (UK)',
            'ja-JP': '日本語',
            'ko-KR': '한국어',
            'fr-FR': 'Français',
            'de-DE': 'Deutsch',
            'es-ES': 'Español',
            'ru-RU': 'Русский'
        };
        this.init();
    }

    /**
     * 初始化语音识别
     */
    init() {
        this.checkSupport();
        this.bindEvents();
        this.setupFallbackOptions();
    }

    /**
     * 检查浏览器是否支持语音识别
     */
    checkSupport() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            try {
                this.recognition = new SpeechRecognition();
                this.setupRecognition();
                this.isSupported = true;
                console.log('语音识别功能已启用');
                return true;
            } catch (error) {
                console.error('语音识别初始化失败:', error);
            }
        }

        // 检查是否可以使用MediaRecorder作为备选方案
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) {
            this.fallbackMode = true;
            console.log('使用MediaRecorder回退方案');
            this.setupMediaRecorderFallback();
            this.showCompatibilityInfo();
            return true;
        }

        this.showStatus('您的设备不支持语音识别功能', 'error');
        this.disableVoiceButton();
        return false;
    }

    /**
     * 设置MediaRecorder回退方案
     */
    setupMediaRecorderFallback() {
        // 初始化MediaRecorder相关变量
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioUrl = null;
        
        console.log('MediaRecorder回退方案已设置');
    }

    /**
     * 显示兼容性信息
     */
    showCompatibilityInfo() {
        const infoMessage = this.getDeviceInfo();
        this.showNotification(infoMessage, 'info');
    }

    /**
     * 获取设备信息和建议
     */
    getDeviceInfo() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
            return '检测到移动设备。建议使用Chrome浏览器以获得最佳语音识别体验。';
        } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            return '检测到Safari浏览器。语音识别功能可能受限，建议使用Chrome或Firefox。';
        } else if (userAgent.includes('firefox')) {
            return '检测到Firefox浏览器。请确保已启用麦克风权限。';
        } else {
            return '语音识别功能已启用。首次使用时请允许麦克风权限。';
        }
    }

    /**
     * 设置回退选项
     */
    setupFallbackOptions() {
        if (!this.isSupported && !this.fallbackMode) {
            this.showManualInputOption();
        }
    }

    /**
     * 显示手动输入选项
     */
    showManualInputOption() {
        const voicePanel = document.querySelector('.voice-panel');
        if (voicePanel) {
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'voice-fallback';
            fallbackDiv.innerHTML = `
                <div class="fallback-info">
                    <i class="fas fa-info-circle"></i>
                    <p>您的设备不支持语音识别，请使用文字输入描述植物症状</p>
                    <button class="manual-input-btn" onclick="voiceRecognition.focusTextInput()">
                        <i class="fas fa-keyboard"></i> 手动输入
                    </button>
                </div>
            `;
            voicePanel.appendChild(fallbackDiv);
        }
    }

    /**
     * 设置语音识别参数
     */
    setupRecognition() {
        if (!this.recognition) return;

        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.updateLanguage();

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.updateUI();
            this.showStatus('正在录音...', 'recording');
        };

        this.recognition.onresult = (event) => {
            this.handleResult(event);
        };

        this.recognition.onerror = (event) => {
            this.handleError(event);
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            this.updateUI();
            this.showStatus('录音结束', 'success');
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 语音按钮事件由SmartInteractionManager处理
    }

    /**
     * 切换录音状态
     */
    toggleRecording() {
        // 检查是否有语音API服务可用
        if (window.speechAPIService && window.speechAPIService.getCurrentProvider().name === 'baidu') {
            // 使用百度语音API
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
            return;
        }
        
        // 使用Web Speech API
        if (!this.recognition && !this.fallbackMode) {
            this.showStatus('语音识别不可用', 'error');
            this.offerAlternatives();
            return;
        }

        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    /**
     * 开始录音
     */
    async startRecording() {
        // 首先检查麦克风权限
        try {
            await this.checkMicrophonePermission();
            
            // 检查是否使用百度语音API
            if (window.speechAPIService && window.speechAPIService.getCurrentProvider().name === 'baidu') {
                console.log('使用百度语音API进行录音');
                // 使用MediaRecorder录制音频，然后发送给百度API
                await this.startMediaRecorder();
                return;
            }
            
            if (this.isSupported) {
                // 使用Web Speech API
                this.recognition.start();
            } else if (this.fallbackMode) {
                // 使用MediaRecorder回退方案
                await this.startMediaRecorder();
            } else {
                throw new Error('设备不支持语音识别');
            }
        } catch (error) {
            console.error('启动录音失败:', error);
            this.showStatus('启动录音失败', 'error');
            this.handleError({ error: error.name || 'start-failed' });
        }
    }
    
    /**
     * 启动MediaRecorder录音
     */
    async startMediaRecorder() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            });
            
            this.mediaRecorder.addEventListener('start', () => {
                this.isRecording = true;
                this.updateUI();
                this.showStatus('正在录音...', 'recording');
            });
            
            this.mediaRecorder.addEventListener('stop', async () => {
                this.isRecording = false;
                this.updateUI();
                
                if (this.audioChunks.length > 0) {
                    this.showStatus('正在处理录音...', 'processing');
                    await this.processAudioRecording();
                } else {
                    this.showStatus('录音为空', 'error');
                }
            });
            
            this.mediaRecorder.start();
            console.log('MediaRecorder录音已开始');
            
            // 设置最大录音时间（30秒）
            this.recordingTimeout = setTimeout(() => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.stopRecording();
                }
            }, 30000);
            
        } catch (error) {
            console.error('MediaRecorder启动失败:', error);
            throw error;
        }
    }
    
    /**
     * 处理录音数据（将音频转换为文本）
     */
    async processAudioRecording() {
        try {
            // 创建音频Blob
            this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.audioUrl = URL.createObjectURL(this.audioBlob);
            
            // 显示处理中状态
            this.showStatus('正在将语音转换为文本...', 'processing');
            
            // 检查是否使用百度语音API
            if (window.speechAPIService && window.speechAPIService.getCurrentProvider().name === 'baidu') {
                try {
                    console.log('使用百度语音API进行语音识别');
                    
                    // 获取当前语言设置
                    const languageSelect = document.getElementById('languageSelect');
                    const language = languageSelect ? languageSelect.value : 'zh-CN';
                    
                    // 使用百度语音API进行语音转文本
                    const text = await window.speechAPIService.speechToText(this.audioBlob, {
                        language: language.substring(0, 2) // 提取语言代码的前两个字符，如zh-CN变为zh
                    });
                    
                    if (text && text.trim()) {
                        // 处理识别结果
                        this.handleMediaRecorderResult(text);
                        return;
                    } else {
                        this.showStatus('未能识别语音内容', 'error');
                        return;
                    }
                } catch (apiError) {
                    console.error('百度语音API识别失败:', apiError);
                    this.showStatus(`语音识别失败: ${apiError.message}`, 'error');
                    return;
                }
            }
            
            // 如果不是使用百度语音API，尝试使用其他可用的API服务
            if (window.speechAPIService) {
                try {
                    // 获取当前语言设置
                    const languageSelect = document.getElementById('languageSelect');
                    const language = languageSelect ? languageSelect.value : 'zh-CN';
                    
                    // 使用语音API服务进行语音转文本
                    const text = await window.speechAPIService.speechToText(this.audioBlob, {
                        language: language.substring(0, 2) // 提取语言代码的前两个字符，如zh-CN变为zh
                    });
                    
                    if (text && text.trim()) {
                        // 处理识别结果
                        this.handleMediaRecorderResult(text);
                        return;
                    }
                } catch (apiError) {
                    console.warn('语音API服务识别失败，尝试使用备选方案:', apiError);
                }
            }
            
            // 如果语音API服务不可用或识别失败，尝试使用原有API
            if (window.apiService && window.apiService.speechToText) {
                // 使用API服务进行语音转文本
                const text = await window.apiService.speechToText(this.audioBlob);
                if (text && text.trim()) {
                    // 处理识别结果
                    this.handleMediaRecorderResult(text);
                } else {
                    this.showStatus('未能识别语音内容', 'error');
                }
            } else {
                // 如果没有可用的API，显示提示
                this.showStatus('语音识别服务不可用', 'error');
                this.showNotification('请使用文字输入功能', 'warning');
            }
        } catch (error) {
            console.error('处理录音失败:', error);
            this.showStatus('语音识别失败', 'error');
        }
    }
    
    /**
     * 处理MediaRecorder识别结果
     */
    handleMediaRecorderResult(text) {
        const textInput = document.getElementById('textInput');
        if (textInput) {
            const currentText = textInput.value;
            if (currentText.trim() === '') {
                textInput.value = text;
            } else {
                textInput.value = currentText + ' ' + text;
            }
        }
        
        this.showStatus(`识别完成: ${text}`, 'success');
    }

    /**
     * 检查麦克风权限
     */
    async checkMicrophonePermission() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('设备不支持麦克风访问');
        }

        try {
            // 请求麦克风权限
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // 立即停止流，我们只是检查权限
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('麦克风权限检查失败:', error);
            
            if (error.name === 'NotAllowedError') {
                this.showPermissionDeniedDialog();
                throw new Error('麦克风权限被拒绝');
            } else if (error.name === 'NotFoundError') {
                this.showNoMicrophoneDialog();
                throw new Error('未找到麦克风设备');
            } else if (error.name === 'NotReadableError') {
                this.showMicrophoneBusyDialog();
                throw new Error('麦克风被其他应用占用');
            } else {
                throw error;
            }
        }
    }

    /**
     * 显示权限被拒绝对话框
     */
    showPermissionDeniedDialog() {
        this.showNotification('麦克风权限被拒绝，请在浏览器设置中允许麦克风访问', 'error');
        this.showPermissionGuide();
    }

    /**
     * 显示未找到麦克风对话框
     */
    showNoMicrophoneDialog() {
        this.showNotification('未检测到麦克风设备，请检查设备连接', 'warning');
    }

    /**
     * 显示麦克风被占用对话框
     */
    showMicrophoneBusyDialog() {
        this.showNotification('麦克风被其他应用占用，请关闭其他使用麦克风的应用', 'warning');
    }

    /**
     * 停止录音
     */
    stopRecording() {
        try {
            if (this.isSupported && this.recognition) {
                this.recognition.stop();
            } else if (this.fallbackMode && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
                
                // 停止所有音频轨道
                if (this.mediaRecorder.stream) {
                    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                }
                
                // 清除录音超时
                if (this.recordingTimeout) {
                    clearTimeout(this.recordingTimeout);
                    this.recordingTimeout = null;
                }
            }
        } catch (error) {
            console.error('停止录音失败:', error);
        }
    }

    /**
     * 处理语音识别结果
     */
    handleResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        const textInput = document.getElementById('textInput');
        if (textInput) {
            if (finalTranscript) {
                const currentText = textInput.value;
                if (currentText.trim() === '') {
                    textInput.value = finalTranscript;
                } else {
                    textInput.value = currentText + ' ' + finalTranscript;
                }
            } else if (interimTranscript) {
                this.showStatus(`识别中: ${interimTranscript}`, 'recording');
            }
        }

        if (finalTranscript) {
            this.showStatus(`识别完成: ${finalTranscript}`, 'success');
        }
    }

    /**
     * 处理语音识别错误
     */
    handleError(event) {
        console.error('语音识别错误:', event.error);
        
        let errorMessage = '语音识别出错';
        let suggestion = '';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = '没有检测到语音';
                suggestion = '请确保麦克风正常工作，并在安静环境中说话';
                break;
            case 'audio-capture':
                errorMessage = '无法访问麦克风';
                suggestion = '请检查麦克风连接或尝试刷新页面';
                break;
            case 'not-allowed':
            case 'NotAllowedError':
                errorMessage = '麦克风权限被拒绝';
                suggestion = '请在浏览器设置中允许麦克风权限，然后刷新页面';
                this.showPermissionGuide();
                break;
            case 'network':
                errorMessage = '网络连接错误';
                suggestion = '请检查网络连接后重试';
                break;
            case 'service-not-allowed':
                errorMessage = '语音识别服务不可用';
                suggestion = '请尝试使用其他浏览器或稍后重试';
                break;
            case 'aborted':
                errorMessage = '语音识别被中断';
                suggestion = '请重新开始录音';
                break;
            default:
                errorMessage = `识别错误: ${event.error}`;
                suggestion = '请尝试重新录音或使用文字输入';
        }

        this.showStatus(errorMessage, 'error');
        if (suggestion) {
            this.showNotification(suggestion, 'warning');
        }

        if (event.error === 'not-allowed' || event.error === 'NotAllowedError') {
            this.offerAlternatives();
        }
    }

    /**
     * 显示状态
     */
    showStatus(message, status = 'info') {
        const statusElement = document.getElementById('voiceStatus');
        if (!statusElement) {
            console.log('状态消息:', message, '(状态:', status, ')');
            return;
        }

        statusElement.textContent = message;
        statusElement.className = 'voice-status ' + status;
        
        // 在控制台也输出状态，便于调试
        console.log('语音状态:', message, '(', status, ')');
    }
    
    /**
     * 添加设备特定的权限指南
     */
    addDeviceSpecificGuide(guideElement) {
        const deviceInfo = this.getDeviceInfo();
        const guideBody = guideElement.querySelector('.guide-body');
        
        if (!guideBody) return;
        
        // 为不同设备添加特定指南
        if (deviceInfo.isMobile) {
            const mobileGuide = document.createElement('div');
            mobileGuide.className = 'guide-step';
            mobileGuide.style.marginBottom = '20px';
            mobileGuide.innerHTML = `
                <h4 style="color: #FF9800; margin-bottom: 10px;">移动设备特别说明:</h4>
                <ul style="padding-left: 20px; line-height: 1.6;">
                    <li>安卓设备: 点击地址栏右侧的⋮图标 → 设置 → 网站设置 → 麦克风</li>
                    <li>iOS设备: 请在设置 → Safari → 相机与麦克风访问权限中允许</li>
                    <li>微信内置浏览器可能不支持语音识别，请尝试使用系统浏览器</li>
                </ul>
            `;
            guideBody.appendChild(mobileGuide);
        }
        
        // 添加浏览器特定指南
        const browserType = deviceInfo.browser;
        if (browserType === 'firefox') {
            const firefoxGuide = document.createElement('div');
            firefoxGuide.className = 'guide-step';
            firefoxGuide.style.marginBottom = '20px';
            firefoxGuide.innerHTML = `
                <h4 style="color: #FF9800; margin-bottom: 10px;">Firefox浏览器:</h4>
                <ol style="padding-left: 20px; line-height: 1.6;">
                    <li>点击地址栏左侧的锁定图标</li>
                    <li>选择"连接安全"</li>
                    <li>点击"权限"选项卡</li>
                    <li>找到"使用麦克风"并设置为"允许"</li>
                </ol>
            `;
            guideBody.appendChild(firefoxGuide);
        } else if (browserType === 'safari') {
            const safariGuide = document.createElement('div');
            safariGuide.className = 'guide-step';
            safariGuide.style.marginBottom = '20px';
            safariGuide.innerHTML = `
                <h4 style="color: #FF9800; margin-bottom: 10px;">Safari浏览器:</h4>
                <ol style="padding-left: 20px; line-height: 1.6;">
                    <li>点击Safari菜单 → 偏好设置</li>
                    <li>选择"网站"选项卡</li>
                    <li>在左侧找到"麦克风"</li>
                    <li>找到当前网站并设置为"允许"</li>
                    <li>注意：Safari对语音识别支持有限，建议使用Chrome</li>
                </ol>
            `;
            guideBody.appendChild(safariGuide);
        }
    }

    /**
     * 创建权限设置指南
     */
    createPermissionGuide() {
        const modal = document.createElement('div');
        modal.className = 'permission-guide-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="permission-guide-content" style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            ">
                <div class="guide-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 15px;
                ">
                    <h3 style="margin: 0; color: #333; font-size: 18px;">
                        <i class="fas fa-microphone-slash" style="color: #f44336; margin-right: 8px;"></i>
                        麦克风权限设置
                    </h3>
                    <button class="guide-close" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                        padding: 5px;
                    ">&times;</button>
                </div>
                <div class="guide-body">
                    <div class="guide-step" style="margin-bottom: 20px;">
                        <h4 style="color: #4CAF50; margin-bottom: 10px;">Chrome浏览器 (推荐):</h4>
                        <ol style="padding-left: 20px; line-height: 1.6;">
                            <li>点击地址栏左侧的 <strong>🔒</strong> 或 <strong>🛡️</strong> 图标</li>
                            <li>在弹出菜单中找到"麦克风"选项</li>
                            <li>将权限设置为"<strong>允许</strong>"</li>
                            <li>刷新页面重新尝试</li>
                        </ol>
                    </div>
                    <div class="guide-step" style="margin-bottom: 20px;">
                        <h4 style="color: #2196F3; margin-bottom: 10px;">移动设备:</h4>
                        <ol style="padding-left: 20px; line-height: 1.6;">
                            <li>在浏览器菜单中找到"设置"</li>
                            <li>选择"网站设置"或"权限"</li>
                            <li>找到此网站并允许麦克风访问</li>
                            <li>或者尝试使用下方的文字输入功能</li>
                        </ol>
                    </div>
                    <div class="guide-step">
                        <h4 style="color: #FF9800; margin-bottom: 10px;">其他解决方案:</h4>
                        <ul style="padding-left: 20px; line-height: 1.6;">
                            <li>检查设备麦克风是否正常工作</li>
                            <li>关闭其他可能占用麦克风的应用</li>
                            <li>尝试重启浏览器</li>
                            <li>使用文字描述替代语音输入</li>
                        </ul>
                    </div>
                </div>
                <div class="guide-actions" style="
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                ">
                    <button class="guide-btn-secondary" onclick="voiceRecognition.focusTextInput(); document.body.removeChild(this.closest('.permission-guide-modal'));" style="
                        background: #f5f5f5;
                        border: 1px solid #ddd;
                        color: #666;
                        padding: 10px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <i class="fas fa-keyboard"></i> 使用文字输入
                    </button>
                    <button class="guide-btn-primary" onclick="location.reload()" style="
                        background: #4CAF50;
                        border: none;
                        color: white;
                        padding: 10px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <i class="fas fa-refresh"></i> 刷新页面
                    </button>
                </div>
            </div>
        `;

        const closeBtn = modal.querySelector('.guide-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        return modal;
    }

    /**
     * 提供替代方案
     */
    offerAlternatives() {
        const alternatives = document.createElement('div');
        alternatives.className = 'voice-alternatives';
        alternatives.innerHTML = `
            <div class="alternatives-content">
                <h4><i class="fas fa-lightbulb"></i> 其他输入方式</h4>
                <div class="alternative-options">
                    <button class="alt-btn" onclick="voiceRecognition.focusTextInput()">
                        <i class="fas fa-keyboard"></i>
                        <span>文字描述</span>
                    </button>
                    <button class="alt-btn" onclick="voiceRecognition.showSymptomSelector()">
                        <i class="fas fa-list-check"></i>
                        <span>症状选择</span>
                    </button>
                    <button class="alt-btn" onclick="voiceRecognition.showCommonIssues()">
                        <i class="fas fa-book-open"></i>
                        <span>常见问题</span>
                    </button>
                </div>
            </div>
        `;

        const voicePanel = document.querySelector('.voice-panel');
        if (voicePanel && !voicePanel.querySelector('.voice-alternatives')) {
            voicePanel.appendChild(alternatives);
        }
    }

    /**
     * 聚焦到文本输入框
     */
    focusTextInput() {
        const textInput = document.getElementById('textInput') || document.querySelector('textarea') || document.querySelector('input[type="text"]');
        if (textInput) {
            textInput.focus();
            textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInFromRight 0.3s ease-out;
        `;
        
        const iconMap = {
            'info': 'fas fa-info-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-exclamation-circle',
            'success': 'fas fa-check-circle'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="${iconMap[type] || iconMap.info}"></i>
                <span style="flex: 1;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 0; margin-left: 8px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        if (type === 'error') {
            notification.style.background = 'rgba(244, 67, 54, 0.9)';
        } else if (type === 'warning') {
            notification.style.background = 'rgba(255, 193, 7, 0.9)';
        } else if (type === 'info') {
            notification.style.background = 'rgba(33, 150, 243, 0.9)';
        }

        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutToRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        container.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    /**
     * 更新语言设置
     */
    updateLanguage() {
        if (!this.recognition) return;

        // 获取方言选择和语言选择
        const dialectSelect = document.getElementById('dialectSelect');
        const languageSelect = document.getElementById('languageSelect');
        
        let recognitionLanguage = 'zh-CN'; // 默认普通话
        
        // 优先使用方言设置
        if (dialectSelect && dialectSelect.value !== 'zh-CN') {
            const dialectValue = dialectSelect.value;
            
            // 检查是否为中文方言
            if (dialectValue.startsWith('zh-CN-')) {
                // 对于中文方言，统一使用zh-CN进行语音识别
                recognitionLanguage = 'zh-CN';
                console.log(`方言选择: ${dialectValue}, 使用语音识别语言: ${recognitionLanguage}`);
            } else {
                recognitionLanguage = dialectValue;
            }
        } else if (languageSelect) {
            // 使用语言选择
            recognitionLanguage = languageSelect.value;
        }
        
        // 验证语言代码格式
        if (!this.isValidLanguageCode(recognitionLanguage)) {
            console.warn(`无效的语言代码: ${recognitionLanguage}, 回退到zh-CN`);
            recognitionLanguage = 'zh-CN';
        }
        
        this.recognition.lang = recognitionLanguage;
        console.log(`语音识别语言已设置为: ${recognitionLanguage}`);
    }

    /**
     * 验证语言代码是否有效
     */
    isValidLanguageCode(langCode) {
        const validCodes = [
            'zh-CN', 'zh-TW', 'zh-HK', 'zh-MO',
            'en-US', 'en-GB', 'ja-JP', 'ko-KR',
            'fr-FR', 'de-DE', 'es-ES', 'ru-RU',
            'it-IT', 'pt-PT', 'nl-NL', 'sv-SE',
            'da-DK', 'no-NO', 'fi-FI', 'pl-PL',
            'cs-CZ', 'sk-SK', 'hu-HU', 'ro-RO',
            'bg-BG', 'hr-HR', 'sr-RS', 'sl-SI',
            'et-EE', 'lv-LV', 'lt-LT', 'tr-TR',
            'ar-SA', 'he-IL', 'th-TH', 'vi-VN',
            'id-ID', 'ms-MY', 'hi-IN', 'bn-BD',
            'ur-PK', 'fa-IR'
        ];
        return validCodes.includes(langCode);
    }

    /**
     * 更新UI状态
     */
    updateUI() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (!voiceBtn) return;

        const btnIcon = voiceBtn.querySelector('i');
        const btnText = voiceBtn.querySelector('span');

        if (this.isRecording) {
            voiceBtn.classList.add('recording');
            if (btnIcon) btnIcon.className = 'fas fa-stop';
            if (btnText) btnText.textContent = '停止录音';
        } else {
            voiceBtn.classList.remove('recording');
            if (btnIcon) btnIcon.className = 'fas fa-microphone';
            if (btnText) btnText.textContent = '开始录音';
        }
    }

    /**
     * 获取设备信息和建议
     */
    getDeviceInfo() {
        const userAgent = navigator.userAgent.toLowerCase();
        const deviceInfo = {
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            os: 'unknown',
            browser: 'unknown',
            message: ''
        };
        
        // 检测设备类型
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
            deviceInfo.isMobile = true;
            deviceInfo.isDesktop = false;
            
            if (userAgent.includes('ipad') || (userAgent.includes('tablet') && !userAgent.includes('mobile'))) {
                deviceInfo.isTablet = true;
                deviceInfo.isMobile = false;
            }
        }
        
        // 检测操作系统
        if (userAgent.includes('android')) {
            deviceInfo.os = 'android';
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
            deviceInfo.os = 'ios';
        } else if (userAgent.includes('windows')) {
            deviceInfo.os = 'windows';
        } else if (userAgent.includes('mac')) {
            deviceInfo.os = 'macos';
        } else if (userAgent.includes('linux')) {
            deviceInfo.os = 'linux';
        }
        
        // 检测浏览器
        if (userAgent.includes('edg')) {
            deviceInfo.browser = 'edge';
        } else if (userAgent.includes('chrome')) {
            deviceInfo.browser = 'chrome';
        } else if (userAgent.includes('firefox')) {
            deviceInfo.browser = 'firefox';
        } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            deviceInfo.browser = 'safari';
        } else if (userAgent.includes('opr') || userAgent.includes('opera')) {
            deviceInfo.browser = 'opera';
        }
        
        // 生成建议消息
        if (deviceInfo.isMobile) {
            if (deviceInfo.os === 'ios') {
                deviceInfo.message = '检测到iOS设备。iOS上语音识别支持有限，建议使用Safari浏览器并确保已授予麦克风权限。';
            } else {
                deviceInfo.message = '检测到移动设备。建议使用Chrome浏览器以获得最佳语音识别体验。';
            }
        } else if (deviceInfo.browser === 'safari') {
            deviceInfo.message = '检测到Safari浏览器。语音识别功能可能受限，建议使用Chrome或Firefox。';
        } else if (deviceInfo.browser === 'firefox') {
            deviceInfo.message = '检测到Firefox浏览器。请确保已启用麦克风权限。';
        } else {
            deviceInfo.message = '语音识别功能已启用。首次使用时请允许麦克风权限。';
        }
        
        return deviceInfo;
    }

    /**
     * 禁用语音按钮
     */
    disableVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.disabled = true;
            voiceBtn.style.opacity = '0.5';
            voiceBtn.style.cursor = 'not-allowed';
        }
    }

    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * 检查当前语言是否支持
     */
    isLanguageSupported(language) {
        return language in this.supportedLanguages;
    }

    /**
     * 获取当前选择的语言
     */
    getCurrentLanguage() {
        const languageSelect = document.getElementById('languageSelect');
        return languageSelect ? languageSelect.value : 'zh-CN';
    }

    /**
     * 设置语言
     */
    setLanguage(language) {
        if (!this.isLanguageSupported(language)) {
            console.warn(`不支持的语言: ${language}`);
            return false;
        }

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = language;
            this.updateLanguage();
            return true;
        }
        return false;
    }

    /**
     * 获取录音状态
     */
    getRecordingStatus() {
        return this.isRecording;
    }

    /**
     * 检查设备类型
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * 检查浏览器类型
     */
    getBrowserType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('chrome')) return 'chrome';
        if (userAgent.includes('firefox')) return 'firefox';
        if (userAgent.includes('safari')) return 'safari';
        if (userAgent.includes('edge')) return 'edge';
        return 'unknown';
    }

    /**
     * 清理资源
     */
    destroy() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        this.recognition = null;
        this.mediaRecorder = null;
    }
}

// 创建全局语音识别实例
const voiceRecognition = new VoiceRecognition();

// 导出到全局作用域
window.voiceRecognition = voiceRecognition;