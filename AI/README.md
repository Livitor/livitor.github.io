# 环境监测天气板块

基于JavaScript实现的温湿度数据获取和显示组件，用于集成到主页面的天气板块中。

## 功能特点

- ✅ 实时获取温度和湿度数据
- ✅ 自动定时更新（30秒间隔）
- ✅ 美观的现代化UI设计
- ✅ 响应式布局，支持移动端
- ✅ 错误处理和重连机制
- ✅ 手动刷新功能
- ✅ 连接状态指示

## 文件结构

```
├── js/
│   ├── weather-api.js      # API调用模块
│   └── weather-widget.js   # 天气组件模块
├── css/
│   └── weather-widget.css  # 组件样式
├── weather-demo.html       # 独立演示页面
├── integration-example.html # 集成示例页面
└── README.md               # 使用说明
```

## 快速开始

### 1. 基本使用

在HTML页面中引入必要的文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>天气监测</title>
    <link rel="stylesheet" href="css/weather-widget.css">
</head>
<body>
    <!-- 天气组件容器 -->
    <div id="weatherContainer"></div>

    <!-- 引入JavaScript文件 -->
    <script src="js/weather-api.js"></script>
    <script src="js/weather-widget.js"></script>
    
    <script>
        // 初始化天气组件
        document.addEventListener('DOMContentLoaded', function() {
            weatherWidget = new WeatherWidget('weatherContainer');
        });
    </script>
</body>
</html>
```

### 2. 集成到现有页面

如果您已有主页面，只需要：

1. 引入CSS和JS文件
2. 在需要显示天气信息的位置添加容器元素
3. 初始化组件

```html
<!-- 在页面head中添加样式 -->
<link rel="stylesheet" href="css/weather-widget.css">

<!-- 在需要显示天气的位置添加容器 -->
<div id="weatherContainer"></div>

<!-- 在页面底部添加脚本 -->
<script src="js/weather-api.js"></script>
<script src="js/weather-widget.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        weatherWidget = new WeatherWidget('weatherContainer');
    });
</script>
```

## API配置

如果需要修改API配置，请编辑 `js/weather-api.js` 文件中的配置项：

```javascript
class WeatherAPI {
    constructor() {
        this.baseURL = 'http://api.nlecloud.com';
        this.deviceId = '1309651';
        this.account = '18856933077';    // 修改为您的账号
        this.password = '123456';        // 修改为您的密码
        this.accessToken = null;
    }
}
```

## 自定义样式

您可以通过修改 `css/weather-widget.css` 来自定义组件外观，或者在您的CSS中覆盖样式：

```css
.weather-widget {
    /* 自定义背景色 */
    background: linear-gradient(135deg, #your-color1, #your-color2);
    
    /* 自定义尺寸 */
    max-width: 500px;
    
    /* 其他自定义样式 */
}
```

## 组件方法

### WeatherWidget 类方法

- `updateWeatherData()` - 手动更新天气数据
- `startAutoUpdate()` - 开始自动更新
- `stopAutoUpdate()` - 停止自动更新
- `destroy()` - 销毁组件，清理资源

### WeatherAPI 类方法

- `getAccessToken()` - 获取访问令牌
- `getTemperature()` - 获取温度数据
- `getHumidity()` - 获取湿度数据
- `getWeatherData()` - 同时获取温度和湿度

## 错误处理

组件内置了完善的错误处理机制：

- 网络连接失败时会显示错误状态
- Token过期时会自动重新获取
- 数据获取失败时会显示 "--" 占位符
- 所有错误都会在控制台输出详细信息

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

1. **跨域问题**：如果遇到跨域问题，需要在服务器端配置CORS或使用代理
2. **HTTPS**：在HTTPS页面中调用HTTP API可能被浏览器阻止
3. **API限制**：注意API的调用频率限制，避免过于频繁的请求
4. **凭据安全**：在生产环境中，建议将API凭据存储在服务器端

## 演示页面

- `weather-demo.html` - 独立的天气组件演示
- `integration-example.html` - 集成到主页面的示例

直接在浏览器中打开这些HTML文件即可查看效果。

## 技术支持

如有问题或建议，请联系开发团队。