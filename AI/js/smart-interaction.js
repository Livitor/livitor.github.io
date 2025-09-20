/**
 * 智能交互模块
 * 处理语音识别、语音播报和AI诊断功能
 */
class SmartInteractionManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isRecording = false;
        this.isSpeaking = false;
        this.recognizedText = '';
        this.currentLanguage = 'zh-CN';
        this.currentDialect = 'zh-CN';
        this.lastDiagnosisResult = null;
        this.init();
    }

    init() {
        this.initSpeechRecognition();
        this.bindEvents();
        this.loadSettings();
    }

    /**
     * 初始化语音识别
     */
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        }

        if (this.recognition) {
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = this.currentDialect;

            this.recognition.onstart = () => {
                this.onRecognitionStart();
            };

            this.recognition.onresult = (event) => {
                this.onRecognitionResult(event);
            };

            this.recognition.onend = () => {
                this.onRecognitionEnd();
            };

            this.recognition.onerror = (event) => {
                this.onRecognitionError(event);
            };
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 语音识别按钮
        const voiceBtn = document.getElementById('voiceRecognitionBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.toggleRecognition();
            });
        }

        // 重新识别按钮
        const retryBtn = document.getElementById('retryRecognition');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.retryRecognition();
            });
        }

        // 获取诊断建议按钮
        const diagnosisBtn = document.getElementById('getDiagnosisBtn');
        if (diagnosisBtn) {
            diagnosisBtn.addEventListener('click', () => {
                this.getDiagnosis();
            });
        }

        // 重新诊断按钮
        const rediagnosisBtn = document.getElementById('rediagnosisBtn');
        if (rediagnosisBtn) {
            rediagnosisBtn.addEventListener('click', () => {
                this.rediagnosis();
            });
        }

        // 语言选择
        const dialectSelect = document.getElementById('dialectSelect');
        const languageSelect = document.getElementById('languageSelect');
        
        if (dialectSelect) {
            dialectSelect.addEventListener('change', (e) => {
                this.currentDialect = e.target.value;
                this.updateRecognitionLanguage();
                this.saveSettings();
            });
        }

        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                this.saveSettings();
            });
        }
    }

    /**
     * 切换语音识别状态
     */
    toggleRecognition() {
        if (!this.recognition) {
            this.showError('您的浏览器不支持语音识别功能');
            return;
        }

        if (this.isRecording) {
            this.stopRecognition();
        } else {
            this.startRecognition();
        }
    }

    /**
     * 开始语音识别
     */
    startRecognition() {
        try {
            this.recognition.start();
            
            // 设置5秒超时，如果没有识别到语音则自动处理
            this.recognitionTimeout = setTimeout(() => {
                if (this.isRecording) {
                    this.stopRecognition();
                    this.handleNoVoiceInput();
                }
            }, 5000);
        } catch (error) {
            console.error('启动语音识别失败:', error);
            this.showError('启动语音识别失败，请重试');
        }
    }

    /**
     * 停止语音识别
     */
    stopRecognition() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }

    /**
     * 重新识别
     */
    retryRecognition() {
        this.hideRecognitionResult();
        this.recognizedText = '';
        this.startRecognition();
    }

    /**
     * 语音识别开始回调
     */
    onRecognitionStart() {
        this.isRecording = true;
        this.updateVoiceButton(true);
        this.updateVoiceStatus('正在听取您的语音...');
        this.hideRecognitionResult();
    }

    /**
     * 语音识别结果回调
     */
    onRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) {
            this.recognizedText = finalTranscript;
            this.showRecognitionResult(finalTranscript);
        } else if (interimTranscript) {
            this.updateVoiceStatus(`识别中: ${interimTranscript}`);
        }
    }

    /**
     * 语音识别结束回调
     */
    onRecognitionEnd() {
        this.isRecording = false;
        this.updateVoiceButton(false);
        
        // 清除超时定时器
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
            this.recognitionTimeout = null;
        }
        
        if (this.recognizedText) {
            this.updateVoiceStatus('语音识别完成');
        } else {
            this.updateVoiceStatus('未识别到语音内容');
            this.handleNoVoiceInput();
        }
    }

    /**
     * 语音识别错误回调
     */
    onRecognitionError(event) {
        this.isRecording = false;
        this.updateVoiceButton(false);
        
        // 清除超时定时器
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
            this.recognitionTimeout = null;
        }
        
        let errorMessage = '语音识别出错';
        switch (event.error) {
            case 'no-speech':
                errorMessage = '未检测到语音';
                this.handleNoVoiceInput();
                return;
            case 'audio-capture':
                errorMessage = '无法访问麦克风';
                break;
            case 'not-allowed':
                errorMessage = '麦克风权限被拒绝';
                break;
            case 'network':
                errorMessage = '网络错误，请检查网络连接';
                break;
            default:
                errorMessage = `语音识别错误: ${event.error}`;
        }
        
        this.updateVoiceStatus(errorMessage);
        this.showError(errorMessage);
    }

    /**
     * 更新语音按钮状态
     */
    updateVoiceButton(isRecording) {
        const voiceBtn = document.getElementById('voiceRecognitionBtn');
        if (!voiceBtn) return;
        
        // 新的HTML结构中，文字在按钮外部
        const voiceText = document.querySelector('.voice-text');
        
        if (isRecording) {
            voiceBtn.classList.add('recording');
            if (voiceText) voiceText.textContent = '正在录音...点击停止';
        } else {
            voiceBtn.classList.remove('recording');
            if (voiceText) voiceText.textContent = '点击开始语音识别';
        }
    }

    /**
     * 更新语音状态显示
     */
    updateVoiceStatus(message) {
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.textContent = message;
        }
    }

    /**
     * 显示识别结果
     */
    showRecognitionResult(text) {
        const resultSection = document.getElementById('recognitionResult');
        const recognizedTextDiv = document.getElementById('recognizedText');
        const uploadedImageDisplay = document.getElementById('uploadedImageDisplay');
        const thumbnailImage = document.getElementById('thumbnailImage');
        
        if (resultSection && recognizedTextDiv) {
            recognizedTextDiv.textContent = text;
            resultSection.style.display = 'block';
            
            // 检查是否有上传的图片
            const imagePreview = document.getElementById('imagePreview');
            const previewImage = document.getElementById('previewImage');
            
            if (imagePreview && previewImage && imagePreview.style.display !== 'none') {
                if (uploadedImageDisplay && thumbnailImage) {
                    uploadedImageDisplay.style.display = 'block';
                    thumbnailImage.src = previewImage.src;
                }
            } else {
                if (uploadedImageDisplay) {
                    uploadedImageDisplay.style.display = 'none';
                }
            }
        }
    }

    /**
     * 隐藏识别结果
     */
    hideRecognitionResult() {
        const resultSection = document.getElementById('recognitionResult');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
    }

    /**
     * 处理无语音输入的情况
     */
    async handleNoVoiceInput() {
        // 没有识别到语音时，只显示简单提示
        this.updateVoiceStatus('未识别到语音内容');
    }

    /**
     * 获取AI诊断
     */
    async getDiagnosis() {
        const hasVoice = this.recognizedText && this.recognizedText.trim();
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const hasImage = imagePreview && previewImage && imagePreview.style.display !== 'none';

        if (!hasVoice && !hasImage) {
            this.showError('请先进行语音识别或上传图片');
            return;
        }

        // 检查配置状态
        const configValidation = configManager.validateConfig();
        if (!configValidation.isValid) {
            this.showError(`配置错误: ${configValidation.errors.join(', ')}`);
            return;
        }

        await this.performAIAnalysis(this.recognizedText, false);
    }

    /**
     * 重新诊断
     */
    async rediagnosis() {
        if (this.lastDiagnosisResult) {
            await this.performAIAnalysis(this.recognizedText, false);
        } else {
            await this.getDiagnosis();
        }
    }

    /**
     * 执行AI分析
     */
    async performAIAnalysis(voiceText, isAutoAnalysis) {
        const diagnosisBtn = document.getElementById('getDiagnosisBtn');
        const rediagnosisBtn = document.getElementById('rediagnosisBtn');
        
        if (diagnosisBtn) {
            diagnosisBtn.disabled = true;
            diagnosisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在分析...';
        }
        
        if (rediagnosisBtn) {
            rediagnosisBtn.disabled = true;
        }

        try {
            // 获取图片数据
            const imageData = window.imageUpload ? window.imageUpload.getImageBase64() : null;
            
            // 构建专家角色的提示词
            let expertPrompt = "你是一位资深的果树植物病虫害诊断专家，拥有丰富的农业植保经验和专业知识。请基于以下信息进行专业诊断：\n\n";
            
            if (imageData) {
                expertPrompt += "【图片分析】请仔细观察植物图片中的症状特征，包括叶片颜色变化、斑点形状、病害分布等。\n";
            }
            
            if (voiceText && voiceText.trim()) {
                expertPrompt += `【用户描述】${voiceText}\n`;
            }
            
            expertPrompt += "\n请提供：\n1. 病虫害类型的专业诊断\n2. 发病原因分析\n3. 具体的防治措施和用药建议\n4. 预防措施\n\n请使用专业术语，并提供准确、实用的建议。";
            
            // 调用API分析
            // 使用多语言API进行诊断
            // 调用API分析
            const result = await window.apiService.analyzeContent(imageData, expertPrompt);
            
            // 保存诊断结果
            this.lastDiagnosisResult = result;
            
            // 显示结果
            window.apiService.displayResult(result);
            
            // 如果选择了非中文语言，进行翻译处理
            // 如果选择了非中文语言，进行翻译处理
            if (this.currentLanguage !== 'zh-CN') {
                await this.translateAndDisplayResult(result, this.currentLanguage);
            }
            
            // 显示重新诊断按钮
            this.showRediagnosisButton();
            
            // 语音播报结果
            // 开始语音播报（使用新的语音播报管理器）
            this.startVoiceBroadcast(result);
            
            if (isAutoAnalysis) {
                this.showSuccess('已自动完成图片AI分析');
            }
            
        } catch (error) {
            console.error('AI诊断失败:', error);
            this.showError('AI诊断失败，请重试');
        } finally {
            if (diagnosisBtn) {
                diagnosisBtn.disabled = false;
                diagnosisBtn.innerHTML = '<i class="fas fa-stethoscope"></i> 获取AI诊断建议';
            }
            
            if (rediagnosisBtn) {
                rediagnosisBtn.disabled = false;
            }
        }
    }

    /**
     * 显示重新诊断按钮
     */
    showRediagnosisButton() {
        let rediagnosisBtn = document.getElementById('rediagnosisBtn');
        if (!rediagnosisBtn) {
            rediagnosisBtn = document.createElement('button');
            rediagnosisBtn.id = 'rediagnosisBtn';
            rediagnosisBtn.className = 'rediagnosis-btn';
            rediagnosisBtn.innerHTML = '<i class="fas fa-redo"></i> 重新诊断';
            
            // 添加到结果区域
            const resultSection = document.querySelector('.result-section') || document.querySelector('.smart-interaction-section');
            if (resultSection) {
                resultSection.appendChild(rediagnosisBtn);
            }
            
            // 绑定事件
            rediagnosisBtn.addEventListener('click', () => {
                this.rediagnosis();
            });
        }
        
        rediagnosisBtn.style.display = 'inline-flex';
    }

    /**
    /**
     * 开始语音播报诊断结果
     */
    async startVoiceBroadcast(result) {
        try {
            // 检查语音播报管理器是否可用
            if (!window.voiceBroadcastManager || !window.voiceBroadcastManager.isSupported()) {
                console.warn('语音播报不支持或未加载');
                return;
            }

            // 构建诊断结果对象
            const diagnosisResult = this.buildDiagnosisResult(result);
            
            // 获取当前选择的语言
            const targetLanguage = this.currentLanguage || 'zh-CN';
            
            // 开始语音播报
            await window.voiceBroadcastManager.startBroadcast(diagnosisResult, targetLanguage);
            
            this.showSuccess('开始语音播报诊断结果');
            
        } catch (error) {
            console.error('启动语音播报失败:', error);
            this.showError('语音播报启动失败');
        }
    }

    /**
     * 构建诊断结果对象
     */
    buildDiagnosisResult(result) {
        if (typeof result === 'string') {
            // 如果是字符串，尝试解析为结构化数据
            return this.parseResultString(result);
        } else if (result && result.content) {
            return this.parseResultString(result.content);
        }
        
        return {
            diagnosis: result || '诊断完成，请查看详细结果',
            symptoms: '',
            treatment: '',
            prevention: ''
        };
    }

    /**
     * 解析结果字符串为结构化数据
     */
    parseResultString(content) {
        const result = {
            symptoms: '',
            diagnosis: '',
            treatment: '',
            prevention: ''
        };

        // 尝试提取不同部分的内容
        const sections = content.split(/##\s*|###\s*/);
        
        sections.forEach(section => {
            const trimmed = section.trim();
            if (!trimmed) return;
            
            if (trimmed.includes('症状') || trimmed.includes('表现')) {
                result.symptoms = this.extractSectionContent(trimmed);
            } else if (trimmed.includes('诊断') || trimmed.includes('病情') || trimmed.includes('识别')) {
                result.diagnosis = this.extractSectionContent(trimmed);
            } else if (trimmed.includes('治疗') || trimmed.includes('防治') || trimmed.includes('用药')) {
                result.treatment = this.extractSectionContent(trimmed);
            } else if (trimmed.includes('预防') || trimmed.includes('措施')) {
                result.prevention = this.extractSectionContent(trimmed);
            }
        });

        // 如果没有找到结构化内容，将整个内容作为诊断结果
        if (!result.symptoms && !result.diagnosis && !result.treatment && !result.prevention) {
            result.diagnosis = content;
        }

        return result;
    }

    /**
     * 提取章节内容
     */
    extractSectionContent(section) {
        // 移除标题行，保留内容
        const lines = section.split('\n');
        if (lines.length > 1) {
            return lines.slice(1).join('\n').trim();
        }
        return section.trim();
    }

    /**
    /**
     * 清理文本用于语音播报
     */
    cleanTextForSpeech(text) {
        return text
            .replace(/#{1,6}\s*/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/<[^>]*>/g, '')
            .replace(/\n\n+/g, '。 ')
            .replace(/\n/g, '，')
            .replace(/([。！？])/g, '$1 ')
            .replace(/([，；])/g, '$1')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
    /**
     * 翻译并显示结果
     */
    async translateAndDisplayResult(result, targetLanguage) {
        if (targetLanguage === 'zh-CN') {
            return;
        }

        try {
            // 显示翻译提示
            this.showTranslationStatus('正在翻译诊断结果...');
            
            // 构建翻译请求
            const translationPrompt = this.buildTranslationPrompt(result.content, targetLanguage);
            
            // 调用API进行翻译
            const translatedResult = await window.apiService.analyzeContent(null, translationPrompt);
            
            // 更新显示翻译后的结果
            this.displayTranslatedResult(translatedResult, result, targetLanguage);
            
            this.hideTranslationStatus();
            
        } catch (error) {
            console.error('翻译失败:', error);
            this.hideTranslationStatus();
            this.showError('翻译失败，显示原始结果');
        }
    }

    /**
     * 构建翻译提示词
     */
    buildTranslationPrompt(content, targetLanguage) {
        const languageNames = {
            'zh-TW': '繁体中文',
            'zh-HK': '香港繁体中文',
            'zh-MO': '澳门繁体中文',
            'en-US': '英语',
            'en-GB': '英式英语',
            'ja-JP': '日语',
            'ko-KR': '韩语',
            'fr-FR': '法语',
            'de-DE': '德语',
            'es-ES': '西班牙语',
            'ru-RU': '俄语',
            'it-IT': '意大利语',
            'pt-PT': '葡萄牙语',
            'nl-NL': '荷兰语',
            'sv-SE': '瑞典语',
            'da-DK': '丹麦语',
            'no-NO': '挪威语',
            'fi-FI': '芬兰语',
            'pl-PL': '波兰语',
            'cs-CZ': '捷克语',
            'sk-SK': '斯洛伐克语',
            'hu-HU': '匈牙利语',
            'ro-RO': '罗马尼亚语',
            'bg-BG': '保加利亚语',
            'hr-HR': '克罗地亚语',
            'sr-RS': '塞尔维亚语',
            'sl-SI': '斯洛文尼亚语',
            'et-EE': '爱沙尼亚语',
            'lv-LV': '拉脱维亚语',
            'lt-LT': '立陶宛语',
            'tr-TR': '土耳其语',
            'ar-SA': '阿拉伯语',
            'he-IL': '希伯来语',
            'th-TH': '泰语',
            'vi-VN': '越南语',
            'id-ID': '印尼语',
            'ms-MY': '马来语',
            'hi-IN': '印地语',
            'bn-BD': '孟加拉语',
            'ur-PK': '乌尔都语',
            'fa-IR': '波斯语'
        };

        const targetLanguageName = languageNames[targetLanguage] || targetLanguage;

        return `请将以下植物病虫害诊断结果翻译成${targetLanguageName}，保持原有的格式和结构：

${content}

要求：
1. 保持所有标题格式（## 标题）
2. 保持专业术语的准确性
3. 确保农业和植物病理学术语的正确翻译
4. 保持建议的实用性和可操作性
5. 如果某些专业术语没有对应翻译，可以在翻译后用括号标注原文

请直接输出翻译结果，不要添加额外说明。`;
    }

    /**
     * 显示翻译后的结果
     */
    displayTranslatedResult(translatedResult, originalResult, targetLanguage) {
        const resultContent = document.getElementById('resultContent');
        if (!resultContent) return;

        // 获取语言名称
        const languageName = this.getLanguageName(targetLanguage);
        
        // 构建翻译后的显示内容
        const translationNote = `
            <div class="translation-note">
                <i class="fas fa-language"></i>
                <span>已翻译为: ${languageName}</span>
                <button onclick="smartInteractionManager.showOriginalResult()" class="show-original-btn">
                    <i class="fas fa-eye"></i> 查看原文
                </button>
            </div>
        `;

        // 格式化翻译后的内容
        const formattedContent = window.apiService.formatResult(translatedResult);
        
        // 更新显示
        resultContent.innerHTML = translationNote + formattedContent;
        
        // 保存原始结果以便切换查看
        this.originalResult = originalResult;
        this.translatedResult = translatedResult;
        this.currentDisplayLanguage = targetLanguage;
    }

    /**
     * 显示原始结果
     */
    showOriginalResult() {
        if (!this.originalResult) return;

        const resultContent = document.getElementById('resultContent');
        if (!resultContent) return;

        const originalNote = `
            <div class="translation-note">
                <i class="fas fa-language"></i>
                <span>原始语言: 中文</span>
                <button onclick="smartInteractionManager.showTranslatedResult()" class="show-translated-btn">
                    <i class="fas fa-language"></i> 查看翻译
                </button>
            </div>
        `;

        const formattedContent = window.apiService.formatResult(this.originalResult);
        resultContent.innerHTML = originalNote + formattedContent;
    }

    /**
     * 显示翻译结果
     */
    showTranslatedResult() {
        if (!this.translatedResult || !this.currentDisplayLanguage) return;

        this.displayTranslatedResult(this.translatedResult, this.originalResult, this.currentDisplayLanguage);
    }

    /**
     * 获取语言名称
     */
    getLanguageName(langCode) {
        const languageNames = {
            'zh-CN': '中文 (简体)',
            'zh-TW': '中文 (繁体)',
            'zh-HK': '中文 (香港)',
            'zh-MO': '中文 (澳门)',
            'en-US': 'English (US)',
            'en-GB': 'English (UK)',
            'ja-JP': '日本語',
            'ko-KR': '한국어',
            'fr-FR': 'Français',
            'de-DE': 'Deutsch',
            'es-ES': 'Español',
            'ru-RU': 'Русский',
            'it-IT': 'Italiano',
            'pt-PT': 'Português',
            'nl-NL': 'Nederlands',
            'sv-SE': 'Svenska',
            'da-DK': 'Dansk',
            'no-NO': 'Norsk',
            'fi-FI': 'Suomi',
            'pl-PL': 'Polski',
            'cs-CZ': 'Čeština',
            'sk-SK': 'Slovenčina',
            'hu-HU': 'Magyar',
            'ro-RO': 'Română',
            'bg-BG': 'Български',
            'hr-HR': 'Hrvatski',
            'sr-RS': 'Српски',
            'sl-SI': 'Slovenščina',
            'et-EE': 'Eesti',
            'lv-LV': 'Latviešu',
            'lt-LT': 'Lietuvių',
            'tr-TR': 'Türkçe',
            'ar-SA': 'العربية',
            'he-IL': 'עברית',
            'th-TH': 'ไทย',
            'vi-VN': 'Tiếng Việt',
            'id-ID': 'Bahasa Indonesia',
            'ms-MY': 'Bahasa Melayu',
            'hi-IN': 'हिन्दी',
            'bn-BD': 'বাংলা',
            'ur-PK': 'اردو',
            'fa-IR': 'فارسی'
        };

        return languageNames[langCode] || langCode;
    }

    /**
     * 显示翻译状态
     */
    showTranslationStatus(message) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'translationStatus';
        statusDiv.className = 'translation-status';
        statusDiv.innerHTML = `
            <i class="fas fa-language fa-spin"></i>
            <span>${message}</span>
        `;

        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.appendChild(statusDiv);
        }
    }

    /**
     * 隐藏翻译状态
     */
    hideTranslationStatus() {
        const statusDiv = document.getElementById('translationStatus');
        if (statusDiv && statusDiv.parentNode) {
            statusDiv.parentNode.removeChild(statusDiv);
        }
    }

    /**
     * 停止语音播报
     */
    stopSpeaking() {
        if (window.voicePlayback) {
            window.voicePlayback.stop();
        }
        this.isSpeaking = false;
    }

    /**
     * 更新识别语言
     */
    updateRecognitionLanguage() {
        if (this.recognition) {
            this.recognition.lang = this.currentDialect;
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        const settings = {
            currentLanguage: this.currentLanguage,
            currentDialect: this.currentDialect
        };
        localStorage.setItem('smartInteractionSettings', JSON.stringify(settings));
    }

    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('smartInteractionSettings') || '{}');
            
            if (settings.currentLanguage) {
                this.currentLanguage = settings.currentLanguage;
                const languageSelect = document.getElementById('languageSelect');
                if (languageSelect) {
                    languageSelect.value = this.currentLanguage;
                }
            }
            
            if (settings.currentDialect) {
                this.currentDialect = settings.currentDialect;
                const dialectSelect = document.getElementById('dialectSelect');
                if (dialectSelect) {
                    dialectSelect.value = this.currentDialect;
                }
                this.updateRecognitionLanguage();
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        `;

        const container = document.querySelector('.smart-interaction-section');
        if (container) {
            container.appendChild(errorDiv);

            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 3000);
        }
    }

    /**
     * 显示成功信息
     */
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${message}
        `;

        const container = document.querySelector('.smart-interaction-section');
        if (container) {
            container.appendChild(successDiv);

            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);
        }
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isRecording: this.isRecording,
            isSpeaking: this.isSpeaking,
            recognizedText: this.recognizedText,
            currentLanguage: this.currentLanguage,
            currentDialect: this.currentDialect,
            hasRecognitionSupport: !!this.recognition,
            hasSynthesisSupport: !!this.synthesis
        };
    }

    /**
     * 重置状态
     */
    reset() {
        this.stopRecognition();
        this.stopSpeaking();
        this.recognizedText = '';
        this.lastDiagnosisResult = null;
        this.hideRecognitionResult();
        this.updateVoiceStatus('');
        this.hideSpeechControls();
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.stopRecognition();
        this.stopSpeaking();
        
        if (this.recognition) {
            this.recognition.onstart = null;
            this.recognition.onresult = null;
            this.recognition.onend = null;
            this.recognition.onerror = null;
        }
    }
}

// 创建全局实例
const smartInteractionManager = new SmartInteractionManager();

// 页面刷新时自动关闭语音播报
// 页面刷新时自动关闭语音播报
window.addEventListener('beforeunload', () => {
    if (window.smartInteractionManager) {
        window.smartInteractionManager.stopSpeaking();
        window.smartInteractionManager.stopRecognition();
    }
    
    // 停止语音播报管理器
    if (window.voiceBroadcastManager) {
        window.voiceBroadcastManager.stopBroadcast();
    }
});

// 页面可见性变化时处理语音播报
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.smartInteractionManager) {
        // 页面隐藏时暂停语音播报
        if (window.smartInteractionManager.isSpeaking && window.smartInteractionManager.synthesis) {
            window.smartInteractionManager.synthesis.pause();
        }
    } else if (!document.hidden && window.smartInteractionManager) {
        // 页面显示时恢复语音播报
        if (window.smartInteractionManager.isSpeaking && window.smartInteractionManager.synthesis && window.smartInteractionManager.synthesis.paused) {
            window.smartInteractionManager.synthesis.resume();
        }
    }
});

// 导出到全局作用域
window.smartInteractionManager = smartInteractionManager;