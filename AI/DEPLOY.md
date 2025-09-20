# 🚀 穗安巡视官 PWA 部署指南

## 📋 部署前准备

### 1. 生成图标文件

1. 打开 `generate-icons.html` 文件
2. 上传一张高质量的图片（建议 512x512 或更高分辨率）
3. 下载所有生成的图标文件
4. 在项目根目录创建 `icons/` 文件夹
5. 将所有图标文件放入 `icons/` 文件夹

### 2. 创建截图文件

1. 在项目根目录创建 `screenshots/` 文件夹
2. 添加桌面端截图：`screenshots/desktop.png` (1280x720)
3. 添加移动端截图：`screenshots/mobile.png` (390x844)

## 🌐 部署到服务器

### 方案一：GitHub Pages（免费）

1. **创建 GitHub 仓库**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/sui-an-inspector.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**

   - 进入仓库设置 → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"
   - 保存设置

3. **访问地址**
   - 您的 PWA 将在 `https://yourusername.github.io/sui-an-inspector` 上线

### 方案二：Netlify（免费）

1. **注册 Netlify 账号**

   - 访问 https://netlify.com
   - 使用 GitHub 账号登录

2. **部署项目**

   - 点击 "New site from Git"
   - 选择 GitHub 仓库
   - 构建命令留空
   - 发布目录设置为根目录
   - 点击 "Deploy site"

3. **自定义域名**
   - 在站点设置中可以添加自定义域名

### 方案三：Vercel（免费）

1. **注册 Vercel 账号**

   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择 GitHub 仓库
   - 保持默认设置
   - 点击 "Deploy"

## 📱 安装为 APP

### Android 用户

1. 使用 Chrome 浏览器访问您的 PWA
2. 点击地址栏右侧的"安装"按钮
3. 或点击菜单中的"添加到主屏幕"
4. 确认安装

### iOS 用户

1. 使用 Safari 浏览器访问您的 PWA
2. 点击底部的"分享"按钮
3. 选择"添加到主屏幕"
4. 确认添加

### 桌面用户

1. 使用 Chrome/Edge 浏览器访问您的 PWA
2. 点击地址栏右侧的"安装"按钮
3. 确认安装

## 🔧 服务器配置

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/sui-an-inspector;
    index index.html;

    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # PWA相关MIME类型
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker缓存
    location = /sw.js {
        add_header Cache-Control "no-cache";
        expires 0;
    }

    # Manifest文件
    location = /manifest.json {
        add_header Cache-Control "no-cache";
        expires 0;
    }

    # 单页应用路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache 配置示例

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/sui-an-inspector

    # 启用压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
    </IfModule>

    # 缓存设置
    <IfModule mod_expires.c>
        ExpiresActive on
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/ico "access plus 1 year"
        ExpiresByType image/icon "access plus 1 year"
        ExpiresByType text/plain "access plus 1 month"
        ExpiresByType application/x-shockwave-flash "access plus 1 month"
        ExpiresByType text/html "access plus 1 month"
    </IfModule>

    # 单页应用路由
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</VirtualHost>
```

## 🔍 测试检查清单

### PWA 功能测试

- [ ] 应用可以正常安装
- [ ] 离线功能正常工作
- [ ] 推送通知功能正常
- [ ] 应用图标显示正确
- [ ] 启动画面显示正常
- [ ] 主题色设置正确

### 性能测试

- [ ] 首次加载时间 < 3 秒
- [ ] 离线加载时间 < 1 秒
- [ ] 图片加载正常
- [ ] 语音识别功能正常
- [ ] 文件上传功能正常

### 兼容性测试

- [ ] Chrome 浏览器
- [ ] Firefox 浏览器
- [ ] Safari 浏览器
- [ ] Edge 浏览器
- [ ] 移动端 Chrome
- [ ] 移动端 Safari

## 📊 性能优化建议

### 1. 图片优化

- 使用 WebP 格式图片
- 压缩图片文件大小
- 使用适当的图片尺寸

### 2. 代码优化

- 启用 gzip 压缩
- 使用 CDN 加速
- 优化 JavaScript 代码

### 3. 缓存策略

- 合理设置缓存时间
- 使用 Service Worker 缓存
- 实现增量更新

## 🛠️ 故障排除

### 常见问题

1. **PWA 无法安装**

   - 检查 HTTPS 协议
   - 验证 manifest.json 格式
   - 确认 Service Worker 注册

2. **图标不显示**

   - 检查图标文件路径
   - 验证图标文件格式
   - 确认图标尺寸正确

3. **离线功能异常**
   - 检查 Service Worker 缓存
   - 验证网络请求拦截
   - 确认缓存策略设置

### 调试工具

- Chrome DevTools → Application → Manifest
- Chrome DevTools → Application → Service Workers
- Lighthouse PWA 审计
- WebPageTest 性能测试

## 📞 技术支持

如果遇到部署问题，请检查：

1. 服务器配置是否正确
2. 文件路径是否正确
3. HTTPS 证书是否有效
4. 浏览器控制台是否有错误

---

**祝您部署顺利！** 🎉
