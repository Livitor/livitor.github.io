@echo off
echo 启动简单HTTP服务器测试页面加载...
echo 请在浏览器中访问: http://localhost:8000/debug-page.html
echo 按 Ctrl+C 停止服务器
python -m http.server 8000