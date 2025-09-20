# CORS跨域问题解决方案

## 问题说明

在浏览器中直接访问外部API时，会遇到CORS（跨域资源共享）错误：
```
Access to fetch at 'http://api.nlecloud.com/users/login' from origin 'http://localhost:8080' has been blocked by CORS policy
```

## 解决方案

### 方案1：使用模拟数据（推荐用于演示）

我已经创建了带有模拟数据功能的版本：

**文件：** `js/weather-api-proxy.js`
- 自动生成真实的温湿度数据
- 数据会随时间变化，模拟真实环境
- 无需网络连接，完全本地运行

**演示页面：** `weather-demo-with-proxy.html`
- 可以切换模拟数据和真实API
- 默认使用模拟数据，避免CORS问题

### 方案2：使用代理服务器

**文件：** `proxy-server.py`

运行代理服务器：
```bash
python proxy-server.py
```

然后访问：http://localhost:8081

### 方案3：生产环境解决方案

在实际部署时，可以通过以下方式解决：

1. **后端代理**：在您的后端服务器上创建API代理
2. **NGINX代理**：使用NGINX反向代理
3. **服务器端渲染**：在服务器端获取数据后传递给前端

## 当前演示效果

访问 http://localhost:8080/weather-demo-with-proxy.html 可以看到：

✅ **模拟数据模式**（默认）
- 温度：18-35°C 范围内变化
- 湿度：30-80% 范围内变化
- 数据每30秒自动更新
- 显示"(模拟数据)"标识

✅ **真实API模式**
- 尝试连接真实API
- 如果失败会自动降级到模拟数据
- 显示"(真实数据)"或"(模拟数据)"标识

## 集成到现有项目

只需要替换API文件：
```html
<!-- 将原来的 weather-api.js 替换为 -->
<script src="js/weather-api-proxy.js"></script>
```

其他文件无需修改，组件会自动使用模拟数据。