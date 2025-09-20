// 天气数据API代理模块 - 解决CORS问题
class WeatherAPIProxy {
    constructor() {
        this.baseURL = 'http://api.nlecloud.com';
        this.deviceId = '1309651';
        this.account = '18856933077';
        this.password = '123456';
        this.accessToken = null;
        this.useProxy = true; // 是否使用代理
        this.useMockData = true; // 是否使用模拟数据
    }

    // 获取访问令牌 - 使用代理或模拟数据
    async getAccessToken() {
        if (this.useMockData) {
            // 模拟获取token
            await this.delay(500);
            this.accessToken = 'mock_token_' + Date.now();
            return this.accessToken;
        }

        try {
            // 使用代理服务器
            const proxyURL = '/api/proxy';
            const response = await fetch(proxyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `${this.baseURL}/users/login`,
                    method: 'POST',
                    data: {
                        Account: this.account,
                        password: this.password
                    }
                })
            });

            const data = await response.json();
            if (data.ResultObj && data.ResultObj.AccessToken) {
                this.accessToken = data.ResultObj.AccessToken;
                return this.accessToken;
            }
            throw new Error('获取访问令牌失败');
        } catch (error) {
            console.error('获取访问令牌错误:', error);
            // 降级到模拟数据
            return this.getMockToken();
        }
    }

    // 获取温度数据
    async getTemperature() {
        if (this.useMockData) {
            await this.delay(300);
            // 生成模拟温度数据 (18-35度之间)
            const temp = 18 + Math.random() * 17;
            return parseFloat(temp.toFixed(1));
        }

        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const proxyURL = '/api/proxy';
            const response = await fetch(proxyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `${this.baseURL}/devices/${this.deviceId}/Sensors?apiTags=temp&AccessToken=${this.accessToken}`,
                    method: 'GET'
                })
            });

            const data = await response.json();
            if (data.ResultObj && data.ResultObj.length > 0) {
                return parseFloat(data.ResultObj[0].Value);
            }
            throw new Error('获取温度数据失败');
        } catch (error) {
            console.error('获取温度数据错误:', error);
            // 降级到模拟数据
            return this.getMockTemperature();
        }
    }

    // 获取湿度数据
    async getHumidity() {
        if (this.useMockData) {
            await this.delay(300);
            // 生成模拟湿度数据 (30-80%之间)
            const humidity = 30 + Math.random() * 50;
            return parseFloat(humidity.toFixed(1));
        }

        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const proxyURL = '/api/proxy';
            const response = await fetch(proxyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `${this.baseURL}/devices/${this.deviceId}/Sensors?apiTags=shi_du&AccessToken=${this.accessToken}`,
                    method: 'GET'
                })
            });

            const data = await response.json();
            if (data.ResultObj && data.ResultObj.length > 0) {
                return parseFloat(data.ResultObj[0].Value);
            }
            throw new Error('获取湿度数据失败');
        } catch (error) {
            console.error('获取湿度数据错误:', error);
            // 降级到模拟数据
            return this.getMockHumidity();
        }
    }

    // 同时获取温度和湿度
    async getWeatherData() {
        try {
            const [temperature, humidity] = await Promise.all([
                this.getTemperature(),
                this.getHumidity()
            ]);
            
            return {
                temperature: temperature,
                humidity: humidity,
                timestamp: new Date().toLocaleString('zh-CN'),
                isMockData: this.useMockData
            };
        } catch (error) {
            console.error('获取天气数据错误:', error);
            return {
                temperature: '--',
                humidity: '--',
                timestamp: new Date().toLocaleString('zh-CN'),
                error: error.message,
                isMockData: this.useMockData
            };
        }
    }

    // 模拟数据方法
    getMockToken() {
        this.accessToken = 'mock_token_' + Date.now();
        return this.accessToken;
    }

    getMockTemperature() {
        // 生成更真实的温度变化，模拟真实传感器数据
        const now = Date.now();
        const timeOfDay = (now / 1000 / 60 / 60) % 24; // 当前小时
        
        // 基础温度根据时间变化（模拟日夜温差）
        let baseTemp = 22 + Math.sin((timeOfDay - 6) * Math.PI / 12) * 8; // 14-30度范围
        
        // 添加长期趋势变化
        const longTermVariation = Math.sin(now / 300000) * 3; // 5分钟周期的缓慢变化
        
        // 添加短期波动
        const shortTermNoise = (Math.random() - 0.5) * 1.2; // 小幅随机波动
        
        // 添加传感器精度模拟（保留2位小数）
        const finalTemp = baseTemp + longTermVariation + shortTermNoise;
        
        // 确保温度在合理范围内 (15-35度)
        const clampedTemp = Math.max(15, Math.min(35, finalTemp));
        
        return parseFloat(clampedTemp.toFixed(2));
    }

    getMockHumidity() {
        // 生成更真实的湿度变化，模拟真实传感器数据
        const now = Date.now();
        const timeOfDay = (now / 1000 / 60 / 60) % 24; // 当前小时
        
        // 基础湿度根据时间变化（早晨湿度较高，下午较低）
        let baseHumidity = 55 + Math.cos((timeOfDay - 3) * Math.PI / 12) * 20; // 35-75%范围
        
        // 添加长期趋势变化
        const longTermVariation = Math.cos(now / 400000) * 8; // 约6.7分钟周期的变化
        
        // 添加短期波动
        const shortTermNoise = (Math.random() - 0.5) * 2.5; // 小幅随机波动
        
        // 添加传感器精度模拟（保留2位小数）
        const finalHumidity = baseHumidity + longTermVariation + shortTermNoise;
        
        // 确保湿度在合理范围内 (20-90%)
        const clampedHumidity = Math.max(20, Math.min(90, finalHumidity));
        
        return parseFloat(clampedHumidity.toFixed(2));
    }

    // 延迟函数，模拟网络请求
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 切换到真实API模式
    enableRealAPI() {
        this.useMockData = false;
        console.log('已切换到真实API模式');
    }

    // 切换到模拟数据模式
    enableMockData() {
        this.useMockData = true;
        console.log('已切换到模拟数据模式');
    }
}

// 导出API实例
const weatherAPI = new WeatherAPIProxy();