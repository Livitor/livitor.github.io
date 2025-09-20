/**
 * 主页面功能模块
 * 处理主页面的交互逻辑、天气显示、日期时间等
 */
class HomePage {
    constructor() {
        this.weatherData = null;
        this.currentLanguage = 'zh-CN';
        this.currentCountry = 'CN';
        this.init();
    }

    /**
     * 初始化主页面
     */
    init() {
        this.initWeather();
        this.initEnvironmentData();
        this.bindEvents();
        this.loadUserPreferences();
        this.startDataUpdates();
    }

    /**
     * 开始数据更新循环
     */
    startDataUpdates() {
        // 每30秒更新一次环境数据
        setInterval(() => {
            this.updateEnvironmentData();
        }, 30000);
        
        // 每5分钟更新一次天气数据
        setInterval(() => {
            this.updateWeatherData();
        }, 300000);
    }

    /**
     * 初始化天气信息
     */
    initWeather() {
        // 模拟天气数据（实际项目中应该调用天气API）
        this.weatherData = {
            temperature: 25,
            condition: 'sunny',
            description: '晴朗',
            icon: '☀️',
            location: '广州市',
            feelsLike: 27,
            humidity: 65,
            windSpeed: 3
        };

        this.updateWeatherDisplay();
    }

    /**
     * 初始化环境数据
     */
    initEnvironmentData() {
        this.environmentData = {
            humidity: 65,
            feelsLike: 27,
            windSpeed: 3,
            soilMoisture: 45,
            lightIntensity: 85
        };

        this.updateEnvironmentDisplay();
        this.updateFarmingStatus();
    }

    /**
     * 更新天气显示
     */
    updateWeatherDisplay() {
        const weatherIcon = document.querySelector('.weather-icon');
        const temperature = document.querySelector('.temperature');
        const weatherDesc = document.querySelector('.weather-desc');
        const weatherLocation = document.querySelector('.weather-location');

        if (weatherIcon && temperature && weatherDesc && weatherLocation) {
            weatherIcon.textContent = this.weatherData.icon;
            temperature.textContent = `${this.weatherData.temperature}°C`;
            weatherDesc.textContent = this.weatherData.description;
            weatherLocation.textContent = `📍 ${this.weatherData.location}`;
        }
    }

    /**
     * 更新环境数据显示
     */
    updateEnvironmentDisplay() {
        const envItems = document.querySelectorAll('.env-item');
        const envData = [
            { icon: '💧', label: '湿度', value: `${this.environmentData.humidity}%` },
            { icon: '🌡️', label: '体感温度', value: `${this.environmentData.feelsLike}°C` },
            { icon: '💨', label: '风速', value: `${this.environmentData.windSpeed}级` }
        ];

        envItems.forEach((item, index) => {
            if (envData[index]) {
                const icon = item.querySelector('.env-icon');
                const label = item.querySelector('.env-label');
                const value = item.querySelector('.env-value');
                
                if (icon) icon.textContent = envData[index].icon;
                if (label) label.textContent = envData[index].label;
                if (value) value.textContent = envData[index].value;
            }
        });
    }

    /**
     * 更新农事状态
     */
    updateFarmingStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        const adviceItems = document.querySelectorAll('.advice-item');

        // 判断是否适宜耕种
        const isSuitable = this.isFarmingSuitable();
        
        if (statusIndicator && statusText) {
            if (isSuitable) {
                statusIndicator.className = 'status-indicator suitable';
                statusText.textContent = '适宜耕种';
            } else {
                statusIndicator.className = 'status-indicator unsuitable';
                statusText.textContent = '不宜耕种';
            }
        }

