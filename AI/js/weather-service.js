// 天气服务 - 获取真实传感器数据

// 真实数据API配置
const REAL_WEATHER_API_URL = 'http://localhost:3000/api/weather';

// 存储天气数据的键名
const WEATHER_DATA_KEY = 'real_weather_data';

// 初始化天气服务
document.addEventListener('DOMContentLoaded', () => {
    // 获取真实传感器数据
    fetchRealWeatherData();
    
    // 每30秒更新一次真实数据
    setInterval(() => {
        fetchRealWeatherData();
    }, 30 * 1000);
});

/**
 * 获取真实传感器天气数据
 */
async function fetchRealWeatherData() {
    try {
        console.log('正在获取真实传感器数据...');
        
        const response = await fetch(REAL_WEATHER_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const data = await response.json();
        console.log('真实传感器数据:', data);

        if (data.success) {
            // 转换真实传感器数据为天气UI格式
            const weatherData = convertSensorDataToWeatherFormat(data);
            saveWeatherData(weatherData);
            updateWeatherUI(weatherData);
        } else {
            throw new Error(data.error || '获取传感器数据失败');
        }
    } catch (error) {
        console.error('获取真实传感器数据失败:', error);
        
        // 如果Node.js代理服务器未运行，显示提示信息
        if (error.message.includes('fetch')) {
            showProxyServerNotice();
        } else {
            // 使用备用数据
            const fallbackData = getBeijingWeatherData();
            saveWeatherData(fallbackData);
            updateWeatherUI(fallbackData);
        }
    }
}

/**
 * 将传感器数据转换为天气UI格式
 * @param {Object} sensorData - 传感器数据
 * @returns {Object} 天气UI格式数据
 */
function convertSensorDataToWeatherFormat(sensorData) {
    const temperature = parseFloat(sensorData.temperature);
    const humidity = parseFloat(sensorData.humidity);
    
    // 根据温度确定天气状况
    let condition;
    if (temperature < 10) {
        condition = { code: 'cold', text: '寒冷', icon: '🥶' };
    } else if (temperature < 20) {
        condition = { code: 'cool', text: '凉爽', icon: '😊' };
    } else if (temperature < 30) {
        condition = { code: 'comfortable', text: '舒适', icon: '😌' };
    } else {
        condition = { code: 'hot', text: '炎热', icon: '🥵' };
    }
    
    return {
        location: {
            name: '农场监测点',
            region: '传感器数据',
            country: '真实环境'
        },
        current: {
            temp_c: temperature,
            condition: condition,
            humidity: humidity,
            feelslike_c: temperature + (humidity > 70 ? 2 : -1),
            wind_kph: 20, // 默认风速
            wind_degree: 45,
            wind_dir: '东北'
        },
        isRealData: true,
        timestamp: sensorData.timestamp
    };
}

/**
 * 显示代理服务器未运行的提示
 */
function showProxyServerNotice() {
    // 在天气区域显示提示信息
    const weatherMain = document.querySelector('.weather-main');
    if (weatherMain) {
        weatherMain.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 2em; margin-bottom: 10px;">⚠️</div>
                <div style="color: #ffc107; font-weight: bold; margin-bottom: 10px;">需要启动代理服务器</div>
                <div style="font-size: 0.9em; color: rgba(255,255,255,0.8);">
                    请运行: <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">node proxy-server.js</code>
                </div>
            </div>
        `;
    }
}

/**
 * 获取固定的北京天气数据
 * @returns {Object} 北京天气数据对象
 */
function getBeijingWeatherData() {
    // 获取当前日期和时间
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    // 根据季节设置合理的天气数据
    let temperature, condition, humidity, windSpeed;
    
    // 根据季节调整数据
    if (month >= 11 || month <= 1) { // 冬季 (12-2月)
        temperature = 2;
        condition = { code: 'sunny', text: '晴朗', icon: '☀️' };
        humidity = 35;
        windSpeed = 3;
    } else if (month >= 2 && month <= 4) { // 春季 (3-5月)
        temperature = 18;
        condition = { code: 'partly_cloudy', text: '多云', icon: '⛅' };
        humidity = 45;
        windSpeed = 4;
    } else if (month >= 5 && month <= 8) { // 夏季 (6-9月)
        temperature = 30;
        condition = { code: 'sunny', text: '晴朗', icon: '☀️' };
        humidity = 65;
        windSpeed = 2;
    } else { // 秋季 (10-11月)
        temperature = 15;
        condition = { code: 'cloudy', text: '阴天', icon: '☁️' };
        humidity = 50;
        windSpeed = 3;
    }
    
    // 构建天气数据对象
    return {
        location: {
            name: 'XX市', // 显示为XX市而不是北京市
            region: '某省',
            country: '中国'
        },
        current: {
            temp_c: temperature,
            condition: condition,
            humidity: humidity,
            feelslike_c: temperature + (temperature > 25 ? 2 : -2),
            wind_kph: windSpeed * 10,
            wind_degree: 45,
            wind_dir: '东北'
        }
    };
}

/**
 * 保存天气数据到本地存储
 * @param {Object} data - 天气数据
 */
function saveWeatherData(data) {
    localStorage.setItem(WEATHER_DATA_KEY, JSON.stringify(data));
}

/**
 * 从本地存储获取保存的天气数据
 * @returns {Object|null} 保存的天气数据或null
 */
function getSavedWeatherData() {
    const savedData = localStorage.getItem(WEATHER_DATA_KEY);
    return savedData ? JSON.parse(savedData) : null;
}

/**
 * 根据风向角度获取风向描述
 * @param {number} degree - 风向角度
 * @returns {string} 风向描述
 */
function getWindDirection(degree) {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    return directions[Math.round(degree / 45) % 8];
}

/**
 * 更新天气UI显示
 * @param {Object} data - 天气数据
 */
function updateWeatherUI(data) {
    if (!data || !data.current) return;
    
    // 更新温度 - 如果是真实数据显示2位小数
    const tempDisplay = data.isRealData ? 
        `${parseFloat(data.current.temp_c).toFixed(2)}°C` : 
        `${Math.round(data.current.temp_c)}°C`;
    document.querySelector('.temperature').textContent = tempDisplay;
    
    // 更新天气描述
    document.querySelector('.weather-desc').textContent = data.current.condition.text;
    
    // 更新天气图标
    document.querySelector('.weather-icon').textContent = data.current.condition.icon;
    
    // 更新位置 - 显示数据来源
    const locationText = data.isRealData ? 
        `🌡️ ${data.location.name} (真实数据)` : 
        `📍 ${data.location.name}`;
    document.querySelector('.weather-location').textContent = locationText;
    
    // 更新湿度 - 如果是真实数据显示2位小数
    const humidityDisplay = data.isRealData ? 
        `${parseFloat(data.current.humidity).toFixed(2)}%` : 
        `${data.current.humidity}%`;
    document.querySelector('.env-item:nth-child(1) .env-value').textContent = humidityDisplay;
    
    // 更新体感温度
    const feelsLikeDisplay = data.isRealData ? 
        `${parseFloat(data.current.feelslike_c).toFixed(2)}°C` : 
        `${Math.round(data.current.feelslike_c)}°C`;
    document.querySelector('.env-item:nth-child(2) .env-value').textContent = feelsLikeDisplay;
    
    // 更新风速
    const windLevel = Math.floor(data.current.wind_kph / 10);
    document.querySelector('.env-item:nth-child(3) .env-value').textContent = `${windLevel}级 ${data.current.wind_dir}风`;
    
    // 如果是真实数据，添加时间戳显示
    if (data.isRealData && data.timestamp) {
        addTimestampDisplay(data.timestamp);
    }
    
    // 更新农事建议
    updateFarmingAdvice(data);
}

/**
 * 添加时间戳显示
 * @param {string} timestamp - 时间戳
 */
function addTimestampDisplay(timestamp) {
    // 查找或创建时间戳显示元素
    let timestampElement = document.querySelector('.weather-timestamp');
    if (!timestampElement) {
        timestampElement = document.createElement('div');
        timestampElement.className = 'weather-timestamp';
        timestampElement.style.cssText = `
            font-size: 0.8em;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 5px;
            text-align: center;
        `;
        
        const weatherDetails = document.querySelector('.weather-details');
        if (weatherDetails) {
            weatherDetails.appendChild(timestampElement);
        }
    }
    
    timestampElement.textContent = `更新时间: ${timestamp}`;
}

/**
 * 根据天气数据更新农事建议
 * @param {Object} data - 天气数据
 */
function updateFarmingAdvice(data) {
    const temp = data.current.temp_c;
    const humidity = data.current.humidity;
    const windLevel = Math.floor(data.current.wind_kph / 10);
    const condition = data.current.condition.code;
    
    // 判断是否适宜耕种
    const statusIndicator = document.querySelector('.status-indicator');
    const statusIcon = document.querySelector('.status-icon');
    const statusText = document.querySelector('.status-text');
    
    let isSuitable = true;
    let adviceItems = [];
    
    // 根据温度判断
    if (temp < 5) {
        isSuitable = false;
        adviceItems.push('• 温度过低，不适宜大多数作物生长');
        adviceItems.push('• 建议做好防寒保暖措施');
    } else if (temp > 35) {
        isSuitable = false;
        adviceItems.push('• 温度过高，注意防暑降温');
        adviceItems.push('• 建议增加灌溉频次，避免中午高温作业');
    } else if (temp >= 15 && temp <= 25) {
        adviceItems.push('• 温度适宜，适合多种农事活动');
    }
    
    // 根据湿度判断
    if (humidity < 30) {
        adviceItems.push('• 湿度较低，注意增加灌溉');
    } else if (humidity > 80) {
        adviceItems.push('• 湿度较高，注意通风防霉');
    } else {
        adviceItems.push('• 湿度适宜，有利于作物生长');
    }
    
    // 根据风力判断
    if (windLevel > 5) {
        isSuitable = false;
        adviceItems.push('• 风力较大，不宜喷洒农药和化肥');
    } else {
        adviceItems.push('• 风力适宜，可进行常规田间管理');
    }
    
    // 根据天气状况判断
    if (condition === 'rain') {
        adviceItems.push('• 有雨，适宜进行室内农事活动');
        if (isSuitable) isSuitable = false;
    } else if (condition === 'snow') {
        adviceItems.push('• 有雪，注意农作物防冻保暖');
        isSuitable = false;
    } else if (condition === 'sunny') {
        adviceItems.push('• 阳光充足，适宜晾晒农产品');
    }
    
    // 更新UI
    if (isSuitable) {
        statusIndicator.className = 'status-indicator suitable';
        statusIcon.textContent = '✅';
        statusText.textContent = '适宜耕种';
    } else {
        statusIndicator.className = 'status-indicator unsuitable';
        statusIcon.textContent = '⚠️';
        statusText.textContent = '谨慎耕种';
    }
    
    // 限制建议数量为3条
    if (adviceItems.length > 3) {
        adviceItems = adviceItems.slice(0, 3);
    }
    
    // 更新建议内容
    const adviceContent = document.querySelector('.advice-content');
    adviceContent.innerHTML = adviceItems.map(item => `<div class="advice-item">${item}</div>`).join('');
}

/**
 * 显示备用天气数据（当API调用失败时）
 */
function showFallbackWeatherData() {
    const fallbackData = {
        location: {
            name: '某市',
            region: '某省',
            country: '中国'
        },
        current: {
            temp_c: 22,
            condition: {
                text: '晴朗',
                icon: '☀️',
                code: 'sunny'
            },
            humidity: 65,
            feelslike_c: 24,
            wind_kph: 30,
            wind_dir: '东北'
        }
    };
    
    updateWeatherUI(fallbackData);
}