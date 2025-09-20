/**
 * 帮助中心页面功能模块
 */
class HelpManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initSections();
    }

    bindEvents() {
        // 导航卡片点击
        document.querySelectorAll('.nav-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.scrollToSection(section);
            });
        });

        // FAQ 问题展开/收起
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', (e) => {
                const toggle = e.currentTarget.dataset.toggle;
                this.toggleFAQ(toggle);
            });
        });

        // 在线客服
        const onlineChat = document.getElementById('onlineChat');
        if (onlineChat) {
            onlineChat.addEventListener('click', this.startOnlineChat.bind(this));
        }

        // 反馈表单
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', this.submitFeedback.bind(this));
        }

        // 搜索功能
        this.initSearch();
    }

    initSections() {
        // 为每个帮助部分添加锚点
        const sections = document.querySelectorAll('.help-section');
        sections.forEach(section => {
            const id = section.id;
            if (id) {
                // 添加返回顶部按钮
                const backToTop = document.createElement('button');
                backToTop.className = 'back-to-top';
                backToTop.innerHTML = '<i class="fas fa-arrow-up"></i> 返回顶部';
                backToTop.addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                section.appendChild(backToTop);
            }
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // 高亮显示目标部分
            section.classList.add('highlight');
            setTimeout(() => {
                section.classList.remove('highlight');
            }, 2000);
        }
    }

    toggleFAQ(faqId) {
        const question = document.querySelector(`[data-toggle="${faqId}"]`);
        const answer = document.getElementById(faqId);
        const icon = question.querySelector('i');

        if (answer.style.display === 'block') {
            answer.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            question.classList.remove('active');
        } else {
            // 关闭其他已打开的FAQ
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.style.display = 'none';
            });
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                const i = q.querySelector('i');
                i.classList.remove('fa-chevron-up');
                i.classList.add('fa-chevron-down');
            });

            // 打开当前FAQ
            answer.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            question.classList.add('active');
        }
    }

    startOnlineChat() {
        // 模拟在线客服功能
        const chatWindow = this.createChatWindow();
        document.body.appendChild(chatWindow);
        
        // 模拟客服响应
        setTimeout(() => {
            this.addChatMessage('客服小助手', '您好！我是穗安巡视官智能客服，有什么可以帮助您的吗？', 'bot');
        }, 1000);
    }

    createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chat-window';
        chatWindow.innerHTML = `
            <div class="chat-header">
                <h3><i class="fas fa-headset"></i> 在线客服</h3>
                <button class="chat-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="chat-message bot">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">正在连接客服...</div>
                        <div class="message-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="chatInput" placeholder="请输入您的问题...">
                <button id="sendMessage">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        // 绑定发送消息事件
        const sendBtn = chatWindow.querySelector('#sendMessage');
        const input = chatWindow.querySelector('#chatInput');
        
        sendBtn.addEventListener('click', () => this.sendChatMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        return chatWindow;
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            this.addChatMessage('您', message, 'user');
            input.value = '';
            
            // 模拟客服回复
            setTimeout(() => {
                const reply = this.generateBotReply(message);
                this.addChatMessage('客服小助手', reply, 'bot');
            }, 1000);
        }
    }

    addChatMessage(sender, message, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${type === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateBotReply(userMessage) {
        const message = userMessage.toLowerCase();
        
        if (message.includes('使用') || message.includes('怎么')) {
            return '您可以查看我们的快速开始指南，里面有详细的使用步骤。如果您有具体问题，请详细描述一下。';
        } else if (message.includes('准确') || message.includes('识别')) {
            return '我们的系统平均准确率达到90%以上。为了提高识别准确率，建议您上传清晰的高分辨率图片，并详细描述症状。';
        } else if (message.includes('收费') || message.includes('价格')) {
            return '基础功能完全免费使用，包括图片识别和基本诊断。高级功能和专业版服务需要付费，具体价格请联系我们的销售团队。';
        } else if (message.includes('支持') || message.includes('作物')) {
            return '目前支持水稻、小麦、玉米、大豆、棉花等主要作物，以及各种蔬菜和果树。我们会持续扩展支持的作物种类。';
        } else {
            return '感谢您的咨询！如果您需要更详细的帮助，建议您查看帮助文档或联系我们的技术支持团队。';
        }
    }

    submitFeedback(e) {
        e.preventDefault();
        
        const formData = {
            type: document.getElementById('feedbackType').value,
            title: document.getElementById('feedbackTitle').value,
            content: document.getElementById('feedbackContent').value,
            contact: document.getElementById('feedbackContact').value
        };

        if (!formData.type || !formData.title || !formData.content) {
            this.showNotification('请填写完整的反馈信息', 'warning');
            return;
        }

        // 模拟提交反馈
        this.showNotification('正在提交反馈...', 'info');
        
        setTimeout(() => {
            // 保存到本地存储
            const feedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
            feedbacks.push({
                ...formData,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                status: '已提交'
            });
            localStorage.setItem('userFeedbacks', JSON.stringify(feedbacks));
            
            // 清空表单
            document.getElementById('feedbackForm').reset();
            
            this.showNotification('反馈提交成功！我们会尽快处理您的反馈。', 'success');
        }, 1500);
    }

    initSearch() {
        // 创建搜索框
        const searchContainer = document.createElement('div');
        searchContainer.className = 'help-search';
        searchContainer.innerHTML = `
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="helpSearch" placeholder="搜索帮助内容...">
                <button id="clearSearch" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-results" id="searchResults" style="display: none;"></div>
        `;
        
        // 插入到页面顶部
        const header = document.querySelector('.header');
        header.appendChild(searchContainer);
        
        // 绑定搜索事件
        const searchInput = document.getElementById('helpSearch');
        const clearBtn = document.getElementById('clearSearch');
        const resultsContainer = document.getElementById('searchResults');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                this.performSearch(query);
                clearBtn.style.display = 'block';
            } else {
                resultsContainer.style.display = 'none';
                clearBtn.style.display = 'none';
            }
        });
        
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            resultsContainer.style.display = 'none';
            clearBtn.style.display = 'none';
        });
    }

    performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        const searchableElements = document.querySelectorAll('h2, h3, h4, p, li');
        const results = [];
        
        searchableElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                const section = element.closest('.help-section');
                if (section) {
                    results.push({
                        element: element,
                        section: section,
                        text: element.textContent,
                        sectionTitle: section.querySelector('h2').textContent
                    });
                }
            }
        });
        
        if (results.length > 0) {
            resultsContainer.innerHTML = results.slice(0, 5).map(result => `
                <div class="search-result-item" onclick="helpManager.scrollToElement('${result.element.tagName}', '${result.text.substring(0, 50)}')">
                    <div class="result-section">${result.sectionTitle}</div>
                    <div class="result-text">${this.highlightText(result.text, query)}</div>
                </div>
            `).join('');
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.innerHTML = '<div class="no-results">未找到相关内容</div>';
            resultsContainer.style.display = 'block';
        }
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    scrollToElement(tagName, textContent) {
        const elements = document.querySelectorAll(tagName);
        const target = Array.from(elements).find(el => 
            el.textContent.includes(textContent.substring(0, 50))
        );
        
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.add('highlight');
            setTimeout(() => {
                target.classList.remove('highlight');
            }, 2000);
        }
        
        // 隐藏搜索结果
        document.getElementById('searchResults').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                ${message}
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// 初始化帮助管理器
const helpManager = new HelpManager();

// 添加一些CSS样式
const helpStyles = `
<style>
.help-search {
    margin-top: 20px;
    position: relative;
}

