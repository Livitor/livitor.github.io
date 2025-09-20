/**
 * 穗安精灵 - AI助手功能
 * 在主页面右下角创建一个小按钮，点击后打开悬浮窗与AI进行对话
 */

class SuianAssistant {
    constructor() {
        this.isOpen = false;
        this.apiKey = '';
        this.apiEndpoint = '';
        this.model = '';
        this.messages = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        // 创建按钮和悬浮窗
        this.createElements();
        // 绑定事件
        this.bindEvents();
        // 从设置中获取API配置
        this.loadApiSettings();
    }

    createElements() {
        // 创建按钮
        const button = document.createElement('div');
        button.className = 'suian-assistant-btn';
        button.innerHTML = '<i class="fas fa-robot"></i>';
        button.title = '穗安精灵';
        document.body.appendChild(button);
        this.button = button;

        // 创建悬浮窗
        const window = document.createElement('div');
        window.className = 'suian-assistant-window';
        window.innerHTML = `
            <div class="suian-assistant-header">
                <div class="suian-assistant-title">穗安精灵</div>
                <div class="suian-assistant-close">&times;</div>
            </div>
            <div class="suian-assistant-body">
                <div class="suian-assistant-messages"></div>
            </div>
            <div class="suian-assistant-input">
                <input type="text" placeholder="请输入您的问题..." />
                <button><i class="fas fa-paper-plane"></i></button>
            </div>
        `;
        document.body.appendChild(window);
        this.window = window;
        this.messagesContainer = window.querySelector('.suian-assistant-messages');
        this.input = window.querySelector('input');
        this.sendButton = window.querySelector('button');
    }

    bindEvents() {
        // 点击按钮打开/关闭悬浮窗
        this.button.addEventListener('click', () => {
            this.toggleWindow();
        });

        // 点击关闭按钮关闭悬浮窗
        this.window.querySelector('.suian-assistant-close').addEventListener('click', () => {
            this.closeWindow();
        });

        // 发送消息
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // 按回车键发送消息
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    loadApiSettings() {
        // 从configManager获取API配置
        if (window.configManager) {
            const config = window.configManager.getConfig();
            this.apiKey = config.apiKey || '';
            this.apiEndpoint = config.apiEndpoint || '';
            this.model = config.model || 'qwen-turbo';
        }
    }

    toggleWindow() {
        if (this.isOpen) {
            this.closeWindow();
        } else {
            this.openWindow();
        }
    }

    openWindow() {
        this.window.style.display = 'flex';
        this.isOpen = true;
        this.input.focus();
        
        // 如果是第一次打开，显示欢迎消息
        if (this.messages.length === 0) {
            this.addMessage('您好，我是穗安精灵，有什么可以帮您的吗？', 'ai');
        }
    }

    closeWindow() {
        this.window.style.display = 'none';
        this.isOpen = false;
    }

    sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isProcessing) return;

        // 添加用户消息到对话
        this.addMessage(message, 'user');
        
        // 清空输入框
        this.input.value = '';
        
        // 检查API配置
        if (!this.apiKey || !this.apiEndpoint) {
            this.addMessage('请先在设置中配置API密钥和端点。', 'ai');
            return;
        }
        
