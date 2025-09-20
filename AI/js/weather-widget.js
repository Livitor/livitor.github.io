// 天气组件模块
class WeatherWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.updateInterval = null;
        this.isUpdating = false;
        
        if (!this.container) {
            console.error(`找不到容器元素: ${containerId}`);
            return;
        }
        
        this.init();
    }

    // 初始化组件
    init() {
        this.render();
        this.startAutoUpdate();
    }

    // 渲染天气组件
    render() {
        this.container.innerHTML = `
            <div class="weather-widget">
                <div class="weather-header">
                    <h3>环境监测</h3>
                    <div class="update-status" id="updateStatus">
                        <span class="status-dot"></span>
                        <span class="status-text">连接中...</span>
                    </div>
                </div>
                
                <div class="weather-content">
                    <div class="weather-item temperature">
                        <div class="weather-icon">🌡️</div>
                        <div class="weather-info">
                            <div class="weather-label">温度</div>
                            <div class="weather-value" id="temperatureValue">--</div>
                            <div class="weather-unit">°C</div>
                        </div>
                    </div>
                    
                    <div class="weather-item humidity">
                        <div class="weather-icon">💧</div>
                        <div class="weather-info">
                            <div class="weather-label">湿度</div>
                            <div class="weather-value" id="humidityValue">--</div>
                            <div class="weather-unit">%</div>
                        </div>
                    </div>
                </div>
                
                <div class="weather-footer">
                    <div class="last-update" id="lastUpdate">最后更新: --</div>
                    <button class="refresh-btn" id="refreshBtn" onclick="weatherWidget.updateWeatherData()">
                        <span class="refresh-icon">🔄</span>
                        刷新
                    </button>
                </div>
            </div>
        `;
        
        // 立即更新一次数据
        this.updateWeatherData();
    }

    // 更新天气数据
    async updateWeatherData() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        this.setUpdateStatus('updating', '更新中...');
        
        try {
            const data = await weatherAPI.getWeatherData();
            
            if (data.error) {
                this.setUpdateStatus('error', '连接失败');
                this.displayError(data.error);
            } else {
                this.setUpdateStatus('success', '已连接');
                this.displayWeatherData(data);
            }
        } catch (error) {
            console.error('更新天气数据失败:', error);
            this.setUpdateStatus('error', '连接失败');
            this.displayError(error.message);
        } finally {
            this.isUpdating = false;
        }
    }

    // 显示天气数据
    displayWeatherData(data) {
        const temperatureElement = document.getElementById('temperatureValue');
        const humidityElement = document.getElementById('humidityValue');
        const lastUpdateElement = document.getElementById('lastUpdate');
        
        if (temperatureElement) {
            temperatureElement.textContent = data.temperature !== '--' ? 
                data.temperature.toFixed(2) : '--';
        }
        
        if (humidityElement) {
            humidityElement.textContent = data.humidity !== '--' ? 
                data.humidity.toFixed(2) : '--';
        }
        
        if (lastUpdateElement) {
            const updateText = `最后更新: ${data.timestamp}`;
            const dataSourceText = data.isMockData ? ' (模拟数据)' : ' (真实数据)';
            lastUpdateElement.textContent = updateText + dataSourceText;
        }
    }

    // 显示错误信息
    displayError(errorMessage) {
        const temperatureElement = document.getElementById('temperatureValue');
        const humidityElement = document.getElementById('humidityValue');
        const lastUpdateElement = document.getElementById('lastUpdate');
        
        if (temperatureElement) temperatureElement.textContent = '--';
        if (humidityElement) humidityElement.textContent = '--';
        if (lastUpdateElement) {
            lastUpdateElement.textContent = `错误: ${errorMessage}`;
        }
    }

    // 设置更新状态
    setUpdateStatus(status, text) {
        const statusElement = document.getElementById('updateStatus');
        if (statusElement) {
            const dot = statusElement.querySelector('.status-dot');
            const textElement = statusElement.querySelector('.status-text');
            
            if (dot) {
                dot.className = `status-dot ${status}`;
            }
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    // 开始自动更新
    startAutoUpdate() {
        // 每30秒更新一次数据
        this.updateInterval = setInterval(() => {
            this.updateWeatherData();
        }, 30000);
    }

    // 停止自动更新
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // 销毁组件
    destroy() {
        this.stopAutoUpdate();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// 全局变量，方便在HTML中调用
let weatherWidget = null;