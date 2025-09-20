const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// 配置
const PORT = 3000;
const API_BASE = 'http://api.nlecloud.com';
const DEVICE_ID = '1308584'; // 1309651
// const DEVICE_ID = '1309651'; // 1309651

const ACCOUNT = '15855873931'; // 18856933077
// const ACCOUNT = '18856933077'; // 18856933077

const PASSWORD = '123456789'; // 123456
// const PASSWORD = '123456'; // 123456

let accessToken = null;
let tokenExpiry = null;

// 获取访问令牌
async function getAccessToken() {
    return new Promise((resolve, reject) => {
        // 检查token是否还有效
        if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
            resolve(accessToken);
            return;
        }

        const postData = querystring.stringify({
            Account: ACCOUNT,
            password: PASSWORD
        });

        const options = {
            hostname: 'api.nlecloud.com',
            port: 80,
            path: '/users/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.ResultObj && result.ResultObj.AccessToken) {
                        accessToken = result.ResultObj.AccessToken;
                        tokenExpiry = Date.now() + (60 * 60 * 1000); // 1小时后过期
                        console.log('获取访问令牌成功');
                        resolve(accessToken);
                    } else {
                        reject(new Error('获取访问令牌失败: ' + (result.Message || '未知错误')));
                    }
                } catch (error) {
                    reject(new Error('解析登录响应失败: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error('登录请求失败: ' + error.message));
        });

        req.write(postData);
        req.end();
    });
}

// 获取传感器数据
async function getSensorData(apiTag) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!accessToken) {
                await getAccessToken();
            }

            const requestPath = `/devices/${DEVICE_ID}/Sensors?apiTags=${apiTag}&AccessToken=${accessToken}`;
            
            const options = {
                hostname: 'api.nlecloud.com',
                port: 80,
                path: requestPath,
                method: 'GET'
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.ResultObj && result.ResultObj.length > 0) {
                            resolve(parseFloat(result.ResultObj[0].Value));
                        } else {
                            reject(new Error(`获取${apiTag}数据失败`));
                        }
                    } catch (error) {
                        reject(new Error(`解析${apiTag}数据失败: ` + error.message));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`请求${apiTag}数据失败: ` + error.message));
            });

            req.end();
        } catch (error) {
            reject(error);
        }
    });
}

// 获取文件MIME类型
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'text/plain';
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API路由
    if (pathname === '/api/weather') {
        try {
            console.log('获取天气数据请求...');
            
            // 并行获取温度和湿度数据
            const [temperature, humidity] = await Promise.all([
                // getSensorData('temp'),
                getSensorData('env_temp'),

                // getSensorData('shi_du')
                getSensorData('env_hum')
            ]);

            const weatherData = {
                temperature: temperature,
                humidity: humidity,
                timestamp: new Date().toLocaleString('zh-CN'),
                success: true
            };

            console.log('天气数据获取成功:', weatherData);

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(weatherData));
        } catch (error) {
            console.error('获取天气数据失败:', error.message);
            
            const errorData = {
                temperature: '--',
                humidity: '--',
                timestamp: new Date().toLocaleString('zh-CN'),
                success: false,
                error: error.message
            };

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(errorData));
        }
        return;
    }

    // 静态文件服务
    let filePath = pathname === '/' ? '/weather-node-proxy.html' : pathname;
    filePath = path.join(__dirname, filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        const mimeType = getMimeType(filePath);
        res.writeHead(200, { 'Content-Type': mimeType + '; charset=utf-8' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`代理服务器启动成功！`);
    console.log(`访问地址: http://localhost:${PORT}`);
    console.log(`API地址: http://localhost:${PORT}/api/weather`);
    console.log('按 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});