.help-search .search-box {
    position: relative;
    max-width: 500px;
    margin: 0 auto;
}

.help-search .search-box input {
    width: 100%;
    padding: 12px 40px 12px 40px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 14px;
    backdrop-filter: blur(10px);
}

.help-search .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.7);
}

.help-search .search-box i {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.7);
}

.help-search .search-box button {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 5px;
}

.search-result-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.search-result-item:hover {
    background-color: #f5f5f5;
}

.result-section {
    font-size: 12px;
    color: #666;
    margin-bottom: 5px;
}

.result-text {
    color: #333;
    line-height: 1.4;
}

.result-text mark {
    background-color: #ffeb3b;
    padding: 2px 4px;
    border-radius: 3px;
}

.no-results {
    padding: 20px;
    text-align: center;
    color: #666;
}

.help-section.highlight {
    background: rgba(74, 124, 89, 0.1);
    border-radius: 10px;
    transition: background-color 0.3s ease;
}

.back-to-top {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(74, 124, 89, 0.8);
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
}

.back-to-top:hover {
    background: rgba(74, 124, 89, 1);
    transform: translateY(-2px);
}

.chat-window {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.chat-header {
    background: linear-gradient(135deg, #4a7c59, #6b8e23);
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h3 {
    margin: 0;
    font-size: 1rem;
}

.chat-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: background-color 0.3s ease;
}

.chat-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.chat-messages {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    background: #f8f9fa;
}

.chat-message {
    display: flex;
    margin-bottom: 15px;
    align-items: flex-start;
    gap: 10px;
}

.chat-message.user {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}

.chat-message.bot .message-avatar {
    background: #4a7c59;
    color: white;
}

.chat-message.user .message-avatar {
    background: #007bff;
    color: white;
}

.message-content {
    max-width: 70%;
}

.message-text {
    background: white;
    padding: 10px 15px;
    border-radius: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    word-wrap: break-word;
}

.chat-message.user .message-text {
    background: #007bff;
    color: white;
}

.message-time {
    font-size: 11px;
    color: #666;
    margin-top: 5px;
    text-align: right;
}

.chat-message.user .message-time {
    text-align: left;
}

.chat-input {
    padding: 15px;
    background: white;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
}

.chat-input input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
}

.chat-input button {
    background: #4a7c59;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.chat-input button:hover {
    background: #2d5016;
}

@media (max-width: 768px) {
    .chat-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 40px);
        bottom: 20px;
        right: 20px;
        left: 20px;
    }
}
</style>
`;

// 添加样式到页面
document.head.insertAdjacentHTML('beforeend', helpStyles);