/**
 * PWA管理模块
 * 负责处理PWA的安装、更新和通知功能
 */
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    /**
     * 初始化PWA管理
     */
    init() {
        this.registerServiceWorker();
        this.bindEvents();
        this.checkInstallation();
        this.checkForUpdates();
    }

    /**
     * 注册Service Worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker 注册成功:', registration);

                // 监听更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // 监听消息
                navigator.serviceWorker.addEventListener('message', (event) => {
                    console.log('收到Service Worker消息:', event.data);
                });

            } catch (error) {
                console.error('Service Worker 注册失败:', error);
            }
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听安装提示
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // 监听应用安装完成
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallPrompt();
            this.showInstallSuccess();
        });

        // 监听在线状态
        window.addEventListener('online', () => {
            this.showOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.showOfflineStatus();
        });
    }

    /**
     * 检查是否已安装
     */
    checkInstallation() {
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
    }

    /**
     * 检查更新
     */
    checkForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    registration.update();
                });
            });
        }
    }

    /**
     * 显示安装提示
     */
    showInstallPrompt() {
        if (this.isInstalled) return;

        const installPrompt = document.createElement('div');
        installPrompt.id = 'install-prompt';
        installPrompt.className = 'install-prompt';
        installPrompt.innerHTML = `
            <div class="install-content">
                <i class="fas fa-download"></i>
                <div class="install-text">
                    <h3>安装穗安巡视官</h3>
                    <p>将应用添加到主屏幕，获得更好的使用体验</p>
                </div>
                <div class="install-actions">
                    <button class="install-btn" id="installBtn">
                        <i class="fas fa-plus"></i> 安装
                    </button>
                    <button class="dismiss-btn" id="dismissBtn">
                        <i class="fas fa-times"></i> 稍后
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(installPrompt);

        // 绑定安装按钮事件
        const installBtn = document.getElementById('installBtn');
        const dismissBtn = document.getElementById('dismissBtn');

        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hideInstallPrompt();
            });
        }

        // 5秒后自动隐藏
        setTimeout(() => {
            this.hideInstallPrompt();
        }, 5000);
    }

    /**
     * 隐藏安装提示
     */
    hideInstallPrompt() {
        const installPrompt = document.getElementById('install-prompt');
        if (installPrompt) {
            installPrompt.remove();
        }
    }

    /**
     * 安装应用
     */
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('安装结果:', outcome);
            this.deferredPrompt = null;
        }
    }

    /**
     * 显示安装成功提示
     */
    showInstallSuccess() {
        this.showNotification('安装成功', '穗安巡视官已成功安装到您的设备', 'success');
    }

    /**
     * 显示更新通知
     */
    showUpdateNotification() {
        const updatePrompt = document.createElement('div');
        updatePrompt.id = 'update-prompt';
        updatePrompt.className = 'update-prompt';
        updatePrompt.innerHTML = `
            <div class="update-content">
                <i class="fas fa-sync-alt"></i>
                <div class="update-text">
                    <h3>发现新版本</h3>
                    <p>点击刷新以获取最新功能</p>
                </div>
                <button class="update-btn" id="updateBtn">
                    <i class="fas fa-redo"></i> 刷新
                </button>
            </div>
        `;

        document.body.appendChild(updatePrompt);

        const updateBtn = document.getElementById('updateBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                this.updateApp();
            });
        }
    }

    /**
     * 更新应用
     */
    updateApp() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                });
            });
        }
        window.location.reload();
    }

    /**
     * 显示在线状态
     */
    showOnlineStatus() {
        this.showNotification('网络已连接', '您可以正常使用所有功能', 'success');
    }

    /**
     * 显示离线状态
     */
    showOfflineStatus() {
        this.showNotification('网络已断开', '部分功能可能受限，但本地功能仍可使用', 'warning');
    }

    /**
     * 显示通知
     */
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `pwa-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // 自动隐藏
        setTimeout(() => {
            notification.remove();
        }, 3000);

        // 手动关闭
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
    }

    /**
     * 请求通知权限
     */
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    /**
     * 发送推送通知
     */
    sendNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        }
    }

    /**
     * 获取PWA信息
     */
    getPWAInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: navigator.onLine,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            notificationSupported: 'Notification' in window,
            notificationPermission: 'Notification' in window ? Notification.permission : 'denied'
        };
    }
}

// 创建全局PWA管理器实例
const pwaManager = new PWAManager(); 