@echo off
echo 启动Chrome浏览器（禁用CORS安全检查）
echo 这将允许直接访问外部API
echo.

REM 创建临时用户数据目录
if not exist "C:\temp\chrome-no-cors" mkdir "C:\temp\chrome-no-cors"

REM 启动Chrome并禁用CORS
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome-no-cors" --disable-features=VizDisplayCompositor http://localhost:8080/weather-real-api.html

echo Chrome已启动，请在新窗口中查看真实数据
pause