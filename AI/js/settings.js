/**
 * 设置管理模块
 * 负责处理设置模态框的显示、隐藏和配置管理
 */
class SettingsManager {
    constructor() {
        this.modal = null;
        this.settingsBtn = null;
        this.settingsClose = null;
        this.saveSettingsBtn = null;
        this.resetSettingsBtn = null;
        this.init();
    }

    /**
     * 初始化设置管理器
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.modal = document.getElementById('settingsModal');
                this.settingsClose = document.getElementById('settingsClose');
                this.saveSettingsBtn = document.getElementById('saveSettings');
                this.resetSettingsBtn = document.getElementById('resetSettings');

                this.bindEvents();
                this.loadSettings();
            }, 100);
        });
    }

    /**
     * 绑定设置面板事件
     */
    bindEvents() {
        // 先移除所有可能存在的事件监听器
        this.removeAllEventListeners();
        
        // 绑定所有系统设置按钮
        const settingsBtns = document.querySelectorAll('[data-action="system-settings"], .settings-menu-item, #settingsBtn, #headerSettingsBtn, #sidebarSettingsBtn');
        console.log('找到系统设置按钮:', settingsBtns.length);
        settingsBtns.forEach(btn => {
            btn.addEventListener('click', this.handleSettingsBtnClick.bind(this));
        });

        // 关闭按钮点击事件
        if (this.settingsClose) {
            this.settingsClose.addEventListener('click', this.hideModal.bind(this));
        }

        // 保存设置按钮点击事件
        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.addEventListener('click', this.saveSettings.bind(this));
        }

        // 重置设置按钮点击事件
        if (this.resetSettingsBtn) {
            // 确保只绑定一次事件
            this.resetSettingsBtn.addEventListener('click', this.resetSettings.bind(this));
        }

        // 背景控制按钮事件
        this.bindBackgroundEvents();
        
        // 语音API设置事件
        this.bindSpeechApiEvents();

        // 点击模态框外部关闭
        if (this.modal) {
            this.modal.addEventListener('click', this.handleModalOutsideClick.bind(this));
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', this.handleEscKeyPress.bind(this));
    }
    
