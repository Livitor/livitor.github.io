/**
 * 训练模型管理器
 * 负责管理已训练的AI模型，提供模型调用接口
 */
class TrainedModelManager {
    constructor() {
        this.models = [];
        this.activeModel = null;
        this.init();
    }

    /**
     * 初始化管理器
     */
    init() {
        this.loadModels();
    }

    /**
     * 加载已训练的模型
     */
    loadModels() {
        try {
            const saved = localStorage.getItem('trained_models');
            if (saved) {
                this.models = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载训练模型失败:', error);
            this.models = [];
        }
    }

    /**
     * 获取所有已部署的模型
     */
    getDeployedModels() {
        return this.models.filter(model => model.deployed);
    }

    /**
     * 获取指定模型
     */
    getModel(modelId) {
        return this.models.find(model => model.id === modelId);
    }

    /**
     * 设置活动模型
     */
    setActiveModel(modelId) {
        const model = this.getModel(modelId);
        if (model && model.deployed) {
            this.activeModel = model;
            return true;
        }
        return false;
    }

    /**
     * 获取活动模型
     */
    getActiveModel() {
        return this.activeModel;
    }

    /**
     * 使用训练模型进行对话
     */
    async chatWithModel(modelId, message, imageData = null) {
        const model = this.getModel(modelId);
        if (!model || !model.deployed) {
            throw new Error('模型不存在或未部署');
        }

        // 获取API配置
        const apiConfig = configManager.getConfig();
        if (!apiConfig.apiKey) {
            throw new Error('请先在设置中配置API密钥');
        }

        // 构建消息
        const messages = [
            {
                role: 'system',
                content: this.buildSystemMessage(model)
            },
            {
                role: 'user',
                content: message
            }
        ];

        // 如果有图片，添加图片内容
        if (imageData && apiConfig.model.includes('vision')) {
            messages[1].content = [
                {
                    type: 'text',
                    text: message
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: imageData
                    }
                }
            ];
        }

        // 调用API
        const response = await fetch(apiConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: apiConfig.model,
                messages: messages,
                max_tokens: 1500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.choices || !result.choices[0]) {
            throw new Error('AI响应格式错误');
        }

        return {
            content: result.choices[0].message.content,
            model: model.name,
            usage: result.usage
        };
    }

    /**
     * 构建系统消息
     */
    buildSystemMessage(model) {
        let systemMessage = model.systemPrompt;
        
        if (model.knowledge) {
            systemMessage += '\n\n专业知识库：\n' + model.knowledge;
        }

        // 添加模型特定的指导
        systemMessage += '\n\n重要提醒：';
        systemMessage += '\n- 你是根据用户上传的专业资料训练的专属AI助手';
        systemMessage += '\n- 请基于训练时学习的知识内容回答问题';
        systemMessage += '\n- 如果问题超出你的专业领域，请诚实说明';
        systemMessage += '\n- 提供准确、专业、有用的建议';

        return systemMessage;
    }

    /**
     * 获取模型统计信息
     */
    getModelStats() {
        const total = this.models.length;
        const deployed = this.models.filter(m => m.deployed).length;
        const byType = {};

        this.models.forEach(model => {
            byType[model.type] = (byType[model.type] || 0) + 1;
        });

        return {
            total,
            deployed,
            byType
        };
    }

    /**
     * 删除模型
     */
    deleteModel(modelId) {
        const index = this.models.findIndex(m => m.id === modelId);
        if (index !== -1) {
            this.models.splice(index, 1);
            this.saveModels();
            
            // 如果删除的是活动模型，清除活动模型
            if (this.activeModel && this.activeModel.id === modelId) {
                this.activeModel = null;
            }
            
            return true;
        }
        return false;
    }

    /**
     * 保存模型到本地存储
     */
    saveModels() {
        try {
            localStorage.setItem('trained_models', JSON.stringify(this.models));
        } catch (error) {
            console.error('保存训练模型失败:', error);
        }
    }

    /**
     * 导出模型配置
     */
    exportModel(modelId) {
        const model = this.getModel(modelId);
        if (!model) {
            throw new Error('模型不存在');
        }

        const exportData = {
            ...model,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${model.name}_model.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    /**
     * 导入模型配置
     */
    async importModel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const modelData = JSON.parse(e.target.result);
                    
                    // 验证模型数据
                    if (!this.validateModelData(modelData)) {
                        reject(new Error('模型文件格式不正确'));
                        return;
                    }

                    // 生成新的ID避免冲突
                    modelData.id = `imported_${Date.now()}`;
                    modelData.importedAt = new Date().toISOString();
                    
                    // 添加到模型列表
                    this.models.push(modelData);
                    this.saveModels();
                    
                    resolve(modelData);
                } catch (error) {
                    reject(new Error('模型文件解析失败: ' + error.message));
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * 验证模型数据
     */
    validateModelData(data) {
        const required = ['name', 'type', 'systemPrompt', 'knowledge', 'capabilities'];
        return required.every(field => data.hasOwnProperty(field));
    }

    /**
     * 获取模型类型名称
     */
    getModelTypeName(type) {
        const names = {
            'disease-detection': '病害识别模型',
            'insect-detection': '虫害识别模型',
            'growth-stage': '生长阶段模型',
            'maturity-detection': '成熟度检测模型'
        };
        return names[type] || '自定义模型';
    }
}

// 创建全局实例
const trainedModelManager = new TrainedModelManager();

// 导出供其他模块使用
window.trainedModelManager = trainedModelManager;