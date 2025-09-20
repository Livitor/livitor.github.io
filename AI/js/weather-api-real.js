// 真实天气数据API模块 - 直接连接云平台
class WeatherAPIReal {
    constructor() {
        this.baseURL = 'http://api.nlecloud.com';
        this.deviceId = '1309651';
        this.account = '18856933077';
        this.password = '123456';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // 获取访问令牌
    async getAccessToken() {
        try {
            // 检查token是否还有效
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            console.log('正在获取访问令牌...');
            
            const formData = new FormData();
            formData.append('Account', this.account);
            formData.append('password', this.password);

            const response = await fetch(`${this.baseURL}/users/login`, {
                method: 'POST',
                body: formData,
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const data = await response.json();
            console.log('登录响应:', data);

            if (data.ResultObj && data.ResultObj.AccessToken) {
                this.accessToken = data.ResultObj.AccessToken;
                // 设置token过期时间（假设1小时有效）
                this.tokenExpiry = Date.now() + (60 * 60 * 1000);
                console.log('访问令牌获取成功');
                return this.accessToken;
            }
            throw new Error('获取访问令牌失败: ' + (data.Message || '未知错误'));
        } catch (error) {
            console.error('获取访问令牌错误:', error);
            throw error;
        }
    }

    // 获取温度数据
    async getTemperature() {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            console.log('正在获取温度数据...');
            
            const url = `${this.baseURL}/devices/${this.deviceId}/Sensors?apiTags=temp&AccessToken=${this.accessToken}`;
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token可能过期，重新获取
                    this.accessToken = null;
                    await this.getAccessToken();
                    return await this.getTemperature();
                }
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const data = await response.json();
            console.log('温度数据响应:', data);

            if (data.ResultObj && data.ResultObj.length > 0) {
                const temperature = parseFloat(data.ResultObj[0].Value);
                console.log('温度值:', temperature);
                return temperature;
            }
            throw new Error('温度数据格式错误');
        } catch (error) {
            console.error('获取温度数据错误:', error);
            throw error;
        }
    }

    // 获取湿度数据
    async getHumidity() {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            console.log('正在获取湿度数据...');
            
            const url = `${this.baseURL}/devices/${this.deviceId}/Sensors?apiTags=shi_du&AccessToken=${this.accessToken}`;
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token可能过期，重新获取
                    this.accessToken = null;
                    await this.getAccessToken();
                    return await this.getHumidity();
                }
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const data = await response.json();
            console.log('湿度数据响应:', data);

            if (data.ResultObj && data.ResultObj.length > 0) {
                const humidity = parseFloat(data.ResultObj[0].Value);
                console.log('湿度值:', humidity);
                return humidity;
            }
            throw new Error('湿度数据格式错误');
        } catch (error) {
            console.error('获取湿度数据错误:', error);
            throw error;
        }
    }

    // 同时获取温度和湿度
    async getWeatherData() {
        try {
            console.log('开始获取天气数据...');
            
            const [temperature, humidity] = await Promise.all([
                this.getTemperature(),
                this.getHumidity()
            ]);
            
            const result = {
                temperature: temperature,
                humidity: humidity,
                timestamp: new Date().toLocaleString('zh-CN'),
                isRealData: true
            };
            
            console.log('天气数据获取成功:', result);
            return result;
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
}

// 导出API实例
const weatherAPI = new WeatherAPIReal();