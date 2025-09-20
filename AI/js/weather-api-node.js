// 通过Node.js代理获取真实天气数据
class WeatherAPINode {
    constructor() {
        this.proxyURL = 'http://localhost:3000/api/weather';
    }

    // 获取天气数据
    async getWeatherData() {
        try {
            console.log('正在从代理服务器获取天气数据...');
            
            const response = await fetch(this.proxyURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const data = await response.json();
            console.log('代理服务器响应:', data);

            if (data.success) {
                return {
                    temperature: data.temperature,
                    humidity: data.humidity,
                    timestamp: data.timestamp,
                    isRealData: true
                };
            } else {
                throw new Error(data.error || '获取数据失败');
            }
        } catch (error) {
            console.error('获取天气数据错误:', error);
            return {
                temperature: '--',
                humidity: '--',
                timestamp: new Date().toLocaleString('zh-CN'),
                error: error.message,
                isRealData: false
            };
        }
    }

    // 兼容性方法
    async getTemperature() {
        const data = await this.getWeatherData();
        return data.temperature;
    }

    async getHumidity() {
        const data = await this.getWeatherData();
        return data.humidity;
    }
}

// 导出API实例
const weatherAPI = new WeatherAPINode();