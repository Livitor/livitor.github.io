/**
 * 文字输入模块
 * 处理文字输入、提交和AI诊断功能
 */
class TextInputManager {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.charCounter = document.getElementById('charCounter');
        this.clearTextBtn = document.getElementById('clearTextBtn');
        this.submitTextBtn = document.getElementById('submitTextBtn');
        this.textResult = document.getElementById('textResult');
        this.submittedText = document.getElementById('submittedText');
        this.editTextBtn = document.getElementById('editText');
        this.getTextDiagnosisBtn = document.getElementById('getTextDiagnosisBtn');
        this.uploadedImageDisplayText = document.getElementById('uploadedImageDisplayText');
        this.thumbnailImageText = document.getElementById('thumbnailImageText');
        
        this.maxLength = 500; // 最大字符数
        this.currentText = '';
        
        this.init();
    }
    
    /**
     * 初始化
     */
    init() {
        if (this.textInput) {
            this.bindEvents();
            this.updateCharCounter();
        } else {
            console.error('文字输入元素未找到');
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 输入事件
        this.textInput.addEventListener('input', () => {
            this.updateCharCounter();
        });
        
        // 清空按钮
        if (this.clearTextBtn) {
            this.clearTextBtn.addEventListener('click', () => {
                this.clearText();
            });
        }
        
        // 提交按钮
        if (this.submitTextBtn) {
            this.submitTextBtn.addEventListener('click', () => {
                this.submitText();
            });
        }
        
        // 编辑按钮
        if (this.editTextBtn) {
            this.editTextBtn.addEventListener('click', () => {
                this.editText();
            });
        }
        
        // 获取诊断按钮
        if (this.getTextDiagnosisBtn) {
            this.getTextDiagnosisBtn.addEventListener('click', () => {
                this.getTextDiagnosis();
            });
        }
    }
    
    /**
     * 更新字符计数器
     */
    updateCharCounter() {
        if (!this.textInput || !this.charCounter) return;
        
        const currentLength = this.textInput.value.length;
        this.charCounter.textContent = `${currentLength}/${this.maxLength}`;
        
        // 超出字符限制时的处理
        if (currentLength > this.maxLength) {
            this.charCounter.style.color = '#ff6b6b';
            this.submitTextBtn.disabled = true;
        } else {
            this.charCounter.style.color = '';
            this.submitTextBtn.disabled = false;
        }
    }
    
    /**
     * 清空文本
     */
    clearText() {
        if (!this.textInput) return;
        
        this.textInput.value = '';
        this.updateCharCounter();
        this.textInput.focus();
    }
    
    /**
     * 提交文本
     */
    submitText() {
        if (!this.textInput || !this.submittedText || !this.textResult) return;
        
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showError('请输入文字内容');
            return;
        }
        
        if (text.length > this.maxLength) {
            this.showError(`文字内容超出${this.maxLength}字符限制`);
            return;
        }
        
        // 保存当前文本
        this.currentText = text;
        
        // 显示提交的文本
        this.submittedText.textContent = text;
        this.textResult.style.display = 'block';
        
        // 检查是否有上传的图片
        this.checkAndDisplayImage();
    }
    
    /**
     * 检查并显示上传的图片
     */
    checkAndDisplayImage() {
        if (!this.uploadedImageDisplayText || !this.thumbnailImageText) return;
        
        // 检查是否有上传的图片
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        if (imagePreview && previewImage && imagePreview.style.display !== 'none') {
            this.uploadedImageDisplayText.style.display = 'block';
            this.thumbnailImageText.src = previewImage.src;
        } else {
            this.uploadedImageDisplayText.style.display = 'none';
        }
    }
    
    /**
     * 编辑文本
     */
    editText() {
        if (!this.textInput || !this.textResult) return;
        
        // 将提交的文本重新填入输入框
        this.textInput.value = this.currentText;
        
        // 隐藏结果区域
        this.textResult.style.display = 'none';
        
        // 聚焦输入框
        this.textInput.focus();
        
        // 更新字符计数
        this.updateCharCounter();
    }
    
    /**
     * 获取文本诊断
     */
    async getTextDiagnosis() {
        if (!this.currentText) {
            this.showError('请先提交文字内容');
            return;
        }
        
        // 检查配置状态
        const configValidation = window.configManager ? window.configManager.validateConfig() : { isValid: false, errors: ['配置管理器未加载'] };
        if (!configValidation.isValid) {
            this.showError(`配置错误: ${configValidation.errors.join(', ')}`);
            return;
        }
        
        // 禁用按钮，显示加载状态
        if (this.getTextDiagnosisBtn) {
            this.getTextDiagnosisBtn.disabled = true;
            this.getTextDiagnosisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在分析...';
        }
        
        try {
            // 获取图片数据
            const imageData = window.imageUpload ? window.imageUpload.getImageBase64() : null;
            
            // 构建专家角色的提示词
            let expertPrompt = "你是一位资深的果树植物病虫害诊断专家，拥有丰富的农业植保经验和专业知识。请基于以下信息进行专业诊断：\n\n";
            
            if (imageData) {
                expertPrompt += "【图片分析】请仔细观察植物图片中的症状特征，包括叶片颜色变化、斑点形状、病害分布等。\n";
            }
            
            expertPrompt += `【用户描述】${this.currentText}\n`;
            expertPrompt += "\n请提供：\n1. 病虫害类型的专业诊断\n2. 发病原因分析\n3. 具体的防治措施和用药建议\n4. 预防措施\n\n请使用专业术语，并提供准确、实用的建议。";
            
            // 调用API分析
            const result = await window.apiService.analyzeContent(imageData, expertPrompt);
            
            // 显示结果
            window.apiService.displayResult(result);
            
            // 如果智能交互管理器存在，可以使用它的语音播报功能
            if (window.smartInteractionManager) {
                // 获取当前选择的语言
                const targetLanguage = window.smartInteractionManager.currentLanguage || 'zh-CN';
                
                // 如果选择了非中文语言，进行翻译处理
                if (targetLanguage !== 'zh-CN') {
                    await window.smartInteractionManager.translateAndDisplayResult(result, targetLanguage);
                }
                
                // 开始语音播报
                window.smartInteractionManager.startVoiceBroadcast(result);
            }
            
            this.showSuccess('AI诊断完成');
            
        } catch (error) {
            console.error('AI诊断失败:', error);
            this.showError('AI诊断失败，请重试');
        } finally {
            // 恢复按钮状态
            if (this.getTextDiagnosisBtn) {
                this.getTextDiagnosisBtn.disabled = false;
                this.getTextDiagnosisBtn.innerHTML = '<i class="fas fa-stethoscope"></i> 获取AI诊断建议';
            }
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

        const container = document.querySelector('.text-input-panel');
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

        const container = document.querySelector('.text-input-panel');
        if (container) {
            container.appendChild(successDiv);

            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);
        }
    }
}

// 创建全局实例
document.addEventListener('DOMContentLoaded', () => {
    window.textInputManager = new TextInputManager();
});