    /**
     * 绑定语音API设置事件
     */
    bindSpeechApiEvents() {
        const speechApiProvider = document.getElementById('speechApiProvider');
        const baiduSpeechSettings = document.getElementById('baiduSpeechSettings');
        const showBaiduApiKey = document.getElementById('showBaiduApiKey');
        const showBaiduSecretKey = document.getElementById('showBaiduSecretKey');
        const testBaiduApi = document.getElementById('testBaiduApi');
        
        // 语音API提供商切换事件
        if (speechApiProvider) {
            speechApiProvider.addEventListener('change', (e) => {
                const provider = e.target.value;
                
                // 显示/隐藏百度语音API设置
                if (baiduSpeechSettings) {
                    baiduSpeechSettings.style.display = provider === 'baidu' ? 'block' : 'none';
                }
                
                // 保存设置
                if (window.speechAPIService) {
                    window.speechAPIService.setProvider(provider);
                }
            });
        }
        
        // 显示/隐藏百度API Key
        if (showBaiduApiKey) {
            showBaiduApiKey.addEventListener('click', () => {
                const baiduApiKey = document.getElementById('baiduApiKey');
                if (baiduApiKey) {
                    if (baiduApiKey.type === 'password') {
                        baiduApiKey.type = 'text';
                        showBaiduApiKey.textContent = '隐藏';
                    } else {
                        baiduApiKey.type = 'password';
                        showBaiduApiKey.textContent = '显示';
                    }
                }
            });
        }
        
        // 显示/隐藏百度Secret Key
        if (showBaiduSecretKey) {
            showBaiduSecretKey.addEventListener('click', () => {
                const baiduSecretKey = document.getElementById('baiduSecretKey');
                if (baiduSecretKey) {
                    if (baiduSecretKey.type === 'password') {
                        baiduSecretKey.type = 'text';
                        showBaiduSecretKey.textContent = '隐藏';
                    } else {
                        baiduSecretKey.type = 'password';
                        showBaiduSecretKey.textContent = '显示';
                    }
                }
            });
        }
        
        // 测试百度语音API连接
        if (testBaiduApi) {
            testBaiduApi.addEventListener('click', async () => {
                const baiduAppId = document.getElementById('baiduAppId');
                const baiduApiKey = document.getElementById('baiduApiKey');
                const baiduSecretKey = document.getElementById('baiduSecretKey');
                const baiduApiStatus = document.getElementById('baiduApiStatus');
                
                if (!baiduAppId || !baiduApiKey || !baiduSecretKey || !baiduApiStatus) {
                    return;
                }
                
                const appId = baiduAppId.value;
                const apiKey = baiduApiKey.value;
                const secretKey = baiduSecretKey.value;
                
                if (!appId || !apiKey || !secretKey) {
                    baiduApiStatus.textContent = '请填写完整的百度语音API信息';
                    baiduApiStatus.className = 'status error';
                    return;
                }
                
                baiduApiStatus.textContent = '测试中...';
                baiduApiStatus.className = 'status testing';
                
                try {
                    if (window.speechAPIService) {
                        // 配置百度语音API
                        const success = window.speechAPIService.configureBaiduAPI(appId, apiKey, secretKey);
                        
                        if (success) {
                            // 尝试获取访问令牌
                            await window.speechAPIService.getBaiduAccessToken(apiKey, secretKey);
                            
                            baiduApiStatus.textContent = '连接成功';
                            baiduApiStatus.className = 'status success';
                            
                            // 切换到百度语音API
                            speechApiProvider.value = 'baidu';
                            window.speechAPIService.setProvider('baidu');
                        } else {
                            baiduApiStatus.textContent = '配置失败';
                            baiduApiStatus.className = 'status error';
                        }
                    } else {
                        baiduApiStatus.textContent = '语音API服务未初始化';
                        baiduApiStatus.className = 'status error';
                    }
                } catch (error) {
                    console.error('测试百度语音API失败:', error);
                    baiduApiStatus.textContent = `连接错误: ${error.message}`;
                    baiduApiStatus.className = 'status error';
                }
            });
        }
    }
    
