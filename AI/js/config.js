/**
 * 配置管理模块
 * 负责处理API配置的保存、加载和验证
 */
class ConfigManager {
    constructor() {
        this.configKey = 'ai_pest_detection_config';
        this.defaultConfig = {
            apiKey: '',
            apiEndpoint: '',
            model: ''
        };
        this.init();
    }

    /**
     * 初始化配置
     */
    init() {
        this.loadConfig();
        this.bindEvents();
    }

    /**
     * 绑定配置相关事件
     */
    bindEvents() {
        // 配置事件现在由设置管理器处理
        // 这里保留空实现以保持接口兼容性
    }

    /**
     * 保存配置到本地存储
     */
    saveConfig() {
        const apiKeyElement = document.getElementById('apiKey');
        const apiEndpointElement = document.getElementById('apiEndpoint');
        const modelElement = document.getElementById('model');
        
        if (apiKeyElement && apiEndpointElement && modelElement) {
            const config = {
                apiKey: apiKeyElement.value,
                apiEndpoint: apiEndpointElement.value,
                model: modelElement.value
            };

            try {
                localStorage.setItem(this.configKey, JSON.stringify(config));
                console.log('配置已保存');
            } catch (error) {
                console.error('保存配置失败:', error);
                this.showMessage('配置保存失败', 'error');
            }
        } else {
            console.warn('配置元素不存在，无法保存配置');
        }
    }

    /**
     * 从本地存储加载配置
     */
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem(this.configKey);
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.applyConfig(config);
            } else {
                this.applyConfig(this.defaultConfig);
            }
        } catch (error) {
            console.error('加载配置失败:', error);
            this.applyConfig(this.defaultConfig);
        }
    }

    /**
     * 应用配置到界面
     */
    applyConfig(config) {
        const apiKeyElement = document.getElementById('apiKey');
        const apiEndpointElement = document.getElementById('apiEndpoint');
        const modelElement = document.getElementById('model');
        
        if (apiKeyElement) {
            apiKeyElement.value = config.apiKey || '';
        }
        
        if (apiEndpointElement) {
            apiEndpointElement.value = config.apiEndpoint || '';
        }
        
        if (modelElement) {
            modelElement.value = config.model || '';
        }
    }

    /**
     * 获取当前配置
     */
    getConfig() {
        // 尝试从DOM元素获取配置
        const apiKeyElement = document.getElementById('apiKey');
        const apiEndpointElement = document.getElementById('apiEndpoint');
        const modelElement = document.getElementById('model');
        
        if (apiKeyElement && apiEndpointElement && modelElement) {
            return {
                apiKey: apiKeyElement.value,
                apiEndpoint: apiEndpointElement.value,
                model: modelElement.value
            };
        } else {
            // 如果DOM元素不存在（如在病虫检测页面），从localStorage获取
            try {
                const savedConfig = localStorage.getItem(this.configKey);
                if (savedConfig) {
                    return JSON.parse(savedConfig);
                }
            } catch (error) {
                console.error('从localStorage获取配置失败:', error);
            }
            
            // 返回默认配置
            return this.defaultConfig;
        }
    }

    /**
     * 验证配置是否有效
     */
    validateConfig() {
        const config = this.getConfig();
        const errors = [];

        if (!config.apiKey || !config.apiKey.trim()) {
            errors.push('请在主页面设置中输入API密钥');
        }

        if (!config.apiEndpoint || !config.apiEndpoint.trim()) {
            errors.push('请在主页面设置中输入API端点');
        } else if (!this.isValidUrl(config.apiEndpoint)) {
            errors.push('API端点格式不正确，请在主页面设置中修改');
        }

        if (!config.model || !config.model.trim()) {
            errors.push('请在主页面设置中选择模型');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 验证URL格式
     */
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * 重置配置为默认值
     */
    resetConfig() {
        // 直接设置DOM元素值
        const apiKeyElement = document.getElementById('apiKey');
        const apiEndpointElement = document.getElementById('apiEndpoint');
        const modelElement = document.getElementById('model');
        
        if (apiKeyElement) apiKeyElement.value = '';
        if (apiEndpointElement) apiEndpointElement.value = '';
        if (modelElement) modelElement.value = '';
        
        // 保存空配置到localStorage
        const emptyConfig = {
            apiKey: '',
            apiEndpoint: '',
            model: ''
        };
        localStorage.setItem(this.configKey, JSON.stringify(emptyConfig));
        
        console.log('配置已重置为默认值');
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        // 插入到配置区域
        const configSection = document.querySelector('.config-section');
        configSection.appendChild(messageDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    /**
     * 导出配置
     */
    exportConfig() {
        const config = this.getConfig();
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'ai_pest_detection_config.json';
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    /**
     * 导入配置
     */
    importConfig(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                this.applyConfig(config);
                this.saveConfig();
                this.showMessage('配置导入成功', 'success');
            } catch (error) {
                console.error('导入配置失败:', error);
                this.showMessage('配置文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// 创建全局配置管理器实例
const configManager = new ConfigManager(); 