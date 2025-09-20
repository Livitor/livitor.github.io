/**
 * 主程序模块
 * 整合所有功能模块，处理用户交互和业务逻辑
 */
class MainApp {
    constructor() {
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.bindEvents();
        this.checkInitialState();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 提交按钮事件
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.handleSubmit();
            });
        }

        // 快速识别按钮事件
        const quickIdentifyBtn = document.getElementById('quickIdentifyBtn');
        if (quickIdentifyBtn) {
            quickIdentifyBtn.addEventListener('click', () => {
                this.handleQuickIdentify();
            });
        }

        // 清空文本按钮事件
        const clearTextBtn = document.getElementById('clearText');
        if (clearTextBtn) {
            clearTextBtn.addEventListener('click', () => {
                this.clearTextInput();
            });
        }

        // 文本输入框回车事件
        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.handleSubmit();
                }
            });
        }

        // 页面加载完成后的初始化
        document.addEventListener('DOMContentLoaded', () => {
            this.onPageLoad();
        });
    }

    /**
     * 页面加载完成后的处理
     */
    onPageLoad() {
        // 检查浏览器兼容性
        this.checkBrowserCompatibility();
        
        // 显示欢迎信息
        this.showWelcomeMessage();
        
        // 初始化工具提示
        this.initTooltips();
        
        // 预加载背景图片
        this.preloadBackgroundImage();
    }

    /**
     * 检查浏览器兼容性
     */
    checkBrowserCompatibility() {
        const issues = [];

        // 检查文件API支持
        if (!window.FileReader) {
            issues.push('文件读取功能不可用');
        }

        // 检查Fetch API支持
        if (!window.fetch) {
            issues.push('网络请求功能不可用');
        }

        if (issues.length > 0) {
            this.showCompatibilityWarning(issues);
        }
    }

    /**
     * 显示兼容性警告
     */
    showCompatibilityWarning(issues) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'error-message';
        warningDiv.innerHTML = `
            <strong>浏览器兼容性警告：</strong><br>
            ${issues.join('<br>')}<br>
            建议使用最新版本的Chrome、Firefox或Safari浏览器。
        `;

        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(warningDiv, container.firstChild);
        }
    }

    /**
     * 显示欢迎信息
     */
    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'success-message';
        welcomeDiv.innerHTML = `
            <strong>欢迎使用AI病虫害检测系统！</strong><br>
            请先配置您的API密钥，然后上传图片或输入文字描述进行病虫害分析。
        `;

        const configSection = document.querySelector('.config-section');
        if (configSection) {
            configSection.appendChild(welcomeDiv);

            // 5秒后自动移除
            setTimeout(() => {
                if (welcomeDiv.parentNode) {
                    welcomeDiv.parentNode.removeChild(welcomeDiv);
                }
            }, 5000);
        }
    }

    /**
     * 初始化工具提示
     */
    initTooltips() {
        // 为需要工具提示的元素添加提示
        const elements = document.querySelectorAll('[data-tooltip]');
        elements.forEach(element => {
            element.classList.add('tooltip');
            const tooltipText = element.getAttribute('data-tooltip');
            element.innerHTML += `<span class="tooltiptext">${tooltipText}</span>`;
        });
    }

    /**
     * 检查初始状态
     */
    checkInitialState() {
        // 检查是否有保存的配置
        const config = configManager.getConfig();
        if (!config.apiKey) {
            this.showConfigReminder();
        }
    }

    /**
     * 显示配置提醒
     */
    showConfigReminder() {
        const reminderDiv = document.createElement('div');
        reminderDiv.className = 'error-message';
        reminderDiv.innerHTML = `
            <strong>配置提醒：</strong>请先点击右上角的设置齿轮配置您的API密钥才能使用分析功能。
        `;

        const uploadSection = document.querySelector('.upload-section');
        if (uploadSection) {
            uploadSection.insertBefore(reminderDiv, uploadSection.firstChild);
        }
    }

    /**
     * 处理提交事件
     */
    async handleSubmit() {
        try {
            // 获取输入内容
            const imageData = imageUpload.getImageBase64();
            const textContent = document.getElementById('textInput').value.trim();

            // 验证输入
            if (!imageData && !textContent) {
                this.showError('请上传图片或输入文字内容');
                return;
            }

            // 禁用提交按钮
            this.setSubmitButtonState(false);

            // 调用API分析
            const result = await apiService.analyzeContent(imageData, textContent);
            
            // 显示结果
            apiService.displayResult(result);

        } catch (error) {
            console.error('提交失败:', error);
            apiService.showError(error.message);
        } finally {
            // 恢复提交按钮
            this.setSubmitButtonState(true);
        }
    }

    /**
     * 处理快速识别事件
     */
    handleQuickIdentify() {
        try {
            // 获取输入内容
            const imageData = imageUpload.getImageBase64();
            const textContent = document.getElementById('textInput').value.trim();

            // 验证输入
            if (!imageData && !textContent) {
                this.showError('请上传图片或输入文字内容');
                return;
            }

            // 禁用快速识别按钮
            this.setQuickIdentifyButtonState(false);

            // 显示加载状态
            apiService.showLoading(true);

            // 模拟处理延迟
            setTimeout(() => {
                try {
                    // 搜索本地案例
                    const searchText = textContent || '植物';
                    const results = pestCaseDB.searchCases(searchText);
                    
                    let result;
                    if (results.length > 0) {
                        // 使用最相关的案例
                        result = pestCaseDB.formatCase(results[0]);
                    } else {
                        // 使用随机案例
                        const randomCase = pestCaseDB.getRandomCase();
                        result = pestCaseDB.formatCase(randomCase);
                    }
                    
                    // 显示结果
                    apiService.displayResult(result);
                    
                } catch (error) {
                    console.error('快速识别失败:', error);
                    apiService.showError('快速识别失败，请重试');
                } finally {
                    // 恢复按钮状态
                    this.setQuickIdentifyButtonState(true);
                    apiService.showLoading(false);
                }
            }, 1500); // 1.5秒延迟，模拟处理时间

        } catch (error) {
            console.error('快速识别失败:', error);
            apiService.showError(error.message);
            this.setQuickIdentifyButtonState(true);
            apiService.showLoading(false);
        }
    }

    /**
     * 清空文本输入
     */
    clearTextInput() {
        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.value = '';
            textInput.focus();
        }
    }

    /**
     * 设置提交按钮状态
     */
    setSubmitButtonState(enabled) {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = !enabled;
            if (!enabled) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 分析中...';
            } else {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 提交分析';
            }
        }
    }

    /**
     * 设置快速识别按钮状态
     */
    setQuickIdentifyButtonState(enabled) {
        const quickIdentifyBtn = document.getElementById('quickIdentifyBtn');
        if (quickIdentifyBtn) {
            quickIdentifyBtn.disabled = !enabled;
            if (!enabled) {
                quickIdentifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 识别中...';
            } else {
                quickIdentifyBtn.innerHTML = '<i class="fas fa-bolt"></i> 快速识别';
            }
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        const textSection = document.querySelector('.text-section');
        if (textSection) {
            textSection.appendChild(errorDiv);

            // 3秒后自动移除
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
        successDiv.textContent = message;

        const textSection = document.querySelector('.text-section');
        if (textSection) {
            textSection.appendChild(successDiv);

            // 3秒后自动移除
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);
        }
    }

    /**
     * 获取当前应用状态
     */
    getAppState() {
        return {
            hasImage: imageUpload.hasImage(),
            hasText: document.getElementById('textInput').value.trim() !== '',
            isProcessing: apiService.getProcessingStatus(),
            configValid: configManager.validateConfig().isValid
        };
    }

    /**
     * 重置应用状态
     */
    resetApp() {
        // 清除图片
        imageUpload.removeImage();
        
        // 清除文本
        this.clearTextInput();
        
        // 清除结果
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
        
        // 停止语音识别
        if (voiceRecognition.getRecordingStatus()) {
            voiceRecognition.stopRecording();
        }
    }

    /**
     * 导出应用数据
     */
    exportAppData() {
        const appState = this.getAppState();
        const config = configManager.getConfig();
        
        const exportData = {
            timestamp: new Date().toISOString(),
            appState: appState,
            config: {
                apiEndpoint: config.apiEndpoint,
                model: config.model
                // 不导出API密钥
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ai_pest_detection_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    /**
     * 预加载背景图片
     */
    async preloadBackgroundImage() {
        try {
            await backgroundManager.preloadBackgroundImage();
        } catch (error) {
            console.error('预加载背景图片失败:', error);
        }
    }

    /**
     * 清理资源
     */
    destroy() {
        // 清理各个模块
        voiceRecognition.destroy();
        imageUpload.destroy();
        apiService.cancelProcessing();
    }
}

// 创建全局应用实例
const mainApp = new MainApp();

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    mainApp.destroy();
});

// 导出到全局作用域（用于调试）
window.mainApp = mainApp;
window.configManager = configManager;
window.voiceRecognition = voiceRecognition;
window.imageUpload = imageUpload;
window.pestCaseDB = pestCaseDB;
window.backgroundManager = backgroundManager;
window.pwaManager = pwaManager;
window.apiService = apiService;
window.settingsManager = settingsManager;
window.menuManager = menuManager; 