        // 更新农事建议
        const advice = this.getFarmingAdvice();
        adviceItems.forEach((item, index) => {
            if (advice[index]) {
                item.textContent = advice[index];
            }
        });
    }

    /**
     * 判断是否适宜农事活动
     */
    isFarmingSuitable() {
        const { temperature, condition } = this.weatherData;
        const { humidity, windSpeed } = this.environmentData;
        
        // 综合判断条件
        return temperature >= 15 && temperature <= 30 && 
               humidity >= 40 && humidity <= 80 &&
               windSpeed <= 5 &&
               !['rainy', 'stormy'].includes(condition);
    }

    /**
     * 根据天气获取农业建议
     */
    getFarmingAdvice() {
        const { temperature, condition } = this.weatherData;
        const { humidity, windSpeed } = this.environmentData;
        const advice = [];
        
        if (temperature < 5) {
            advice.push('• 温度较低，注意作物防冻保护');
            advice.push('• 可覆盖薄膜或搭建简易温棚');
            advice.push('• 暂停浇水，避免根部结冰');
        } else if (temperature > 35) {
            advice.push('• 高温天气，增加灌溉频次');
            advice.push('• 建议早晚进行田间作业');
            advice.push('• 注意遮阳防晒，保护作物');
        } else if (condition === 'rainy') {
            advice.push('• 雨天暂停田间作业，注意排水');
            advice.push('• 检查排水沟渠是否畅通');
            advice.push('• 预防病虫害滋生');
        } else if (this.isFarmingSuitable()) {
            advice.push('• 适宜进行播种和移栽作业');
            advice.push('• 建议上午10点前完成田间管理');
            advice.push('• 注意适量灌溉，保持土壤湿润');
        } else {
            advice.push('• 关注天气变化，合理安排农事活动');
            advice.push('• 可进行设备维护和准备工作');
            advice.push('• 注意观察作物生长状况');
        }
        
        return advice;
    }

    /**
     * 更新天气数据
     */
    updateWeatherData() {
        // 模拟天气数据变化
        const conditions = [
            { condition: 'sunny', description: '晴朗', icon: '☀️' },
            { condition: 'cloudy', description: '多云', icon: '☁️' },
            { condition: 'partly-cloudy', description: '晴转多云', icon: '⛅' },
            { condition: 'rainy', description: '小雨', icon: '🌧️' }
        ];
        
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        const tempVariation = Math.floor(Math.random() * 10) - 5; // -5 到 +5 的变化
        
        this.weatherData = {
            ...this.weatherData,
            temperature: Math.max(5, Math.min(40, this.weatherData.temperature + tempVariation)),
            ...randomCondition
        };
        
        this.updateWeatherDisplay();
        this.updateFarmingStatus();
    }

    /**
     * 更新环境数据
     */
    updateEnvironmentData() {
        // 模拟环境数据变化
        this.environmentData = {
            humidity: Math.max(30, Math.min(90, this.environmentData.humidity + Math.floor(Math.random() * 10) - 5)),
            feelsLike: this.weatherData.temperature + Math.floor(Math.random() * 6) - 3,
            windSpeed: Math.max(0, Math.min(8, this.environmentData.windSpeed + Math.floor(Math.random() * 2) - 1)),
            soilMoisture: Math.max(20, Math.min(80, this.environmentData.soilMoisture + Math.floor(Math.random() * 10) - 5)),
            lightIntensity: Math.max(40, Math.min(100, this.environmentData.lightIntensity + Math.floor(Math.random() * 10) - 5))
        };
        
        this.updateEnvironmentDisplay();
        this.updateFarmingStatus();
    }

    /**
     * 初始化设置控件
     */
    initSettings() {
        const countrySelect = document.getElementById('countrySelect');
        const languageSelect = document.getElementById('languageSelect');

        if (countrySelect) {
            countrySelect.value = this.currentCountry;
        }

        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 功能卡片点击事件
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                const page = card.getAttribute('onclick');
                if (page) {
                    // 提取页面名称
                    const match = page.match(/navigateToPage\('(.+?)'\)/);
                    if (match) {
                        this.navigateToPage(match[1]);
                    }
                }
            });
        });

        // 天气仪表板点击事件
        const weatherDashboard = document.querySelector('.weather-dashboard');
        if (weatherDashboard) {
            weatherDashboard.addEventListener('click', () => {
                this.showDetailedWeather();
            });
        }

        // 环境数据刷新事件
        const environmentData = document.querySelector('.environment-data');
        if (environmentData) {
            environmentData.addEventListener('dblclick', () => {
                this.updateEnvironmentData();
                this.showNotification('环境数据已刷新');
            });
        }

        // 农事建议刷新事件
        const farmingStatus = document.querySelector('.farming-status');
        if (farmingStatus) {
            farmingStatus.addEventListener('dblclick', () => {
                this.updateFarmingStatus();
                this.showNotification('农事建议已更新');
            });
        }

        // 侧边栏设置按钮事件
        const sidebarSettingsBtn = document.getElementById('sidebarSettingsBtn');
        if (sidebarSettingsBtn) {
            sidebarSettingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // 侧边栏用户管理按钮事件
        const sidebarUserBtn = document.getElementById('sidebarUserBtn');
        if (sidebarUserBtn) {
            sidebarUserBtn.addEventListener('click', () => {
                this.openUserManagement();
            });
        }

        // 右上角设置按钮事件
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }
    }

    /**
     * 处理国家变更
     */
    handleCountryChange(country) {
        this.currentCountry = country;
        this.saveUserPreferences();
        
        // 更新天气数据（模拟不同国家的天气）
        this.updateWeatherForCountry(country);
        
        // 显示变更提示
        this.showNotification(`已切换到${this.getCountryName(country)}`);
    }

    /**
     * 处理语言变更
     */
    handleLanguageChange(language) {
        this.currentLanguage = language;
        this.saveUserPreferences();
        
        // 更新界面语言
        this.updateInterfaceLanguage(language);
        
        // 显示变更提示
        this.showNotification(`语言已切换为${this.getLanguageName(language)}`);
    }

    /**
     * 根据国家更新天气
     */
    updateWeatherForCountry(country) {
        const weatherByCountry = {
            'CN': { temperature: 25, condition: 'sunny', description: '晴朗', icon: '☀️' },
            'US': { temperature: 22, condition: 'cloudy', description: '多云', icon: '☁️' },
            'JP': { temperature: 18, condition: 'rainy', description: '小雨', icon: '🌧️' },
            'KR': { temperature: 20, condition: 'partly-cloudy', description: '晴转多云', icon: '⛅' }
        };

        this.weatherData = { ...this.weatherData, ...weatherByCountry[country] };
        this.updateWeatherDisplay();
        this.updateFarmingAdvice();
    }

    /**
     * 更新界面语言
     */
    updateInterfaceLanguage(language) {
        // 这里可以实现国际化功能
        // 实际项目中应该加载对应的语言包
        console.log(`界面语言已切换为: ${language}`);
        
        // 更新日期时间显示格式
        this.updateDateTime();
    }

    /**
     * 获取国家名称
     */
    getCountryName(code) {
        const countryNames = {
            'CN': '中国',
            'US': '美国',
            'JP': '日本',
            'KR': '韩国'
        };
        return countryNames[code] || code;
    }

    /**
     * 获取语言名称
     */
    getLanguageName(code) {
        const languageNames = {
            'zh-CN': '中文',
            'en-US': 'English'
        };
        return languageNames[code] || code;
    }

    /**
     * 页面导航
     */
    navigateToPage(pageName) {
        // 检查页面是否存在
        if (this.isPageExists(pageName)) {
            window.location.href = pageName;
        } else {
            this.showNotification('页面正在开发中，敬请期待！');
        }
    }

    /**
     * 检查页面是否存在
     */
    isPageExists(pageName) {
        const existingPages = [
            'pest-detection.html',
            'analysis.html',
            'smart-management.html',
            'model-training.html',
            'reports.html',
            'help.html'
        ];
        return existingPages.includes(pageName);
    }

    /**
     * 显示详细天气信息
     */
    showDetailedWeather() {
        const modal = document.createElement('div');
        modal.className = 'weather-modal';
        modal.innerHTML = `
            <div class="weather-modal-content">
                <div class="weather-modal-header">
                    <h3>🌤️ 详细天气信息</h3>
                    <button class="weather-modal-close">&times;</button>
                </div>
                <div class="weather-modal-body">
                    <div class="weather-detail">
                        <span class="weather-label">当前温度：</span>
                        <span class="weather-value">${this.weatherData.temperature}°C</span>
                    </div>
                    <div class="weather-detail">
                        <span class="weather-label">天气状况：</span>
                        <span class="weather-value">${this.weatherData.description}</span>
                    </div>
                    <div class="weather-detail">
                        <span class="weather-label">农事建议：</span>
                        <span class="weather-value">${this.getFarmingAdvice()}</span>
                    </div>
                    <div class="weather-forecast">
                        <h4>未来3天预报</h4>
                        <div class="forecast-items">
                            <div class="forecast-item">
                                <div class="forecast-date">明天</div>
                                <div class="forecast-icon">🌤️</div>
                                <div class="forecast-temp">23°C</div>
                            </div>
                            <div class="forecast-item">
                                <div class="forecast-date">后天</div>
                                <div class="forecast-icon">☁️</div>
                                <div class="forecast-temp">21°C</div>
                            </div>
                            <div class="forecast-item">
                                <div class="forecast-date">大后天</div>
                                <div class="forecast-icon">🌧️</div>
                                <div class="forecast-temp">19°C</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定关闭事件
        const closeBtn = modal.querySelector('.weather-modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * 显示通知
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'home-notification';
        notification.textContent = message;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // 3秒后自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 保存用户偏好设置
     */
    saveUserPreferences() {
        const preferences = {
            country: this.currentCountry,
            language: this.currentLanguage,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('homePagePreferences', JSON.stringify(preferences));
    }

    /**
     * 加载用户偏好设置
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('homePagePreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.currentCountry = preferences.country || 'CN';
                this.currentLanguage = preferences.language || 'zh-CN';
                
                // 更新界面
                this.initSettings();
                this.updateWeatherForCountry(this.currentCountry);
            }
        } catch (error) {
            console.error('加载用户偏好设置失败:', error);
        }
    }

    /**
     * 获取系统状态
     */
    getSystemStatus() {
        return {
            currentTime: new Date().toISOString(),
            country: this.currentCountry,
            language: this.currentLanguage,
            weather: this.weatherData,
            farmingAdvice: this.getFarmingAdvice()
        };
    }

    /**
    /**
     * 刷新天气数据
     */
    refreshWeather() {
        // 模拟API调用
        setTimeout(() => {
            this.updateWeatherForCountry(this.currentCountry);
            this.showNotification('天气信息已更新');
        }, 1000);
    }

    /**
     * 打开设置模态框
     */
    openSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            // 使用CSS类来显示模态框，确保居中效果
            settingsModal.classList.add('show');
            settingsModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // 加载保存的设置
            this.loadSystemSettings();
        }

        // 绑定关闭事件
        const settingsClose = document.getElementById('settingsClose');
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                this.closeSettings();
            });
        }

        // 点击背景关闭
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeSettings();
                }
            });
        }

        // 绑定保存和重置按钮
        this.initSettingsButtons();
    }

    /**
     * 关闭设置模态框
     */
    closeSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            // 移除CSS类并隐藏模态框
            settingsModal.classList.remove('show');
            settingsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * 初始化设置按钮
     */
    initSettingsButtons() {
        // 保存设置按钮
        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSystemSettings();
            });
        }

        // 重置设置按钮
        const resetSettings = document.getElementById('resetSettings');
        if (resetSettings) {
            resetSettings.addEventListener('click', () => {
                this.resetSystemSettings();
            });
        }
    }

    /**
     * 加载系统设置
     */
    loadSystemSettings() {
        try {
            const saved = localStorage.getItem('systemSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                const apiKey = document.getElementById('apiKey');
                const apiEndpoint = document.getElementById('apiEndpoint');
                const model = document.getElementById('model');
                
                if (apiKey) apiKey.value = settings.apiKey || '';
                if (apiEndpoint) apiEndpoint.value = settings.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
                if (model) model.value = settings.model || 'gpt-4-vision-preview';
            }
        } catch (error) {
            console.error('加载系统设置失败:', error);
        }
    }

    /**
     * 保存系统设置
     */
    saveSystemSettings() {
        const apiKey = document.getElementById('apiKey')?.value || '';
        const apiEndpoint = document.getElementById('apiEndpoint')?.value || '';
        const model = document.getElementById('model')?.value || '';

        // 保存到localStorage
        const settings = {
            apiKey: apiKey,
            apiEndpoint: apiEndpoint,
            model: model,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('systemSettings', JSON.stringify(settings));
        this.showNotification('设置已保存');
        this.closeSettings();
    }

    /**
     * 重置系统设置
     */
    resetSystemSettings() {
        if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
            localStorage.removeItem('systemSettings');
            localStorage.removeItem('homePagePreferences');
            
            // 重置表单
            const apiKey = document.getElementById('apiKey');
            const apiEndpoint = document.getElementById('apiEndpoint');
            const model = document.getElementById('model');
            
            if (apiKey) apiKey.value = '';
            if (apiEndpoint) apiEndpoint.value = 'https://api.openai.com/v1/chat/completions';
            if (model) model.value = 'gpt-4-vision-preview';
            
            // 重置页面设置
            this.currentCountry = 'CN';
            this.currentLanguage = 'zh-CN';
            this.initSettings();
            
            this.showNotification('设置已重置');
        }
    }

    /**
     * 打开用户管理模态框
     */
    openUserManagement() {
        // 创建用户管理模态框
        const userModal = document.createElement('div');
        userModal.className = 'settings-modal';
        userModal.id = 'userModal';
        userModal.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h2><i class="fas fa-user-cog"></i> 用户管理</h2>
                    <button class="settings-close" id="userClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="settings-body">
                    <div class="settings-section">
                        <h3><i class="fas fa-user"></i> 用户信息</h3>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="userName">用户名:</label>
                                <input type="text" id="userName" placeholder="请输入用户名" value="管理员">
                            </div>
                            <div class="form-group">
                                <label for="userEmail">邮箱:</label>
                                <input type="email" id="userEmail" placeholder="请输入邮箱地址" value="admin@example.com">
                            </div>
                            <div class="form-group">
                                <label for="userRole">用户角色:</label>
                                <select id="userRole" class="form-control">
                                    <option value="admin" selected>管理员</option>
                                    <option value="user">普通用户</option>
                                    <option value="viewer">访客</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3><i class="fas fa-key"></i> 密码管理</h3>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="currentPassword">当前密码:</label>
                                <input type="password" id="currentPassword" placeholder="请输入当前密码">
                            </div>
                            <div class="form-group">
                                <label for="newPassword">新密码:</label>
                                <input type="password" id="newPassword" placeholder="请输入新密码">
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">确认密码:</label>
                                <input type="password" id="confirmPassword" placeholder="请再次输入新密码">
                            </div>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3><i class="fas fa-users"></i> 权限管理</h3>
                        <div class="config-form">
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="canManageUsers" checked>
                                    用户管理权限
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="canManageSystem" checked>
                                    系统管理权限
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="canViewReports" checked>
                                    报告查看权限
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="canExportData">
                                    数据导出权限
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3><i class="fas fa-clock"></i> 登录记录</h3>
                        <div class="login-records">
                            <div class="record-item">
                                <span class="record-time">2024-01-15 09:30:25</span>
                                <span class="record-ip">192.168.1.100</span>
                                <span class="record-status success">成功</span>
                            </div>
                            <div class="record-item">
                                <span class="record-time">2024-01-14 16:45:12</span>
                                <span class="record-ip">192.168.1.100</span>
                                <span class="record-status success">成功</span>
                            </div>
                            <div class="record-item">
                                <span class="record-time">2024-01-14 08:20:33</span>
                                <span class="record-ip">192.168.1.105</span>
                                <span class="record-status failed">失败</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="settings-btn-secondary" id="resetUserSettings">
                        <i class="fas fa-undo"></i> 重置信息
                    </button>
                    <button class="settings-btn-primary" id="saveUserSettings">
                        <i class="fas fa-save"></i> 保存更改
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(userModal);

        // 显示模态框
        userModal.classList.add('show');
        userModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // 绑定关闭事件
        const userClose = document.getElementById('userClose');
        if (userClose) {
            userClose.addEventListener('click', () => {
                this.closeUserManagement();
            });
        }

        // 点击背景关闭
        userModal.addEventListener('click', (e) => {
            if (e.target === userModal) {
                this.closeUserManagement();
            }
        });

        // 绑定保存和重置按钮
        this.initUserManagementButtons();
    }

    /**
     * 关闭用户管理模态框
     */
    closeUserManagement() {
        const userModal = document.getElementById('userModal');
        if (userModal) {
            userModal.classList.remove('show');
            userModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.body.removeChild(userModal);
        }
    }

    /**
     * 初始化用户管理按钮
     */
    initUserManagementButtons() {
        // 保存用户设置按钮
        const saveUserSettings = document.getElementById('saveUserSettings');
        if (saveUserSettings) {
            saveUserSettings.addEventListener('click', () => {
                this.saveUserSettings();
            });
        }

        // 重置用户设置按钮
        const resetUserSettings = document.getElementById('resetUserSettings');
        if (resetUserSettings) {
            resetUserSettings.addEventListener('click', () => {
                this.resetUserSettings();
            });
        }
    }

    /**
     * 保存用户设置
     */
    saveUserSettings() {
        const userName = document.getElementById('userName')?.value || '';
        const userEmail = document.getElementById('userEmail')?.value || '';
        const userRole = document.getElementById('userRole')?.value || '';
        const newPassword = document.getElementById('newPassword')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';

        // 验证密码
        if (newPassword && newPassword !== confirmPassword) {
            this.showNotification('新密码与确认密码不匹配！', 'error');
            return;
        }

        // 保存到localStorage
        const userSettings = {
            userName: userName,
            userEmail: userEmail,
            userRole: userRole,
            canManageUsers: document.getElementById('canManageUsers')?.checked || false,
            canManageSystem: document.getElementById('canManageSystem')?.checked || false,
            canViewReports: document.getElementById('canViewReports')?.checked || false,
            canExportData: document.getElementById('canExportData')?.checked || false,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        this.showNotification('用户设置已保存');
        this.closeUserManagement();
    }

    /**
     * 重置用户设置
     */
    resetUserSettings() {
        if (confirm('确定要重置用户信息吗？此操作不可撤销。')) {
            localStorage.removeItem('userSettings');
            
            // 重置表单
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userRole = document.getElementById('userRole');
            
            if (userName) userName.value = '管理员';
            if (userEmail) userEmail.value = 'admin@example.com';
            if (userRole) userRole.value = 'admin';
            
            this.showNotification('用户信息已重置');
        }
    }

    /**
     * 系统下载功能
     */
    downloadSystem(type = 'full') {
        // 模拟下载过程
        this.showNotification('正在准备下载文件...');
        
        // 创建下载进度模态框
        const progressModal = this.createDownloadProgressModal();
        document.body.appendChild(progressModal);
        
        // 模拟下载进度
        this.simulateDownloadProgress(progressModal, type);
    }

    /**
     * 创建下载进度模态框
     */
    createDownloadProgressModal() {
        const modal = document.createElement('div');
        modal.className = 'download-progress-modal';
        modal.innerHTML = `
            <div class="download-progress-content">
                <div class="download-progress-header">
                    <h3><i class="fas fa-download"></i> 系统下载中</h3>
                </div>
                <div class="download-progress-body">
                    <div class="download-file-info">
                        <div class="file-icon">📦</div>
                        <div class="file-details">
                            <div class="file-name">穗安巡视官-智慧农业AI一体系统-v1.0.0.zip</div>
                            <div class="file-size">156.8 MB</div>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="downloadProgress"></div>
                        </div>
                        <div class="progress-text">
                            <span id="progressPercent">0%</span>
                            <span id="downloadSpeed">0 KB/s</span>
                        </div>
                    </div>
                    <div class="download-status" id="downloadStatus">正在连接服务器...</div>
                </div>
                <div class="download-progress-actions">
                    <button class="download-cancel-btn" id="cancelDownload">
                        <i class="fas fa-times"></i> 取消下载
                    </button>
                </div>
            </div>
        `;
        
        // 绑定取消下载事件
        const cancelBtn = modal.querySelector('#cancelDownload');
        cancelBtn.addEventListener('click', () => {
            this.cancelDownload(modal);
        });
        
        return modal;
    }

    /**
     * 模拟下载进度
     */
    simulateDownloadProgress(modal, type) {
        const progressFill = modal.querySelector('#downloadProgress');
        const progressPercent = modal.querySelector('#progressPercent');
        const downloadSpeed = modal.querySelector('#downloadSpeed');
        const downloadStatus = modal.querySelector('#downloadStatus');
        
        let progress = 0;
        const totalSize = 156.8; // MB
        let currentSize = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 5 + 2; // 随机增加2-7%
            currentSize = (totalSize * progress / 100);
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.completeDownload(modal);
            }
            
            // 更新进度显示
            progressFill.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.round(progress)}%`;
            downloadSpeed.textContent = `${Math.round(Math.random() * 2000 + 500)} KB/s`;
            downloadStatus.textContent = `已下载 ${currentSize.toFixed(1)} MB / ${totalSize} MB`;
            
        }, 200);
        
        // 保存interval ID以便取消
        modal.downloadInterval = interval;
    }

    /**
     * 完成下载
     */
    completeDownload(modal) {
        const downloadStatus = modal.querySelector('#downloadStatus');
        const cancelBtn = modal.querySelector('#cancelDownload');
        
        downloadStatus.textContent = '下载完成！';
        cancelBtn.innerHTML = '<i class="fas fa-check"></i> 完成';
        cancelBtn.onclick = () => {
            document.body.removeChild(modal);
            this.showNotification('系统下载完成！请查看下载文件夹。');
        };
        
        // 3秒后自动关闭
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
                this.showNotification('系统下载完成！请查看下载文件夹。');
            }
        }, 3000);
    }

    /**
     * 取消下载
     */
    cancelDownload(modal) {
        if (modal.downloadInterval) {
            clearInterval(modal.downloadInterval);
        }
        document.body.removeChild(modal);
        this.showNotification('下载已取消');
    }

    /**
     * 查看更新日志
     */
    viewChangelog() {
        const changelogModal = document.createElement('div');
        changelogModal.className = 'changelog-modal';
        changelogModal.innerHTML = `
            <div class="changelog-content">
                <div class="changelog-header">
                    <h3><i class="fas fa-list"></i> 更新日志</h3>
                    <button class="changelog-close">&times;</button>
                </div>
                <div class="changelog-body">
                    <div class="version-entry">
                        <div class="version-header">
                            <span class="version-tag">v1.0.0</span>
                            <span class="version-date">2024-01-15</span>
                        </div>
                        <div class="version-changes">
                            <div class="change-item new">
                                <span class="change-type">新增</span>
                                <span class="change-desc">AI病虫害识别功能</span>
                            </div>
                            <div class="change-item new">
                                <span class="change-type">新增</span>
                                <span class="change-desc">智能天气监测系统</span>
                            </div>
                            <div class="change-item new">
                                <span class="change-type">新增</span>
                                <span class="change-desc">农事建议智能推荐</span>
                            </div>
                            <div class="change-item new">
                                <span class="change-type">新增</span>
                                <span class="change-desc">数据分析与报告生成</span>
                            </div>
                            <div class="change-item new">
                                <span class="change-type">新增</span>
                                <span class="change-desc">用户管理与权限控制</span>
                            </div>
                        </div>
                    </div>
                    <div class="version-entry">
                        <div class="version-header">
                            <span class="version-tag">v0.9.0-beta</span>
                            <span class="version-date">2024-01-01</span>
                        </div>
                        <div class="version-changes">
                            <div class="change-item fix">
                                <span class="change-type">修复</span>
                                <span class="change-desc">系统稳定性优化</span>
                            </div>
                            <div class="change-item improve">
                                <span class="change-type">优化</span>
                                <span class="change-desc">界面响应速度提升</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(changelogModal);
        
        // 绑定关闭事件
        const closeBtn = changelogModal.querySelector('.changelog-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(changelogModal);
        });
        
        // 点击背景关闭
        changelogModal.addEventListener('click', (e) => {
            if (e.target === changelogModal) {
                document.body.removeChild(changelogModal);
            }
        });
    }
}

// 添加天气模态框样式
const weatherModalStyles = `
<style>
.weather-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.weather-modal-content {
    background: white;
    border-radius: 12px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.weather-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
    background: linear-gradient(135deg, #87CEEB, #B3E5FC);
    color: white;
    border-radius: 12px 12px 0 0;
}

.weather-modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
}

.weather-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: white;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.weather-modal-close:hover {
    background: rgba(255,255,255,0.2);
}

.weather-modal-body {
    padding: 20px;
}

.weather-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.weather-label {
    font-weight: 600;
    color: #333;
}

.weather-value {
    color: #666;
}

.weather-forecast {
    margin-top: 20px;
}

.weather-forecast h4 {
    margin-bottom: 15px;
    color: #333;
}

.forecast-items {
    display: flex;
    gap: 15px;
    justify-content: space-around;
}

.forecast-item {
    text-align: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    flex: 1;
}

.forecast-date {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 8px;
}

.forecast-icon {
    font-size: 2rem;
    margin-bottom: 8px;
}

.forecast-temp {
    font-weight: 600;
    color: #333;
}

.home-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.home-notification.show {
    transform: translateX(0);
}

@media (max-width: 480px) {
    .weather-modal-content {
        width: 95%;
        margin: 20px;
    }
    
    .forecast-items {
        flex-direction: column;
        gap: 10px;
    }
    
    .home-notification {
        right: 10px;
        left: 10px;
        text-align: center;
    }
}
</style>
`;

// 添加样式到页面
document.head.insertAdjacentHTML('beforeend', weatherModalStyles);

// 创建主页面实例
const homePage = new HomePage();

// 导出到全局作用域
window.homePage = homePage;

// 全局函数，供HTML调用
window.downloadSystem = function(type) {
    homePage.downloadSystem(type);
};

window.viewChangelog = function() {
    homePage.viewChangelog();
};
