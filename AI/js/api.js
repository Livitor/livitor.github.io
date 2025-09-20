/**
 * API调用模块
 * 负责与AI服务进行通信，处理图片和文本分析
 */
class APIService {
    constructor() {
        this.isProcessing = false;
        this.speechToTextEndpoint = null; // 语音转文本API端点
    }

    /**
     * 语音转文本
     * 将音频数据转换为文本
     */
    async speechToText(audioData) {
        if (!audioData) {
            throw new Error('未提供音频数据');
        }
        
        // 如果有语音API服务可用，优先使用
        if (window.speechAPIService) {
            try {
                return await window.speechAPIService.speechToText(audioData);
            } catch (error) {
                console.warn('使用语音API服务失败，尝试使用备选方案:', error);
            }
        }
        
        // 备选方案：使用配置的语音转文本API
        if (!this.speechToTextEndpoint) {
            throw new Error('未配置语音转文本API端点');
        }
        
        try {
            const formData = new FormData();
            
            // 如果audioData是Blob对象，直接添加
            if (audioData instanceof Blob) {
                formData.append('audio', audioData, 'audio.webm');
            } 
            // 如果是Base64字符串，转换为Blob
            else if (typeof audioData === 'string' && audioData.startsWith('data:')) {
                const blob = this.dataURItoBlob(audioData);
                formData.append('audio', blob, 'audio.webm');
            } else {
                throw new Error('不支持的音频数据格式');
            }
            
            const response = await fetch(this.speechToTextEndpoint, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`语音识别请求失败: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(`语音识别错误: ${result.error}`);
            }
            
            return result.text || '';
        } catch (error) {
            console.error('语音转文本失败:', error);
            throw error;
        }
    }
    
    /**
     * 将Data URI转换为Blob对象
     */
    dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([ab], { type: mimeString });
    }
    
    /**
     * 分析图片和文本
     */
    async analyzeContent(imageData = null, textContent = '') {
        if (this.isProcessing) {
            throw new Error('正在处理中，请稍候...');
        }

        // 验证配置
        const configValidation = configManager.validateConfig();
        if (!configValidation.isValid) {
            throw new Error(`配置错误: ${configValidation.errors.join(', ')}`);
        }

        // 检查是否有内容需要分析
        if (!imageData && !textContent.trim()) {
            throw new Error('请上传图片或输入文字内容');
        }

        this.isProcessing = true;
        this.showLoading(true);

        try {
            const config = configManager.getConfig();
            const requestData = this.buildRequestData(config, imageData, textContent);
            const response = await this.makeAPIRequest(config.apiEndpoint, config.apiKey, requestData);
            
            return this.processResponse(response);
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
        }
    }

    /**
     * 构建请求数据
     */
    buildRequestData(config, imageData, textContent) {
        const messages = [];
        
        // 构建系统提示词
        const systemPrompt = this.buildSystemPrompt(imageData, textContent);
        messages.push({
            role: 'system',
            content: systemPrompt
        });

        // 构建用户消息
        const userMessage = this.buildUserMessage(imageData, textContent);
        messages.push(userMessage);

        return {
            model: config.model,
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };
    }

    /**
     * 构建系统提示词
     */
    buildSystemPrompt(imageData, textContent) {
        let prompt = '你是一个专业的植物病虫害诊断专家。请根据提供的图片和描述，进行详细的病虫害分析。';

        if (imageData && textContent.trim()) {
            prompt += '用户同时提供了图片和文字描述，请结合两者进行分析。';
        } else if (imageData) {
            prompt += '用户只提供了图片，请根据图片内容进行病虫害识别和分析。';
        } else {
            prompt += '用户只提供了文字描述，请根据描述进行病虫害分析和建议。';
        }

        prompt += `
请按以下格式提供分析结果：

## 诊断结果
[根据图片/描述分析出的病虫害类型或植物状况]

## 症状分析
[详细描述观察到的症状和特征]

## 病因分析
[分析可能的病因和影响因素]

## 防治建议
[提供具体的防治措施和建议]

## 预防措施
[提供预防类似问题的建议]

## 注意事项
[使用农药或其他防治方法时的安全注意事项]

请确保分析准确、建议实用，并注意安全性。`;
        
        return prompt;
    }

    /**
     * 构建用户消息
     */
    buildUserMessage(imageData, textContent) {
        const message = {
            role: 'user',
            content: []
        };

        // 添加文本内容
        if (textContent.trim()) {
            message.content.push({
                type: 'text',
                text: textContent.trim()
            });
        }

        // 添加图片内容
        if (imageData) {
            message.content.push({
                type: 'image_url',
                image_url: {
                    url: imageData
                }
            });
        }

        return message;
    }

    /**
     * 发送API请求
     */
    async makeAPIRequest(endpoint, apiKey, requestData) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(this.handleAPIError(response.status, errorData));
        }

        return await response.json();
    }

    /**
     * 处理API错误
     */
    handleAPIError(status, errorData) {
        switch (status) {
            case 401:
                return 'API密钥无效或已过期，请检查您的API密钥';
            case 403:
                return 'API访问被拒绝，请检查您的API权限';
            case 404:
                return 'API端点不存在，请检查API端点地址';
            case 429:
                return '请求过于频繁，请稍后再试';
            case 500:
                return '服务器内部错误，请稍后再试';
            default:
                return errorData.error?.message || `请求失败 (${status})`;
        }
    }

    /**
     * 处理API响应
     */
    processResponse(response) {
        if (!response.choices || response.choices.length === 0) {
            throw new Error('API返回的数据格式不正确');
        }

        const choice = response.choices[0];
        if (!choice.message || !choice.message.content) {
            throw new Error('API返回的内容为空');
        }

        return {
            content: choice.message.content,
            usage: response.usage,
            model: response.model,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 显示加载状态
     */
    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        const resultSection = document.getElementById('resultSection');
        
        if (loadingElement && resultSection) {
            if (show) {
                resultSection.style.display = 'block';
                loadingElement.style.display = 'block';
                document.getElementById('resultContent').innerHTML = '';
            } else {
                loadingElement.style.display = 'none';
            }
        }
    }

    /**
     * 显示分析结果
     */
    displayResult(result) {
        const resultSection = document.getElementById('resultSection');
        const resultContent = document.getElementById('resultContent');
        
        if (resultSection && resultContent) {
            resultSection.style.display = 'block';
            
            // 格式化显示结果
            const formattedContent = this.formatResult(result);
            resultContent.innerHTML = formattedContent;
            
            // 滚动到结果区域
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * 格式化结果显示
     */
    formatResult(result) {
        let html = `
            <div class="result-header">
                <h3>🔍 分析完成</h3>
                <div class="result-meta">
                    <span><i class="fas fa-robot"></i> 模型: ${result.model}</span>
                    <span><i class="fas fa-clock"></i> 时间: ${new Date(result.timestamp).toLocaleString()}</span>
                </div>
            </div>
            <div class="result-body">
                ${this.formatContent(result.content)}
            </div>
        `;

        if (result.usage) {
            html += `
                <div class="result-usage">
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 13px; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);">
                        💡 使用情况: 输入 ${result.usage.prompt_tokens} tokens, 
                        输出 ${result.usage.completion_tokens} tokens, 
                        总计 ${result.usage.total_tokens} tokens
                    </span>
                </div>
            `;
        }

        return html;
    }

    /**
     * 格式化内容显示
     */
    formatContent(content) {
        // 将markdown格式转换为HTML
        return content
            .replace(/^## (.*$)/gim, '<h3>$1</h3>')
            .replace(/^### (.*$)/gim, '<h4>$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const resultSection = document.getElementById('resultSection');
        const resultContent = document.getElementById('resultContent');
        
        if (resultSection && resultContent) {
            resultSection.style.display = 'block';
            resultContent.innerHTML = `
                <div class="error-result">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>分析失败</h3>
                    <p>${message}</p>
                </div>
            `;
            
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * 获取处理状态
     */
    getProcessingStatus() {
        return this.isProcessing;
    }

    /**
     * 取消当前处理
     */
    cancelProcessing() {
        this.isProcessing = false;
        this.showLoading(false);
    }
}

// 创建全局API服务实例
const apiService = new APIService();