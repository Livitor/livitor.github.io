/**
 * 系统设置模块
 * 实现系统设置界面的功能
 */
class SystemSettings {
    constructor() {
        this.settings = {
            theme: 'dark',
            language: 'zh_CN',
            notifications: true,
            autoUpdate: true,
            dataSync: true,
            backupFrequency: 'daily'
        };
        this.init();
    }

    /**
     * 初始化系统设置
     */
    init() {
        this.createModal();
        this.bindEvents();
    }

    /**
     * 创建系统设置模态框
     */
    createModal() {
        const modalHTML = `
        <div class="modal-container" id="settingsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fas fa-cog"></i> 系统设置</h3>
                    <button class="modal-close" id="closeSettingsModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-section">
                        <h4 class="modal-section-title"><i class="fas fa-palette"></i> 界面设置</h4>
                        <div class="form-group">
                            <label for="theme">主题</label>
                            <select id="theme">
                                <option value="dark" selected>深色主题</option>
                                <option value="light">浅色主题</option>
                                <option value="auto">跟随系统</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="language">语言</label>
                            <select id="language">
                                <option value="zh_CN" selected>简体中文</option>
                                <option value="en_US">English</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="animations" checked>
                                <span class="checkmark"></span>
                                启用动画效果
                            </label>
                        </div>
                    </div>

                    <div class="modal-section">
                        <h4 class="modal-section-title"><i class="fas fa-bell"></i> 通知设置</h4>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="notifications" checked>
                                <span class="checkmark"></span>
                                启用系统通知
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="soundNotifications" checked>
                                <span class="checkmark"></span>
                                启用声音提醒
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="notificationLevel">通知级别</label>
                            <select id="notificationLevel">
                                <option value="all" selected>所有通知</option>
                                <option value="important">仅重要通知</option>
                                <option value="minimal">最少通知</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-section">
                        <h4 class="modal-section-title"><i class="fas fa-sync-alt"></i> 数据同步</h4>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="autoUpdate" checked>
                                <span class="checkmark"></span>
                                自动更新
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="dataSync" checked>
                                <span class="checkmark"></span>
                                数据同步
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="backupFrequency">备份频率</label>
                            <select id="backupFrequency">
                                <option value="hourly">每小时</option>
                                <option value="daily" selected>每天</option>
                                <option value="weekly">每周</option>
                                <option value="monthly">每月</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-section">
                        <h4 class="modal-section-title"><i class="fas fa-info-circle"></i> 系统信息</h4>
                        <div class="system-info">
                            <div class="info-item">
                                <span class="info-label">系统版本</span>
                                <span class="info-value">1.0.0</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">最后更新</span>
                                <span class="info-value">2023-08-10</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">设备ID</span>
                                <span class="info-value">AGS-2023-08001</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="resetSettingsBtn">重置</button>
                    <button class="btn-primary" id="saveSettingsBtn">保存</button>
                </div>
            </div>
        </div>
        `;

        // 将模态框添加到body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭模态框
        document.getElementById('closeSettingsModal')?.addEventListener('click', () => {
            this.closeModal();
        });

        // 重置设置
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => {
            this.resetSettings();
        });

        // 保存设置
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveSettings();
        });

        // 点击模态框外部关闭
        document.getElementById('settingsModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeModal();
            }
        });
    }

    /**
     * 打开系统设置模态框
     */
    openModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // 加载当前设置
            this.loadSettings();
        }
    }

    /**
     * 关闭系统设置模态框
     */
    closeModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * 加载设置
     */
    loadSettings() {
        // 从本地存储加载设置
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
            try {
                this.settings = JSON.parse(savedSettings);
            } catch (error) {
                console.error('加载设置失败:', error);
            }
        }
        
        // 更新UI
        document.getElementById('theme').value = this.settings.theme || 'dark';
        document.getElementById('language').value = this.settings.language || 'zh_CN';
        document.getElementById('animations').checked = this.settings.animations !== false;
        document.getElementById('notifications').checked = this.settings.notifications !== false;
        document.getElementById('soundNotifications').checked = this.settings.soundNotifications !== false;
        document.getElementById('notificationLevel').value = this.settings.notificationLevel || 'all';
        document.getElementById('autoUpdate').checked = this.settings.autoUpdate !== false;
        document.getElementById('dataSync').checked = this.settings.dataSync !== false;
        document.getElementById('backupFrequency').value = this.settings.backupFrequency || 'daily';
    }

    /**
     * 重置设置
     */
    resetSettings() {
        // 恢复默认设置
        this.settings = {
            theme: 'dark',
            language: 'zh_CN',
            animations: true,
            notifications: true,
            soundNotifications: true,
            notificationLevel: 'all',
            autoUpdate: true,
            dataSync: true,
            backupFrequency: 'daily'
        };
        
        // 更新UI
        this.loadSettings();
        
        // 显示通知
        this.showNotification('已恢复默认设置');
    }

    /**
     * 保存设置
     */
    saveSettings() {
        // 从UI获取设置
        this.settings.theme = document.getElementById('theme').value;
        this.settings.language = document.getElementById('language').value;
        this.settings.animations = document.getElementById('animations').checked;
        this.settings.notifications = document.getElementById('notifications').checked;
        this.settings.soundNotifications = document.getElementById('soundNotifications').checked;
        this.settings.notificationLevel = document.getElementById('notificationLevel').value;
        this.settings.autoUpdate = document.getElementById('autoUpdate').checked;
        this.settings.dataSync = document.getElementById('dataSync').checked;
        this.settings.backupFrequency = document.getElementById('backupFrequency').value;
        
        // 保存到本地存储
        localStorage.setItem('systemSettings', JSON.stringify(this.settings));
        
        // 应用设置
        this.applySettings();
        
        // 显示通知
        this.showNotification('设置已保存');
        
        // 关闭模态框
        this.closeModal();
    }

    /**
     * 应用设置
     */
    applySettings() {
        // 应用主题
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // 应用语言
        // 实际项目中可能需要加载语言包
        
        // 应用动画设置
        if (!this.settings.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#f44336' : '#4CAF50',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 3秒后自动移除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 添加系统信息样式
const systemInfoStyles = `
<style>
.system-info {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    margin-top: 10px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
    border-bottom: none;
}

.info-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
}

.info-value {
    color: white;
    font-weight: 500;
}
</style>
`;

// 添加样式到页面
document.head.insertAdjacentHTML('beforeend', systemInfoStyles);

// 导出到全局作用域
window.systemSettings = new SystemSettings();
