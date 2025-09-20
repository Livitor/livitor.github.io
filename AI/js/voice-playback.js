/**
 * 语音播报功能模块
 * 支持多语言、方言选择和播报控制
 */

class VoicePlayback {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.voices = [];
        this.currentText = '';
        this.currentLanguage = 'zh-CN';
        this.currentDialect = 'zh-CN';
        
        this.init();
    }

    init() {
        this.loadVoices();
        this.bindEvents();
        this.updateVoiceOptions();
        
        // 监听语音合成事件
        if (this.synthesis) {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.loadVoices();
                this.updateVoiceOptions();
            });
        }
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
    }

    updateVoiceOptions() {
        const voiceSelect = document.getElementById('voiceSelect');
        if (!voiceSelect) return;

        // 清空现有选项
        voiceSelect.innerHTML = '<option value="default">默认声音</option>';

        // 根据当前语言筛选可用声音
        const currentLang = this.getCurrentLanguage();
        const availableVoices = this.voices.filter(voice => 
            voice.lang.startsWith(currentLang.split('-')[0])
        );

        availableVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    getCurrentLanguage() {
        const dialectSelect = document.getElementById('dialectSelect');
        const languageSelect = document.getElementById('languageSelect');
        
        if (dialectSelect && dialectSelect.value !== 'zh-CN') {
            return dialectSelect.value;
        }
        
        return languageSelect ? languageSelect.value : 'zh-CN';
    }

    bindEvents() {
        // 播放按钮
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.play());
        }

        // 暂停按钮
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }

        // 停止按钮
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }

        // 测试声音按钮
        const testVoiceBtn = document.getElementById('testVoiceBtn');
        if (testVoiceBtn) {
            testVoiceBtn.addEventListener('click', () => this.testVoice());
        }

        // 语言选择变化
        const dialectSelect = document.getElementById('dialectSelect');
        const languageSelect = document.getElementById('languageSelect');
        
        if (dialectSelect) {
            dialectSelect.addEventListener('change', () => {
                this.currentDialect = dialectSelect.value;
                this.updateVoiceOptions();
            });
        }

        if (languageSelect) {
            languageSelect.addEventListener('change', () => {
                this.currentLanguage = languageSelect.value;
                this.updateVoiceOptions();
            });
        }

        // 播报速度和音量控制
        const speechRate = document.getElementById('speechRate');
        const speechVolume = document.getElementById('speechVolume');

        if (speechRate) {
            speechRate.addEventListener('input', (e) => {
                const rateValue = document.querySelector('.rate-value');
                if (rateValue) {
                    rateValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
                }
            });
        }

        if (speechVolume) {
            speechVolume.addEventListener('input', (e) => {
                const volumeValue = document.querySelector('.volume-value');
                if (volumeValue) {
                    volumeValue.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
                }
            });
        }
    }

    createUtterance(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // 设置语言
        utterance.lang = this.getCurrentLanguage();
        
        // 设置声音
        const voiceSelect = document.getElementById('voiceSelect');
        if (voiceSelect && voiceSelect.value !== 'default') {
            const selectedVoice = this.voices.find(voice => voice.name === voiceSelect.value);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        // 设置播报参数
        const speechRate = document.getElementById('speechRate');
        const speechVolume = document.getElementById('speechVolume');
        
        if (speechRate) {
            utterance.rate = parseFloat(speechRate.value);
        }
        
        if (speechVolume) {
            utterance.volume = parseFloat(speechVolume.value);
        }

        // 设置事件监听器
        utterance.onstart = () => {
            this.isPlaying = true;
            this.isPaused = false;
            this.updateControlButtons();
            this.showSpeechStatus(true);
        };

        utterance.onend = () => {
            this.isPlaying = false;
            this.isPaused = false;
            this.currentUtterance = null;
            this.updateControlButtons();
            this.showSpeechStatus(false);
        };

        utterance.onerror = (event) => {
            console.error('语音播报错误:', event.error);
            this.isPlaying = false;
            this.isPaused = false;
            this.currentUtterance = null;
            this.updateControlButtons();
            this.showSpeechStatus(false);
            this.showNotification('语音播报出现错误', 'error');
        };

        utterance.onpause = () => {
            this.isPaused = true;
            this.updateControlButtons();
        };

        utterance.onresume = () => {
            this.isPaused = false;
            this.updateControlButtons();
        };

        return utterance;
    }

    speak(text) {
        if (!text || !this.synthesis) {
            this.showNotification('无法进行语音播报', 'error');
            return;
        }

        // 停止当前播报
        this.stop();

        this.currentText = text;
        this.currentUtterance = this.createUtterance(text);
        
        try {
            this.synthesis.speak(this.currentUtterance);
        } catch (error) {
            console.error('语音播报失败:', error);
            this.showNotification('语音播报失败', 'error');
        }
    }

    play() {
        if (!this.currentText) {
            this.showNotification('没有可播报的内容', 'warning');
            return;
        }

        if (this.isPaused && this.synthesis.paused) {
            this.synthesis.resume();
        } else if (!this.isPlaying) {
            this.speak(this.currentText);
        }
    }

    pause() {
        if (this.isPlaying && !this.isPaused) {
            this.synthesis.pause();
        }
    }

    stop() {
        if (this.synthesis.speaking || this.synthesis.pending) {
            this.synthesis.cancel();
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.updateControlButtons();
        this.showSpeechStatus(false);
    }

    testVoice() {
        const currentLang = this.getCurrentLanguage();
        let testText = '';

        // 根据语言选择测试文本
        if (currentLang.startsWith('zh')) {
            if (currentLang.includes('guangdong')) {
                testText = '你好，我系穗安巡视官智能诊断系统，可以帮你识别植物病虫害。';
            } else if (currentLang.includes('sichuan')) {
                testText = '你好，我是穗安巡视官智能诊断系统，可以帮你识别植物病虫害撒。';
            } else {
                testText = '您好，我是穗安巡视官智能诊断系统，可以帮助您识别植物病虫害。';
            }
        } else if (currentLang.startsWith('en')) {
            testText = 'Hello, I am the Sui\'an Inspector intelligent diagnosis system, I can help you identify plant diseases and pests.';
        } else if (currentLang.startsWith('ja')) {
            testText = 'こんにちは、私は穂安巡視官インテリジェント診断システムです。植物の病気や害虫の識別をお手伝いできます。';
        } else if (currentLang.startsWith('ko')) {
            testText = '안녕하세요, 저는 수이안 인스펙터 지능형 진단 시스템입니다. 식물 질병과 해충 식별을 도와드릴 수 있습니다.';
        } else {
            testText = 'Hello, this is a voice test for the plant disease diagnosis system.';
        }

        this.speak(testText);
    }

    updateControlButtons() {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');

        if (playBtn) {
            playBtn.disabled = this.isPlaying && !this.isPaused;
            playBtn.classList.toggle('active', this.isPlaying && !this.isPaused);
        }

        if (pauseBtn) {
            pauseBtn.disabled = !this.isPlaying || this.isPaused;
            pauseBtn.classList.toggle('active', this.isPaused);
        }

        if (stopBtn) {
            stopBtn.disabled = !this.isPlaying;
        }
    }

    showSpeechStatus(show) {
        const speechStatus = document.getElementById('speechStatus');
        if (speechStatus) {
            speechStatus.style.display = show ? 'block' : 'none';
            
            if (show) {
                // 模拟进度条动画
                const progressFill = document.getElementById('speechProgress');
                if (progressFill) {
                    progressFill.style.width = '0%';
                    // 简单的进度模拟，实际应该根据语音播报进度来更新
                    let progress = 0;
                    const interval = setInterval(() => {
                        if (!this.isPlaying || this.isPaused) {
                            clearInterval(interval);
                            return;
                        }
                        progress += 2;
                        if (progress >= 100) {
                            progress = 100;
                            clearInterval(interval);
                        }
                        progressFill.style.width = `${progress}%`;
                    }, 100);
                }
            }
        }
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加到通知容器
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // 自动移除通知
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // 设置要播报的文本
    setText(text) {
        this.currentText = text;
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.disabled = !text;
        }
    }

    // 获取当前设置
    getSettings() {
        return {
            language: this.getCurrentLanguage(),
            dialect: this.currentDialect,
            voice: document.getElementById('voiceSelect')?.value || 'default',
            rate: parseFloat(document.getElementById('speechRate')?.value || 1),
            volume: parseFloat(document.getElementById('speechVolume')?.value || 0.8)
        };
    }
}

// 全局实例
let voicePlayback = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    voicePlayback = new VoicePlayback();
});

// 导出给其他模块使用
window.VoicePlayback = VoicePlayback;
window.voicePlayback = voicePlayback;