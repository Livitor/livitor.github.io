/**
 * 新版主页面功能模块
 * 实现左侧菜单 + 右侧工作区的农业智能系统
 */
class NewHomePage {
    constructor() {
        this.currentPage = 'home';
        this.isMobile = window.innerWidth <= 768;
        this.sidebarActive = false;
        this.monitoringImages = [
            'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=200&fit=crop',
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=200&fit=crop',
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop'
        ];
        this.currentImageIndex = 0;
        this.init();
    }

    /**
     * 初始化系统
     */
    init() {
        this.initEventListeners();
        this.initCharts();
        this.startDataUpdates();
        this.initResponsive();
        this.loadUserPreferences();
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 移动端菜单切换
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // 侧边栏遮罩层点击
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // 导航菜单点击
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                this.navigateToPage(page, item);
            });
        });

        // 功能卡片点击
        const functionCards = document.querySelectorAll('.function-card[data-page]');
        functionCards.forEach(card => {
            card.addEventListener('click', () => {
                const page = card.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // 设置按钮点击
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }
        
        // 用户管理按钮点击
        const userManagementBtn = document.getElementById('userManagementBtn');
        if (userManagementBtn) {
            userManagementBtn.addEventListener('click', () => {
                this.openUserManagement();
            });
        }

        // 天气卡片点击 - 显示详细信息
        const weatherCard = document.querySelector('.weather-card');
        if (weatherCard) {
            weatherCard.addEventListener('click', () => {
                this.showWeatherDetails();
            });
        }

        // 田间监控图像点击 - 切换图像
        const fieldImage = document.querySelector('.field-image');
        if (fieldImage) {
            fieldImage.addEventListener('click', () => {
                this.switchMonitoringImage();
            });
        }

        // 窗口大小变化监听
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    /**
     * 初始化图表
     */
    initCharts() {
        this.initTemperatureChart();
        this.initTrendCharts();
    }

    /**
     * 初始化温度图表
     */
    initTemperatureChart() {
        const canvas = document.getElementById('temperatureChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // 清除画布
        ctx.clearRect(0, 0, width, height);

        // 绘制温度曲线
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const points = [
            { x: 20, y: 60 },
            { x: 60, y: 40 },
            { x: 100, y: 35 },
            { x: 140, y: 45 },
            { x: 180, y: 30 }
        ];

        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();

        // 绘制数据点
        ctx.fillStyle = '#4CAF50';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    /**
     * 初始化趋势图表
     */
    initTrendCharts() {
        this.initTemperatureTrend();
        this.initHumidityTrend();
    }

    /**
     * 初始化温度趋势图
     */
    initTemperatureTrend() {
        const canvas = document.getElementById('temperatureTrend');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // 绘制温度趋势线
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const tempPoints = this.generateTrendData(width, height, 8);
        tempPoints.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();
    }

    /**
     * 初始化湿度趋势图
     */
    initHumidityTrend() {
        const canvas = document.getElementById('humidityTrend');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // 绘制湿度趋势线
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const humidityPoints = this.generateTrendData(width, height, 6);
        humidityPoints.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();
    }

    /**
     * 生成趋势数据点
     */
    generateTrendData(width, height, pointCount) {
        const points = [];
        const stepX = width / (pointCount - 1);
        
        for (let i = 0; i < pointCount; i++) {
            points.push({
                x: i * stepX,
                y: height * 0.2 + Math.random() * height * 0.6
            });
        }
        
        return points;
    }

    /**
     * 开始数据更新循环
     */
    startDataUpdates() {
        // 每30秒更新环境数据
        setInterval(() => {
            this.updateEnvironmentData();
        }, 30000);

        // 每5秒切换监控图像
        setInterval(() => {
            this.autoSwitchMonitoringImage();
        }, 5000);

        // 每分钟更新图表
        setInterval(() => {
            this.updateCharts();
        }, 60000);
    }

    /**
     * 更新环境数据
     */
    updateEnvironmentData() {
        // 模拟数据变化
        const temperatureElement = document.querySelector('.temperature');
        const humidityElements = document.querySelectorAll('.data-value');
        const monitorValues = document.querySelectorAll('.monitor-value');

        if (temperatureElement) {
            const newTemp = 20 + Math.random() * 15;
            temperatureElement.textContent = `${Math.round(newTemp)}°C`;
        }

        // 更新湿度等数据
        if (humidityElements.length > 0) {
            humidityElements[0].innerHTML = `${Math.round(50 + Math.random() * 30)}<small>%</small>`;
            if (humidityElements[1]) {
                humidityElements[1].textContent = `${Math.round(20 + Math.random() * 15)}°C`;
            }
        }

        // 更新监控数据
        if (monitorValues.length >= 2) {
            monitorValues[0].textContent = `${(25 + Math.random() * 15).toFixed(1)}°C`;
            monitorValues[1].textContent = `${Math.round(60 + Math.random() * 25)}%`;
        }
    }

    /**
     * 更新图表
     */
    updateCharts() {
        this.initTemperatureChart();
        this.initTrendCharts();
    }

    /**
     * 切换监控图像
     */
    switchMonitoringImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.monitoringImages.length;
        const img = document.getElementById('monitoringImage');
        if (img) {
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = this.monitoringImages[this.currentImageIndex];
                img.style.opacity = '1';
            }, 300);
        }
    }

    /**
     * 自动切换监控图像
     */
    autoSwitchMonitoringImage() {
        this.switchMonitoringImage();
    }

    /**
     * 切换侧边栏
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (this.sidebarActive) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    /**
     * 打开侧边栏
     */
    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        
        this.sidebarActive = true;
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭侧边栏
     */
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        
        this.sidebarActive = false;
        document.body.style.overflow = 'auto';
    }

    /**
     * 页面导航
     */
    navigateToPage(page, navItem = null) {
        // 更新导航状态
        if (navItem) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            navItem.classList.add('active');
        }

        this.currentPage = page;

        // 根据页面类型处理导航
        switch (page) {
            case 'home':
                // 已在主页
                break;
            case 'pest-detection':
                this.showNotification('拍照识虫功能开发中...');
                break;
            case 'smart-management':
                this.showNotification('种植助手功能开发中...');
                break;
            case 'analysis':
                this.showNotification('农情分析功能开发中...');
                break;
            case 'calendar':
                this.showNotification('农事日历功能开发中...');
                break;
            case 'monitoring':
                this.showNotification('实时监控功能开发中...');
                break;
            default:
                this.showNotification('功能开发中，敬请期待！');
        }

        // 移动端自动关闭侧边栏
        if (this.isMobile) {
            this.closeSidebar();
        }
    }

    /**
     * 显示天气详情
     */
    showWeatherDetails() {
        const modal = document.createElement('div');
        modal.className = 'weather-modal';
        modal.innerHTML = `
            <div class="weather-modal-content">
                <div class="weather-modal-header">
                    <h3>🌤️ 详细天气信息</h3>
                    <button class="weather-modal-close">&times;</button>
                </div>
                <div class="weather-modal-body">
                    <div class="weather-details-grid">
                        <div class="weather-detail-item">
                            <span class="detail-label">当前温度</span>
                            <span class="detail-value">25°C</span>
                        </div>
                        <div class="weather-detail-item">
                            <span class="detail-label">体感温度</span>
                            <span class="detail-value">27°C</span>
                        </div>
                        <div class="weather-detail-item">
                            <span class="detail-label">湿度</span>
                            <span class="detail-value">65%</span>
                        </div>
                        <div class="weather-detail-item">
                            <span class="detail-label">风速</span>
                            <span class="detail-value">3级</span>
                        </div>
                        <div class="weather-detail-item">
                            <span class="detail-label">气压</span>
                            <span class="detail-value">1013 hPa</span>
                        </div>
                        <div class="weather-detail-item">
                            <span class="detail-label">能见度</span>
                            <span class="detail-value">10 km</span>
                        </div>
                    </div>
                    <div class="farming-advice-section">
                        <h4>🌾 农事建议</h4>
                        <div class="advice-list">
                            <div class="advice-item">✅ 适宜进行播种和移栽作业</div>
                            <div class="advice-item">✅ 建议上午10点前完成田间管理</div>
                            <div class="advice-item">✅ 注意适量灌溉，保持土壤湿润</div>
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

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * 打开设置
     */
    openSettings() {
        // 检查系统设置模块是否已加载
        if (window.systemSettings) {
            window.systemSettings.openModal();
        } else {
            this.showNotification('系统设置模块加载中...', 'info');
            
            // 动态加载系统设置模块
            const script = document.createElement('script');
            script.src = 'js/system-settings.js';
            script.onload = () => {
                window.systemSettings.openModal();
            };
            script.onerror = () => {
                this.showNotification('加载系统设置模块失败', 'error');
            };
            document.head.appendChild(script);
        }
    }
    
    /**
     * 打开用户管理
     */
    openUserManagement() {
        // 检查用户管理模块是否已加载
        if (window.userManagement) {
            window.userManagement.openModal();
        } else {
            this.showNotification('用户管理模块加载中...', 'info');
            
            // 动态加载用户管理模块
            const script = document.createElement('script');
            script.src = 'js/user-management.js';
            script.onload = () => {
                window.userManagement.openModal();
            };
            script.onerror = () => {
                this.showNotification('加载用户管理模块失败', 'error');
            };
            document.head.appendChild(script);
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#f44336' : '#4CAF50',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 3秒后自动移除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // 如果从桌面端切换到移动端，关闭侧边栏
        if (!wasMobile && this.isMobile && this.sidebarActive) {
            this.closeSidebar();
        }

        // 如果从移动端切换到桌面端，确保侧边栏状态正确
        if (wasMobile && !this.isMobile) {
            this.closeSidebar();
        }
    }

    /**
     * 初始化响应式
     */
    initResponsive() {
        this.handleResize();
    }

    /**
     * 保存用户偏好
     */
    saveUserPreferences() {
        const preferences = {
            currentPage: this.currentPage,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('newHomePagePreferences', JSON.stringify(preferences));
    }

    /**
     * 加载用户偏好
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('newHomePagePreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.currentPage = preferences.currentPage || 'home';
            }
        } catch (error) {
            console.error('加载用户偏好失败:', error);
        }
    }

    /**
     * 获取系统状态
     */
    getSystemStatus() {
        return {
            currentPage: this.currentPage,
            isMobile: this.isMobile,
            sidebarActive: this.sidebarActive,
            currentTime: new Date().toISOString()
        };
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
    backdrop-filter: blur(5px);
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

.weather-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
}

.weather-detail-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;
}

.detail-label {
    font-size: 0.9rem;
    color: #666;
}

.detail-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}

.farming-advice-section {
    border-top: 1px solid #eee;
    padding-top: 20px;
}

.farming-advice-section h4 {
    margin-bottom: 15px;
    color: #333;
}

.advice-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.advice-item {
    padding: 8px 12px;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 6px;
    color: #2E7D32;
    font-size: 0.9rem;
}

@media (max-width: 480px) {
    .weather-details-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .weather-modal-content {
        width: 95%;
        margin: 20px;
    }
}
</style>
`;

// 添加样式到页面
document.head.insertAdjacentHTML('beforeend', weatherModalStyles);

// 创建新主页面实例
const newHomePage = new NewHomePage();

// 导出到全局作用域
window.newHomePage = newHomePage;

console.log('新版智慧农业AI系统已加载完成');