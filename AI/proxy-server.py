#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的代理服务器，用于解决CORS跨域问题
运行方式: python proxy-server.py
"""

import json
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """处理预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """处理GET请求"""
        if self.path.startswith('/api/proxy'):
            self.handle_proxy_request()
        else:
            self.serve_static_file()

    def do_POST(self):
        """处理POST请求"""
        if self.path.startswith('/api/proxy'):
            self.handle_proxy_request()
        else:
            self.send_error(404)

    def handle_proxy_request(self):
        """处理代理请求"""
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
            else:
                request_data = {}

            # 提取目标URL和参数
            target_url = request_data.get('url', '')
            method = request_data.get('method', 'GET')
            data = request_data.get('data', {})

            print(f"代理请求: {method} {target_url}")

            # 发送请求到目标API
            if method.upper() == 'POST':
                response = requests.post(target_url, data=data, timeout=10)
            else:
                response = requests.get(target_url, params=data, timeout=10)

            # 返回响应
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(response.content)

        except Exception as e:
            print(f"代理请求错误: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = json.dumps({
                'error': str(e),
                'message': '代理请求失败'
            }, ensure_ascii=False)
            self.wfile.write(error_response.encode('utf-8'))

    def serve_static_file(self):
        """提供静态文件服务"""
        try:
            # 简单的静态文件服务
            if self.path == '/':
                self.path = '/weather-demo.html'
            
            file_path = '.' + self.path
            
            # 确定文件类型
            if file_path.endswith('.html'):
                content_type = 'text/html; charset=utf-8'
            elif file_path.endswith('.js'):
                content_type = 'application/javascript; charset=utf-8'
            elif file_path.endswith('.css'):
                content_type = 'text/css; charset=utf-8'
            else:
                content_type = 'text/plain; charset=utf-8'

            # 读取文件
            with open(file_path, 'rb') as f:
                content = f.read()

            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)

        except FileNotFoundError:
            self.send_error(404)
        except Exception as e:
            print(f"文件服务错误: {e}")
            self.send_error(500)

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_server(port=8090):
    """运行代理服务器"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, ProxyHandler)
    print(f"代理服务器启动在端口 {port}")
    print(f"访问地址: http://localhost:{port}")
    print("按 Ctrl+C 停止服务器")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n正在停止服务器...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()