        // 发送请求到AI
        this.callAI(message);
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        // 如果是AI消息，解析Markdown格式
        if (type === 'ai') {
            messageDiv.innerHTML = this.parseMarkdown(content);
        } else {
            messageDiv.textContent = content;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        
        // 保存消息
        this.messages.push({ content, type });
        
        // 滚动到底部
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    // 格式化API响应 - 解决格式混乱和中英文混合问题
    formatApiResponse(response) {
        if (!response) return '';
        
        // 清理响应内容，但保持Markdown格式
        let cleanedResponse = response.trim();
        
        // 移除多余的空行，但保留双换行用于段落分隔
        cleanedResponse = cleanedResponse.replace(/\n{3,}/g, '\n\n');
        
        // 保持技术术语和代码中的英文标点符号
        // 不进行全局标点符号替换，保持原有格式
        
        return cleanedResponse;
    }
    
    // 解析Markdown格式 - 完整支持各种Markdown语法并正确显示效果，优化间隔和缩进
    parseMarkdown(text) {
        if (!text) return '';
        
        // 先进行基本格式化
        text = this.formatApiResponse(text);
        
        // 转义HTML特殊字符（但保留我们要处理的Markdown语法）
        let processedText = text;
        
        // 1. 优先处理代码块（三个反引号）- 避免内部内容被其他规则影响
        const codeBlocks = [];
        processedText = processedText.replace(/```(\w+)?\n?([\s\S]*?)```/g, function(match, lang, code) {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0; overflow-x: auto;"><code class="language-${lang || 'text'}">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
            return placeholder;
        });
        
        // 2. 处理行内代码（单个反引号）
        const inlineCodes = [];
        processedText = processedText.replace(/`([^`\n]+)`/g, function(match, code) {
            const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
            inlineCodes.push(`<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace;">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`);
            return placeholder;
        });
        
        // 3. 转义剩余的HTML字符
        processedText = processedText.replace(/&/g, '&amp;');
        processedText = processedText.replace(/</g, '&lt;');
        processedText = processedText.replace(/>/g, '&gt;');
        
        // 4. 解析标题（从六级到一级，避免嵌套问题）
        processedText = processedText.replace(/^###### (.*$)/gim, '<h6 style="margin: 12px 0 8px 0; font-size: 1em; font-weight: bold;">$1</h6>');
        processedText = processedText.replace(/^##### (.*$)/gim, '<h5 style="margin: 14px 0 8px 0; font-size: 1.1em; font-weight: bold;">$1</h5>');
        processedText = processedText.replace(/^#### (.*$)/gim, '<h4 style="margin: 16px 0 8px 0; font-size: 1.2em; font-weight: bold;">$1</h4>');
        processedText = processedText.replace(/^### (.*$)/gim, '<h3 style="margin: 18px 0 10px 0; font-size: 1.3em; font-weight: bold;">$1</h3>');
        processedText = processedText.replace(/^## (.*$)/gim, '<h2 style="margin: 20px 0 10px 0; font-size: 1.4em; font-weight: bold;">$1</h2>');
        processedText = processedText.replace(/^# (.*$)/gim, '<h1 style="margin: 22px 0 12px 0; font-size: 1.5em; font-weight: bold;">$1</h1>');
        
        // 5. 解析粗体和斜体（注意顺序，先处理粗斜体）
        processedText = processedText.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>'); // 粗斜体
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // 粗体
        processedText = processedText.replace(/\*([^*\n]+)\*/g, '<em>$1</em>'); // 斜体
        
        // 6. 解析删除线
        processedText = processedText.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // 7. 解析链接
        processedText = processedText.replace(/\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">$1</a>');
        
        // 8. 解析图片
        processedText = processedText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;">');
        
        // 9. 解析引用块
        processedText = processedText.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left: 4px solid #ddd; margin: 10px 0; padding: 8px 16px; background: #f9f9f9; font-style: italic;">$1</blockquote>');
        
        // 10. 解析水平分割线
        processedText = processedText.replace(/^[\s]*[-\*_]{3,}[\s]*$/gm, '<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">');
        
        // 11. 解析列表 - 改进间隔和缩进处理
        // 先标记列表项，保留缩进信息
        processedText = processedText.replace(/^([\s]*)([-\*\+]) (.+)$/gm, function(match, indent, marker, content) {
            const level = Math.floor(indent.length / 2); // 每2个空格为一级缩进
            return `__UL_ITEM_${level}__${content}`;
        });
        processedText = processedText.replace(/^([\s]*)(\d+)\. (.+)$/gm, function(match, indent, num, content) {
            const level = Math.floor(indent.length / 2);
            return `__OL_ITEM_${level}__${content}`;
        });
        
        // 12. 处理表格（简单表格支持）
        processedText = processedText.replace(/\|(.+)\|\n\|[-\s\|]+\|\n((?:\|.+\|\n?)*)/g, function(match, header, rows) {
            let headerCells = header.split('|').map(cell => `<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">${cell.trim()}</th>`).join('');
            let rowsHtml = rows.split('\n').filter(row => row.trim()).map(row => {
                let cells = row.split('|').filter(cell => cell.trim()).map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell.trim()}</td>`).join('');
                return cells ? `<tr>${cells}</tr>` : '';
            }).filter(row => row).join('');
            return `<table style="border-collapse: collapse; width: 100%; margin: 15px 0;"><thead><tr>${headerCells}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
        });
        
        // 13. 处理段落和换行
        let paragraphs = processedText.split(/\n\s*\n/);
        processedText = paragraphs.map(paragraph => {
            paragraph = paragraph.trim();
            if (!paragraph) return '';
            
            // 处理列表项 - 改进的列表处理逻辑，支持正确的间隔和缩进
            if (paragraph.includes('__UL_ITEM_') || paragraph.includes('__OL_ITEM_')) {
                let listItems = paragraph.split('\n');
                let result = '';
                let listStack = []; // 用于处理嵌套列表
                
                for (let item of listItems) {
                    // 处理无序列表项
                    const ulMatch = item.match(/^__UL_ITEM_(\d+)__(.+)$/);
                    if (ulMatch) {
                        const level = parseInt(ulMatch[1]);
                        const content = ulMatch[2];
                        
                        // 处理嵌套层级
                        while (listStack.length > level) {
                            const closedList = listStack.pop();
                            result += `</${closedList.type}>`;
                        }
                        
                        if (listStack.length === level) {
                            // 同级列表，直接添加项目
                        } else {
                            // 新的嵌套级别
                            result += `<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">`;
                            listStack.push({ type: 'ul', level: level });
                        }
                        
                        result += `<li style="margin: 6px 0; line-height: 1.6; padding: 2px 0;">${content}</li>`;
                        continue;
                    }
                    
                    // 处理有序列表项
                    const olMatch = item.match(/^__OL_ITEM_(\d+)__(.+)$/);
                    if (olMatch) {
                        const level = parseInt(olMatch[1]);
                        const content = olMatch[2];
                        
                        // 处理嵌套层级
                        while (listStack.length > level) {
                            const closedList = listStack.pop();
                            result += `</${closedList.type}>`;
                        }
                        
                        if (listStack.length === level) {
                            // 同级列表，直接添加项目
                        } else {
                            // 新的嵌套级别
                            result += `<ol style="margin: 8px 0; padding-left: 20px;">`;
                            listStack.push({ type: 'ol', level: level });
                        }
                        
                        result += `<li style="margin: 6px 0; line-height: 1.6; padding: 2px 0;">${content}</li>`;
                        continue;
                    }
                    
                    // 非列表项
                    if (item.trim()) {
                        // 关闭所有打开的列表
                        while (listStack.length > 0) {
                            const closedList = listStack.pop();
                            result += `</${closedList.type}>`;
                        }
                        result += `<p style="margin: 12px 0; line-height: 1.6;">${item.replace(/\n/g, '<br>')}</p>`;
                    }
                }
                
                // 关闭剩余的列表
                while (listStack.length > 0) {
                    const closedList = listStack.pop();
                    result += `</${closedList.type}>`;
                }
                
                return result;
            }
            
            // 如果已经是HTML标签，不要包装在p标签中
            if (paragraph.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|table|hr|div)/)) {
                return paragraph;
            }
            
            // 将单个换行转换为<br>
            paragraph = paragraph.replace(/\n/g, '<br>');
            
            return `<p style="margin: 12px 0; line-height: 1.6;">${paragraph}</p>`;
        }).filter(p => p).join('\n');
        
        // 14. 恢复代码块和行内代码
        codeBlocks.forEach((code, index) => {
            processedText = processedText.replace(`__CODE_BLOCK_${index}__`, code);
        });
        
        inlineCodes.forEach((code, index) => {
            processedText = processedText.replace(`__INLINE_CODE_${index}__`, code);
        });
        
        // 15. 清理多余的空白
        processedText = processedText.replace(/\n{3,}/g, '\n\n');
        processedText = processedText.trim();
        
        return processedText;
    }

    async callAI(message) {
        this.isProcessing = true;
        
        // 显示加载中
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.innerHTML = '思考中<span class="loading-dots"></span>';
        this.messagesContainer.appendChild(loadingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        try {
            // 构建请求数据 - 明确指定中文响应和格式要求
            const requestData = {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: '你是穗安精灵，一个友好、专业的AI助手，专注于农业领域的问题解答。请用简体中文回答，使用Markdown格式来组织内容，包括：\n- 使用 # ## ### 等标题来组织结构\n- 使用 **粗体** 和 *斜体* 来强调重点\n- 使用 - 或 1. 来创建列表\n- 使用 `代码` 来标记专业术语\n- 使用 ```代码块``` 来展示代码或配置\n回答要结构化、层次清晰，避免中英文混合。'
                    },
                    ...this.messages
                        .filter(msg => msg.type === 'user' || msg.type === 'ai')
                        .slice(-10) // 只保留最近10条消息，避免上下文过长
                        .map(msg => ({
                            role: msg.type === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500,
                stream: false
            };
            
            // 发送请求
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 检查响应格式
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API响应格式错误');
            }
            
            const aiResponse = data.choices[0].message.content;
            
            // 移除加载消息
            this.messagesContainer.removeChild(loadingDiv);
            
            // 添加AI回复
            this.addMessage(aiResponse, 'ai');
            
        } catch (error) {
            console.error('AI调用失败:', error);
            
            // 移除加载消息
            if (loadingDiv.parentNode) {
                this.messagesContainer.removeChild(loadingDiv);
            }
            
            // 根据错误类型显示不同的错误消息
            let errorMessage = '抱歉，发生了错误。';
            if (error.message.includes('401')) {
                errorMessage = '抱歉，API密钥无效，请检查设置。';
            } else if (error.message.includes('429')) {
                errorMessage = '抱歉，请求过于频繁，请稍后再试。';
            } else if (error.message.includes('500')) {
                errorMessage = '抱歉，服务器暂时无法响应，请稍后再试。';
            } else if (error.message.includes('网络')) {
                errorMessage = '抱歉，网络连接出现问题，请检查网络设置。';
            }
            
            this.addMessage(errorMessage, 'ai');
        } finally {
            this.isProcessing = false;
        }
    }
}

// 页面加载完成后初始化穗安精灵
document.addEventListener('DOMContentLoaded', () => {
    console.log('开始初始化穗安精灵...');
    // 延迟初始化，确保其他组件已加载
    setTimeout(() => {
        try {
            window.suianAssistant = new SuianAssistant();
            console.log('穗安精灵初始化成功');
        } catch (error) {
            console.error('穗安精灵初始化失败:', error);
        }
    }, 500);
});