/**
 * 快速语音识别模块
 * 用于从本地数据库中获取通用病虫害信息，无需调用API，提供即时反馈
 */
class LocalVoiceRecognition {
    constructor() {
        this.pestCaseDB = window.pestCaseDB;
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const localVoiceBtn = document.getElementById('localVoiceRecognitionBtn');
        if (localVoiceBtn) {
            localVoiceBtn.addEventListener('click', () => {
                this.startLocalRecognition();
            });
        }
    }

    /**
     * 开始快速识别
     */
    async startLocalRecognition() {
        try {
            // 使用与原有语音识别相同的UI反馈
            this.updateVoiceStatus('正在进行快速识别...');
            
            // 模拟语音识别过程
            await this.simulateRecognition();
            
            // 设置识别结果为"病虫检测"
            this.setRecognizedText('病虫检测');
            
            // 显示识别结果
            this.showRecognitionResult('病虫检测');
            
            // 更新状态
            this.updateVoiceStatus('快速识别完成');
        } catch (error) {
            console.error('快速识别失败:', error);
            this.updateVoiceStatus('快速识别失败');
        }
    }

    /**
     * 模拟识别过程
     */
    async simulateRecognition() {
        return new Promise(resolve => {
            // 模拟识别延迟
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    /**
     * 设置识别文本
     */
    setRecognizedText(text) {
        // 如果存在全局语音识别实例，更新其识别文本
        if (window.smartInteractionManager) {
            window.smartInteractionManager.recognizedText = text;
        }
    }

    /**
     * 显示识别结果
     */
    showRecognitionResult(text) {
        const resultSection = document.getElementById('recognitionResult');
        const recognizedTextDiv = document.getElementById('recognizedText');
        
        if (resultSection && recognizedTextDiv) {
            recognizedTextDiv.textContent = text;
            resultSection.style.display = 'block';
            
            // 检查是否有上传的图片
            const imagePreview = document.getElementById('imagePreview');
            const previewImage = document.getElementById('previewImage');
            const uploadedImageDisplay = document.getElementById('uploadedImageDisplay');
            const thumbnailImage = document.getElementById('thumbnailImage');
            
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
            
            // 修改诊断按钮的事件处理
            const diagnosisBtn = document.getElementById('getDiagnosisBtn');
            if (diagnosisBtn) {
                // 移除原有的事件监听器
                const newDiagnosisBtn = diagnosisBtn.cloneNode(true);
                diagnosisBtn.parentNode.replaceChild(newDiagnosisBtn, diagnosisBtn);
                
                // 添加新的事件监听器
                newDiagnosisBtn.addEventListener('click', () => {
                    this.getLocalDiagnosis();
                });
            }
        }
    }

    /**
     * 获取快速诊断结果
     */
    async getLocalDiagnosis() {
        try {
            // 禁用诊断按钮
            const diagnosisBtn = document.getElementById('getDiagnosisBtn');
            if (diagnosisBtn) {
                diagnosisBtn.disabled = true;
                diagnosisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在分析...';
            }
            
            // 从通用病虫害和生理障碍中随机选择一个类别
            const categories = ['通用病害', '通用虫害', '生理障碍'];
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            
            // 从选定的类别中随机获取一个案例
            let randomCase;
            
            if (randomCategory === '通用病害') {
                const diseases = Object.keys(this.pestCaseDB.cases['通用病害']);
                const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
                randomCase = {
                    plant: '通用病害',
                    disease: this.pestCaseDB.cases['通用病害'][randomDisease]
                };
            } else if (randomCategory === '通用虫害') {
                const pests = Object.keys(this.pestCaseDB.cases['通用虫害']);
                const randomPest = pests[Math.floor(Math.random() * pests.length)];
                randomCase = {
                    plant: '通用虫害',
                    disease: this.pestCaseDB.cases['通用虫害'][randomPest]
                };
            } else {
                const disorders = Object.keys(this.pestCaseDB.cases['生理障碍']);
                const randomDisorder = disorders[Math.floor(Math.random() * disorders.length)];
                randomCase = {
                    plant: '生理障碍',
                    disease: this.pestCaseDB.cases['生理障碍'][randomDisorder]
                };
            }
            
            // 格式化案例为显示格式
            const formattedCase = this.pestCaseDB.formatCase(randomCase);
            
            // 显示结果
            this.displayResult(formattedCase);
            
            // 启动语音播报
            if (window.voiceBroadcastManager) {
                const diagnosisResult = this.buildDiagnosisResult(formattedCase.content);
                window.voiceBroadcastManager.startBroadcast(diagnosisResult);
            }
            
        } catch (error) {
            console.error('快速诊断失败:', error);
            this.updateVoiceStatus('快速诊断失败');
        } finally {
            // 恢复诊断按钮
            const diagnosisBtn = document.getElementById('getDiagnosisBtn');
            if (diagnosisBtn) {
                diagnosisBtn.disabled = false;
                diagnosisBtn.innerHTML = '<i class="fas fa-stethoscope"></i> 获取AI诊断建议';
            }
        }
    }

    /**
     * 显示结果
     */
    displayResult(result) {
        // 显示结果区域
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.style.display = 'block';
        }
        
        // 隐藏加载动画
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // 显示结果内容
        const resultContent = document.getElementById('resultContent');
        if (resultContent) {
            // 使用Markdown格式化结果
            resultContent.innerHTML = this.formatResult(result);
            
            // 滚动到结果区域
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * 格式化结果
     */
    formatResult(result) {
        // 使用简单的Markdown解析
        return result.content
            .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
            .replace(/\n/g, '<br>');
    }

    /**
     * 构建诊断结果对象
     */
    buildDiagnosisResult(content) {
        // 解析结果字符串为结构化数据
        const result = {
            symptoms: '',
            diagnosis: '',
            treatment: '',
            prevention: ''
        };

        // 尝试提取不同部分的内容
        const sections = content.split(/##\s*/);
        
        sections.forEach(section => {
            const trimmed = section.trim();
            if (!trimmed) return;
            
            if (trimmed.includes('症状分析')) {
                result.symptoms = this.extractSectionContent(trimmed);
            } else if (trimmed.includes('病因分析') || trimmed.includes('诊断结果')) {
                result.diagnosis = this.extractSectionContent(trimmed);
            } else if (trimmed.includes('防治建议')) {
                result.treatment = this.extractSectionContent(trimmed);
            } else if (trimmed.includes('预防措施')) {
                result.prevention = this.extractSectionContent(trimmed);
            }
        });

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
     * 更新状态
     */
    updateVoiceStatus(message) {
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.textContent = message;
        }
    }
}

// 创建全局实例
document.addEventListener('DOMContentLoaded', () => {
    window.localVoiceRecognition = new LocalVoiceRecognition();
});