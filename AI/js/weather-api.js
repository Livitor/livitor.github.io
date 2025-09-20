// 天气数据API模块
class WeatherAPI {
    constructor() {
        this.baseURL = 'http://api.nlecloud.com';
        this.deviceId = '1309651';
        this.account = '18856933077';
        this.password = '123456';
        this.accessToken = null;
    }

    // 获取访问令牌
    async getAccessToken() {
        try {
            const response = await fetch(`${this.baseURL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    Account: this.account,
                    password: this.password
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
            throw error;
        }
    }

    // 获取温度数据
    async getTemperature() {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const response = await fetch(
                `${this.baseURL}/devices/${this.deviceId}/Sensors?apiTags=temp&AccessToken=${this.accessToken}`
            );

            const data = await response.json();
            if (data.ResultObj && data.ResultObj.length > 0) {
                return parseFloat(data.ResultObj[0].Value);
            }
            throw new Error('获取温度数据失败');
        } catch (error) {
            console.error('获取温度数据错误:', error);
            // 如果token过期，重新获取
            if (error.message.includes('token') || error.message.includes('401')) {
                this.accessToken = null;
                return await this.getTemperature();
            }
            throw error;
        }
    }

    // 获取湿度数据
    async getHumidity() {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const response = await fetch(
                `${this.baseURL}/devices/${this.deviceId}/Sensors?apiTags=shi_du&AccessToken=${this.accessToken}`
            );

            const data = await response.json();
            if (data.ResultObj && data.ResultObj.length > 0) {
                return parseFloat(data.ResultObj[0].Value);
            }
            throw new Error('获取湿度数据失败');
        } catch (error) {
            console.error('获取湿度数据错误:', error);
            // 如果token过期，重新获取
            if (error.message.includes('token') || error.message.includes('401')) {
                this.accessToken = null;
                return await this.getHumidity();
            }
            throw error;
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
                timestamp: new Date().toLocaleString('zh-CN')
            };
        } catch (error) {
            console.error('获取天气数据错误:', error);
            return {
                temperature: '--',
                humidity: '--',
                timestamp: new Date().toLocaleString('zh-CN'),
                error: error.message
            };
        }
    }
}

// 导出API实例
const weatherAPI = new WeatherAPI();