    /**
     * 移除所有事件监听器
     */
    removeAllEventListeners() {
        // 移除设置按钮事件
        const settingsBtns = document.querySelectorAll('[data-action="system-settings"], .settings-menu-item, #settingsBtn, #headerSettingsBtn, #sidebarSettingsBtn');
        settingsBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(newBtn, btn);
            }
        });
        
        // 移除重置按钮事件
        if (this.resetSettingsBtn) {
            const newResetBtn = this.resetSettingsBtn.cloneNode(true);
            if (this.resetSettingsBtn.parentNode) {
                this.resetSettingsBtn.parentNode.replaceChild(newResetBtn, this.resetSettingsBtn);
                this.resetSettingsBtn = newResetBtn;
            }
        }
        
        // 移除其他按钮事件
        if (this.settingsClose) {
            const newCloseBtn = this.settingsClose.cloneNode(true);
            if (this.settingsClose.parentNode) {
                this.settingsClose.parentNode.replaceChild(newCloseBtn, this.settingsClose);
                this.settingsClose = newCloseBtn;
            }
        }
        
        if (this.saveSettingsBtn) {
            const newSaveBtn = this.saveSettingsBtn.cloneNode(true);
            if (this.saveSettingsBtn.parentNode) {
                this.saveSettingsBtn.parentNode.replaceChild(newSaveBtn, this.saveSettingsBtn);
                this.saveSettingsBtn = newSaveBtn;
            }
        }
    }
    
    /**
     * 处理设置按钮点击
     */
    handleSettingsBtnClick(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('系统设置按钮被点击');
        this.showModal();
    }
    
    /**
     * 处理模态框外部点击
     */
    handleModalOutsideClick(e) {
        if (e.target === this.modal) {
            this.hideModal();
        }
    }
    
    /**
     * 处理ESC键按下
     */
    handleEscKeyPress(e) {
        if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
            this.hideModal();
        }
    }

    /**
     * 绑定背景控制事件
     */
    bindBackgroundEvents() {
        const bgLightBtn = document.querySelector('#bgLight');
        const bgDarkBtn = document.querySelector('#bgDark');
        const bgCustomBtn = document.querySelector('#bgCustom');

        if (bgLightBtn) {
            bgLightBtn.addEventListener('click', () => {
                if (window.backgroundManager) {
                    window.backgroundManager.setBackground('light');
                }
                this.updateBackgroundUI();
            });
        }

        if (bgDarkBtn) {
            bgDarkBtn.addEventListener('click', () => {
                if (window.backgroundManager) {
                    window.backgroundManager.setBackground('dark');
                }
                this.updateBackgroundUI();
            });
        }

        if (bgCustomBtn) {
            bgCustomBtn.addEventListener('click', () => {
                if (window.backgroundManager) {
                    window.backgroundManager.setBackground('custom');
                }
                this.updateBackgroundUI();
            });
        }
    }

    /**
     * 显示设置模态框
     */
    showModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // 防止背景滚动
            
            // 加载当前配置到表单
            this.loadCurrentConfig();
        }
    }

    /**
     * 隐藏设置模态框
     */
    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = ''; // 恢复背景滚动
        }
    }

    /**
     * 加载当前配置到表单
     */
    loadCurrentConfig() {
        if (window.configManager) {
            const config = window.configManager.getConfig();
            
            const apiKeyInput = document.getElementById('apiKey');
            const apiEndpointInput = document.getElementById('apiEndpoint');
            const modelInput = document.getElementById('model');

            if (apiKeyInput) apiKeyInput.value = config.apiKey || '';
            if (apiEndpointInput) apiEndpointInput.value = config.apiEndpoint || '';
            if (modelInput) modelInput.value = config.model || '';
        }

        // 加载语音API设置
        this.loadSpeechApiSettings();

        // 更新背景UI状态
        this.updateBackgroundUI();
    }
    
    /**
     * 加载语音API设置
     */
    loadSpeechApiSettings() {
        const speechApiProvider = document.getElementById('speechApiProvider');
        const baiduSpeechSettings = document.getElementById('baiduSpeechSettings');
        const baiduAppId = document.getElementById('baiduAppId');
        const baiduApiKey = document.getElementById('baiduApiKey');
        const baiduSecretKey = document.getElementById('baiduSecretKey');
        
        if (window.speechAPIService) {
            // 设置当前提供商
            if (speechApiProvider) {
                const currentProvider = window.speechAPIService.getCurrentProvider().name;
                speechApiProvider.value = currentProvider;
                
                // 显示/隐藏百度设置
                if (baiduSpeechSettings) {
                    baiduSpeechSettings.style.display = currentProvider === 'baidu' ? 'block' : 'none';
                }
            }
            
            // 加载百度API设置
            if (window.speechAPIService.providers && window.speechAPIService.providers.baidu) {
                const baiduConfig = window.speechAPIService.providers.baidu.config;
                
                if (baiduAppId) baiduAppId.value = baiduConfig.appId || '';
                if (baiduApiKey) baiduApiKey.value = baiduConfig.apiKey || '';
                if (baiduSecretKey) baiduSecretKey.value = baiduConfig.secretKey || '';
            }
        }
    }

    /**
     * 更新背景UI状态
     */
    updateBackgroundUI() {
        const bgLightBtn = document.querySelector('#bgLight');
        const bgDarkBtn = document.querySelector('#bgDark');
        const bgCustomBtn = document.querySelector('#bgCustom');
        
        if (window.backgroundManager) {
            const currentBackground = window.backgroundManager.getCurrentBackground();

            // 移除所有活动状态
            if (bgLightBtn) bgLightBtn.classList.remove('active');
            if (bgDarkBtn) bgDarkBtn.classList.remove('active');
            if (bgCustomBtn) bgCustomBtn.classList.remove('active');

            // 添加当前活动状态
            if ((currentBackground === 'light' || currentBackground === 'default') && bgLightBtn) {
                bgLightBtn.classList.add('active');
            } else if (currentBackground === 'dark' && bgDarkBtn) {
                bgDarkBtn.classList.add('active');
            } else if (currentBackground === 'custom' && bgCustomBtn) {
                bgCustomBtn.classList.add('active');
            }
            
            // 更新预览显示
            const previewLight = document.getElementById('previewLight');
            const previewDark = document.getElementById('previewDark');
            const previewCustom = document.getElementById('previewCustom');
            
            if (previewLight) previewLight.style.display = 'none';
            if (previewDark) previewDark.style.display = 'none';
            if (previewCustom) previewCustom.style.display = 'none';
            
            if ((currentBackground === 'light' || currentBackground === 'default') && previewLight) {
                previewLight.style.display = 'block';
            } else if (currentBackground === 'dark' && previewDark) {
                previewDark.style.display = 'block';
            } else if (currentBackground === 'custom' && previewCustom) {
                previewCustom.style.display = 'block';
            }
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        try {
            // 获取AI API表单数据
            const apiKey = document.getElementById('apiKey').value;
            const apiEndpoint = document.getElementById('apiEndpoint').value;
            const model = document.getElementById('model').value;

            // 验证AI API输入
            const errors = [];
            if (!apiKey.trim()) {
                errors.push('请输入API密钥');
            }
            if (!apiEndpoint.trim()) {
                errors.push('请输入API端点');
            }
            if (!model.trim()) {
                errors.push('请输入模型名称');
            }

            if (errors.length > 0) {
                this.showMessage(errors.join('<br>'), 'error');
                return;
            }

            // 保存AI API配置
            if (window.configManager) {
                window.configManager.saveConfig();
            }
            
            // 保存语音API配置
            this.saveSpeechApiSettings();
            
            // 显示成功消息
            this.showMessage('设置保存成功！', 'success');
            
            // 延迟关闭模态框
            setTimeout(() => {
                this.hideModal();
            }, 1500);

        } catch (error) {
            console.error('保存设置失败:', error);
            this.showMessage('保存设置失败，请重试', 'error');
        }
    }
    
    /**
     * 保存语音API设置
     */
    saveSpeechApiSettings() {
        if (!window.speechAPIService) {
            return;
        }
        
        const speechApiProvider = document.getElementById('speechApiProvider');
        const baiduAppId = document.getElementById('baiduAppId');
        const baiduApiKey = document.getElementById('baiduApiKey');
        const baiduSecretKey = document.getElementById('baiduSecretKey');
        
        if (speechApiProvider) {
            const provider = speechApiProvider.value;
            window.speechAPIService.setProvider(provider);
            
            // 如果选择了百度语音API，保存百度API配置
            if (provider === 'baidu' && baiduAppId && baiduApiKey && baiduSecretKey) {
                const appId = baiduAppId.value;
                const apiKey = baiduApiKey.value;
                const secretKey = baiduSecretKey.value;
                
                if (appId && apiKey && secretKey) {
                    window.speechAPIService.configureBaiduAPI(appId, apiKey, secretKey);
                }
            }
        }
    }

    /**
     * 重置设置
     */
    resetSettings(e) {
        // 阻止事件冒泡和默认行为
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // 防止重复执行
        if (this._isResetting) {
            return;
        }
        
        // 确认对话框
        if (confirm('确定要重置所有设置吗？这将清除所有已保存的配置。')) {
            this._isResetting = true;
            
            try {
                // 明确定义默认配置
                const defaultConfig = {
                    apiKey: '',
                    apiEndpoint: '',
                    model: ''
                };
                
                console.log('正在重置为默认配置:', defaultConfig);
                
                // 直接更新DOM元素
                const apiKeyInput = document.getElementById('apiKey');
                const apiEndpointInput = document.getElementById('apiEndpoint');
                const modelInput = document.getElementById('model');
                
                if (apiKeyInput) apiKeyInput.value = defaultConfig.apiKey;
                if (apiEndpointInput) apiEndpointInput.value = defaultConfig.apiEndpoint;
                if (modelInput) modelInput.value = defaultConfig.model;
                
                // 直接保存到localStorage，不依赖configManager
                localStorage.setItem('ai_pest_detection_config', JSON.stringify(defaultConfig));
                
                // 如果configManager存在，强制更新它的状态
                if (window.configManager) {
                    window.configManager.defaultConfig = defaultConfig;
                    // 强制重新加载配置
                    window.configManager.loadConfig = function() {
                        return defaultConfig;
                    };
                }
                
                // 重置语音API设置
                this.resetSpeechApiSettings();
                
                // 重置背景设置
                if (window.backgroundManager) {
                    window.backgroundManager.resetToDefault();
                }
                
                // 显示成功消息
                this.showMessage('设置已重置为默认值', 'success');
                
                // 记录到控制台，便于调试
                console.log('设置已成功重置为:', defaultConfig);
                
            } catch (error) {
                console.error('重置设置失败:', error);
                this.showMessage('重置设置失败，请重试', 'error');
            } finally {
                // 重置标志，允许下次重置
                setTimeout(() => {
                    this._isResetting = false;
                }, 1000);
            }
        }
    }
    
    /**
     * 重置语音API设置
     */
    resetSpeechApiSettings() {
        // 重置DOM元素
        const speechApiProvider = document.getElementById('speechApiProvider');
        const baiduSpeechSettings = document.getElementById('baiduSpeechSettings');
        const baiduAppId = document.getElementById('baiduAppId');
        const baiduApiKey = document.getElementById('baiduApiKey');
        const baiduSecretKey = document.getElementById('baiduSecretKey');
        
        if (speechApiProvider) speechApiProvider.value = 'webSpeech';
        if (baiduSpeechSettings) baiduSpeechSettings.style.display = 'none';
        if (baiduAppId) baiduAppId.value = '';
        if (baiduApiKey) baiduApiKey.value = '';
        if (baiduSecretKey) baiduSecretKey.value = '';
        
        // 重置语音API服务
        if (window.speechAPIService) {
            // 重置提供商为Web Speech API
            window.speechAPIService.setProvider('webSpeech');
            
            // 清除百度API配置
            if (window.speechAPIService.providers && window.speechAPIService.providers.baidu) {
                window.speechAPIService.configureBaiduAPI('', '', '');
            }
            
            // 清除localStorage中的语音API配置
            localStorage.removeItem('speechAPIConfig');
        }
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 移除之前的消息
        const existingMessage = document.querySelector('.settings-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建新消息
        const messageDiv = document.createElement('div');
        messageDiv.className = `settings-message ${type}-message`;
        messageDiv.innerHTML = message;

        // 插入到设置内容中
        const settingsContent = document.querySelector('.settings-content');
        if (settingsContent) {
            settingsContent.appendChild(messageDiv);
        }

        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    /**
     * 加载设置
     */
    loadSettings() {
        // 这里可以加载其他设置项
        // 目前主要依赖configManager来处理API配置
    }

    /**
     * 获取设置状态
     */
    getSettingsStatus() {
        if (window.configManager) {
            const config = window.configManager.getConfig();
            return {
                hasApiKey: !!config.apiKey,
                hasValidConfig: window.configManager.validateConfig().isValid,
                config: config
            };
        }
        return {
            hasApiKey: false,
            hasValidConfig: false,
            config: {}
        };
    }

    /**
     * 销毁设置管理器
     */
    destroy() {
        // 清理事件监听器
        if (this.settingsBtn) {
            this.settingsBtn.removeEventListener('click', this.showModal);
        }
        if (this.settingsClose) {
            this.settingsClose.removeEventListener('click', this.hideModal);
        }
        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.removeEventListener('click', this.saveSettings);
        }
        if (this.resetSettingsBtn) {
            this.resetSettingsBtn.removeEventListener('click', this.resetSettings);
        }
    }
}

// 创建全局设置管理器实例
const settingsManager = new SettingsManager();