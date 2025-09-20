@echo off
echo 启动Node.js代理服务器
echo 这将创建一个代理服务器来获取真实的传感器数据
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js已安装，正在启动代理服务器...
echo.
echo 服务器将在 http://localhost:3000 启动
echo 按 Ctrl+C 停止服务器
echo.

node proxy-server.js

pause