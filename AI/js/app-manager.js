/**
 * 应用管理器 - 负责扫描app文件夹中的APK文件并显示在下载区域
 */
class AppManager {
    constructor() {
        this.appList = [];
        this.appContainer = document.getElementById('appDownloadContainer');
        this.init();
    }

    /**
     * 初始化应用管理器
     */
    init() {
        console.log('AppManager 初始化...');
        this.loadApps();
    }

    /**
     * 加载应用列表
     */
    loadApps() {
        console.log('加载应用列表...');
        
        // 在实际环境中，这里应该是一个AJAX请求来获取app文件夹中的APK文件列表
        // 由于这是前端演示，我们使用模拟数据
        
        // 模拟从服务器获取APK列表
        fetch('api/apps/list.json')
            .then(response => {
                // 如果API不可用，使用模拟数据
                if (!response.ok) {
                    return this.getMockApps();
                }
                return response.json();
            })
            .catch(error => {
                console.error('获取应用列表失败:', error);
                return this.getMockApps();
            })
            .then(apps => {
                this.appList = apps;
                this.renderApps();
            });
    }

    /**
     * 获取模拟应用数据
     */
    getMockApps() {
        return [
            {
                id: '1.0.0',
                name: '穗安巡视官 v1.0.0',
                version: 'v1.0.0',
                size: '12.3 MB',
                releaseDate: '2025-03-01',
                description: '穗安巡视官初始版本，包含基础病虫害识别功能',
                icon: 'fas fa-mobile-alt',
                requirements: {
                    os: 'Android 8.0+',
                    ram: '2GB RAM',
                    storage: '20MB 可用存储空间'
                },
                downloadUrl: 'app/1.0.0.apk'
            },
            {
                id: '2.0.1',
                name: '穗安巡视官 v2.0.1',
                version: 'v2.0.1',
                size: '15.7 MB',
                releaseDate: '2025-07-01',
                description: '穗安巡视官升级版，支持200+种常见农作物病虫害识别',
                icon: 'fas fa-mobile-alt',
                requirements: {
                    os: 'Android 9.0+',
                    ram: '3GB RAM',
                    storage: '50MB 可用存储空间'
                },
                downloadUrl: 'app/2.0.1.apk'
            },
            {
                id: '2.0.2',
                name: '穗安巡视官 v2.0.2',
                version: 'v2.0.2',
                size: '16.2 MB',
                releaseDate: '2025-08-10',
                description: '穗安巡视官最新版本，修复了多项bug并优化了识别速度',
                icon: 'fas fa-mobile-alt',
                requirements: {
                    os: 'Android 9.0+',
                    ram: '3GB RAM',
                    storage: '55MB 可用存储空间'
                },
                downloadUrl: 'app/2.0.2.apk'
            }
        ];
    }

    /**
     * 渲染应用列表到页面
     */
    renderApps() {
        if (!this.appContainer) {
            console.error('找不到应用容器元素');
            return;
        }

        // 清空容器
        this.appContainer.innerHTML = '';

        // 如果没有应用，显示提示信息
        if (this.appList.length === 0) {
            this.appContainer.innerHTML = `
                <div class="no-apps-message" style="text-align: center; padding: 20px; color: white;">
                    <i class="fas fa-info-circle" style="font-size: 2em; margin-bottom: 10px;"></i>
                    <p>暂无可用的应用程序</p>
                </div>
            `;
            return;
        }

        // 渲染每个应用卡片
        this.appList.forEach(app => {
            const appCard = this.createAppCard(app);
            this.appContainer.appendChild(appCard);
        });
    }

    /**
     * 创建应用卡片元素
     */
    createAppCard(app) {
        const appCard = document.createElement('div');
        appCard.className = 'app-card';
        appCard.style.cssText = `
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            margin-bottom: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
        `;

        appCard.innerHTML = `
            <div class="app-card-content" style="display: flex; flex-direction: row; padding: 0;">
                <!-- 左侧信息区域 -->
                <div class="app-info" style="flex: 1; padding: 20px; border-right: 1px solid rgba(255, 255, 255, 0.1);">
                    <div class="app-header" style="display: flex; align-items: center; margin-bottom: 15px;">
                        <div class="app-icon" style="width: 50px; height: 50px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                            <i class="${app.icon}" style="font-size: 1.8em; color: white;"></i>
                        </div>
                        <div class="app-title">
                            <h4 style="margin: 0 0 5px 0; color: white;">${app.name}</h4>
                            <div class="app-version" style="color: rgba(255, 255, 255, 0.7); font-size: 0.9em;">
                                版本: ${app.version} | 大小: ${app.size}
                            </div>
                        </div>
                    </div>
                    
                    <div class="app-description" style="margin-bottom: 15px; color: rgba(255, 255, 255, 0.9);">
                        ${app.description}
                    </div>
                    
                    <div class="app-requirements">
                        <h5 style="color: white; margin: 0 0 10px 0; font-size: 0.95em;">系统要求:</h5>
                        <div class="req-list" style="color: rgba(255, 255, 255, 0.8); font-size: 0.9em;">
                            <div class="req-item" style="margin-bottom: 5px;">
                                <i class="fas fa-mobile" style="width: 20px; text-align: center; margin-right: 5px;"></i>
                                ${app.requirements.os}
                            </div>
                            <div class="req-item" style="margin-bottom: 5px;">
                                <i class="fas fa-memory" style="width: 20px; text-align: center; margin-right: 5px;"></i>
                                ${app.requirements.ram}
                            </div>
                            <div class="req-item">
                                <i class="fas fa-hdd" style="width: 20px; text-align: center; margin-right: 5px;"></i>
                                ${app.requirements.storage}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 右侧操作区域 -->
                <div class="app-actions" style="width: 200px; padding: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: rgba(0, 0, 0, 0.1);">
                    <div class="release-date" style="margin-bottom: 15px; text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 0.9em;">
                        发布日期: ${app.releaseDate}
                    </div>
                    
                    <button class="download-btn primary" onclick="downloadApp('${app.downloadUrl}')" style="width: 100%; margin-bottom: 10px; padding: 12px; border: none; border-radius: 8px; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-download"></i>
                        下载APK
                    </button>
                    
                    <button class="download-btn secondary" onclick="shareApp('${app.name}', '${app.downloadUrl}')" style="width: 100%; padding: 12px; border: none; border-radius: 8px; background: rgba(255, 255, 255, 0.15); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-share-alt"></i>
                        分享
                    </button>
                </div>
            </div>
        `;

        // 添加悬停效果
        appCard.addEventListener('mouseenter', () => {
            appCard.style.transform = 'translateY(-5px)';
            appCard.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            appCard.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        appCard.addEventListener('mouseleave', () => {
            appCard.style.transform = 'translateY(0)';
            appCard.style.boxShadow = 'none';
            appCard.style.background = 'rgba(255, 255, 255, 0.15)';
        });

        return appCard;
    }
}

/**
 * 下载应用
 */
function downloadApp(url) {
    console.log('下载应用:', url);
    // 实际环境中，这里应该触发真实的下载
    showNotification('开始下载', '应用下载已开始，请稍候...', 'success');
    
    // 模拟下载进度
    simulateDownloadProgress();
}

/**
 * 查看应用更新日志
 */
function viewAppChangelog(url) {
    console.log('查看更新日志:', url);
    // 实际环境中，这里应该加载并显示更新日志
    showChangelogModal();
}

/**
 * 分享应用
 */
function shareApp(name, url) {
    console.log('分享应用:', name, url);
    
    // 构建完整的下载URL
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/${url}`;
    
    // 复制链接到剪贴板
    navigator.clipboard.writeText(fullUrl)
        .then(() => {
            showNotification('链接已复制', `${name} 的下载链接已复制到剪贴板`, 'info');
        })
        .catch(err => {
            console.error('无法复制链接:', err);
            showNotification('复制失败', '无法复制链接，请手动复制', 'error');
            
            // 显示一个模态框，让用户手动复制
            showShareModal(name, fullUrl);
        });
}

/**
 * 显示分享模态框
 */
function showShareModal(name, url) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="share-content" style="background: white; border-radius: 10px; padding: 20px; max-width: 500px; width: 90%;">
            <h3 style="margin-top: 0;">分享 ${name}</h3>
            <p>复制以下链接分享给好友：</p>
            <div style="display: flex; margin-bottom: 15px;">
                <input type="text" value="${url}" readonly style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <button id="manualCopyBtn" style="margin-left: 10px; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">复制</button>
            </div>
            <div style="text-align: right;">
                <button id="closeShareModal" style="padding: 10px 20px; background: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听
    document.getElementById('manualCopyBtn').addEventListener('click', () => {
        const input = modal.querySelector('input');
        input.select();
        document.execCommand('copy');
        alert('链接已复制到剪贴板');
    });
    
    document.getElementById('closeShareModal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

/**
 * 显示更新日志模态框
 */
function showChangelogModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'changelog-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="changelog-content" style="background: white; border-radius: 10px; padding: 0; max-width: 600px; width: 90%; max-height: 80vh; overflow: hidden;">
            <div class="changelog-header" style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">更新日志</h3>
                <button id="closeChangelogModal" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="changelog-body" style="padding: 20px; max-height: calc(80vh - 60px); overflow-y: auto;">
                <div class="version-entry">
                    <div class="version-header" style="background: #f5f5f5; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span class="version-tag" style="background: #4CAF50; color: white; padding: 3px 10px; border-radius: 15px; font-size: 0.9rem;">v2.0.1</span>
                        <span class="version-date">2025-07-01</span>
                    </div>
                    <div class="version-changes" style="padding: 15px;">
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">新增</span>
                            <span class="change-desc">添加高精度病虫害识别模型，支持200+种常见农作物病虫害</span>
                        </div>
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #FFC107; color: #333; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">修复</span>
                            <span class="change-desc">修复在低光环境下拍照识别准确率下降的问题</span>
                        </div>
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #2196F3; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">优化</span>
                            <span class="change-desc">优化应用启动速度，提升30%加载效率</span>
                        </div>
                    </div>
                </div>
                
                <div class="version-entry">
                    <div class="version-header" style="background: #f5f5f5; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span class="version-tag" style="background: #4CAF50; color: white; padding: 3px 10px; border-radius: 15px; font-size: 0.9rem;">v1.5.0</span>
                        <span class="version-date">2025-05-15</span>
                    </div>
                    <div class="version-changes" style="padding: 15px;">
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">新增</span>
                            <span class="change-desc">添加离线数据采集功能，支持在无网络环境下工作</span>
                        </div>
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">新增</span>
                            <span class="change-desc">集成GPS定位标记功能，可记录采样位置</span>
                        </div>
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #FFC107; color: #333; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">修复</span>
                            <span class="change-desc">修复部分Android 10设备上相机权限问题</span>
                        </div>
                    </div>
                </div>
                
                <div class="version-entry">
                    <div class="version-header" style="background: #f5f5f5; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span class="version-tag" style="background: #4CAF50; color: white; padding: 3px 10px; border-radius: 15px; font-size: 0.9rem;">v1.0.0</span>
                        <span class="version-date">2025-03-01</span>
                    </div>
                    <div class="version-changes" style="padding: 15px;">
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">新增</span>
                            <span class="change-desc">首次发布，包含基础病虫害识别功能</span>
                        </div>
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">新增</span>
                            <span class="change-desc">支持拍照和从相册选择图片进行识别</span>
                        </div>
                        <div class="change-item" style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                            <span class="change-type" style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">新增</span>
                            <span class="change-desc">集成天气预报功能，支持7天预报</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听
    document.getElementById('closeChangelogModal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

/**
 * 模拟下载进度
 */
function simulateDownloadProgress() {
    // 创建下载进度模态框
    const modal = document.createElement('div');
    modal.className = 'download-progress-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="download-progress-content" style="background: white; border-radius: 10px; padding: 0; max-width: 500px; width: 90%;">
            <div class="download-progress-header" style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 15px; text-align: center;">
                <h3 style="margin: 0;">正在下载应用</h3>
            </div>
            <div class="download-progress-body" style="padding: 20px;">
                <div class="download-file-info" style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div class="file-icon" style="font-size: 2rem; color: #4CAF50;">
                        <i class="fas fa-file-download"></i>
                    </div>
                    <div class="file-details" style="flex: 1;">
                        <div class="file-name" style="font-weight: bold; margin-bottom: 5px;">穗安巡视官.apk</div>
                        <div class="file-size">45.7 MB</div>
                    </div>
                </div>
                
                <div class="progress-container" style="margin-bottom: 20px;">
                    <div class="progress-bar" style="width: 100%; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
                        <div class="progress-fill" id="downloadProgressFill" style="height: 100%; background: #4CAF50; width: 0%; transition: width 0.3s ease;"></div>
                    </div>
                    <div class="progress-text" style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 0.9rem; color: #666;">
                        <span id="downloadProgressText">0%</span>
                        <span id="downloadSpeed">0 KB/s</span>
                    </div>
                </div>
                
                <div class="download-status" id="downloadStatus" style="text-align: center; margin-bottom: 20px;">
                    准备下载...
                </div>
                
                <div class="download-progress-actions" style="text-align: center;">
                    <button id="cancelDownload" style="padding: 10px 20px; background: white; color: #F44336; border: 1px solid #F44336; border-radius: 5px; cursor: pointer;">
                        取消下载
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听
    document.getElementById('cancelDownload').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 模拟下载进度
    let progress = 0;
    const progressFill = document.getElementById('downloadProgressFill');
    const progressText = document.getElementById('downloadProgressText');
    const downloadSpeed = document.getElementById('downloadSpeed');
    const downloadStatus = document.getElementById('downloadStatus');
    
    const interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            downloadStatus.textContent = '下载完成';
            
            // 下载完成后2秒关闭模态框
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                showNotification('下载完成', '应用已成功下载到您的设备', 'success');
            }, 2000);
        }
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        // 模拟下载速度
        const speed = Math.round(Math.random() * 1000 + 500);
        downloadSpeed.textContent = `${speed} KB/s`;
        
        // 更新状态
        if (progress < 20) {
            downloadStatus.textContent = '正在连接服务器...';
        } else if (progress < 60) {
            downloadStatus.textContent = '正在下载...';
        } else {
            downloadStatus.textContent = '即将完成...';
        }
    }, 200);
}

/**
 * 显示通知
 */
function showNotification(title, message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 2000;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // 设置通知类型样式
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
            notification.style.color = 'white';
            notification.innerHTML = `<i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>`;
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #F44336, #C62828)';
            notification.style.color = 'white';
            notification.innerHTML = `<i class="fas fa-exclamation-circle" style="font-size: 1.5rem;"></i>`;
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #FFC107, #FFA000)';
            notification.style.color = '#333';
            notification.innerHTML = `<i class="fas fa-exclamation-triangle" style="font-size: 1.5rem;"></i>`;
            break;
        case 'info':
        default:
            notification.style.background = 'linear-gradient(135deg, #2196F3, #1565C0)';
            notification.style.color = 'white';
            notification.innerHTML = `<i class="fas fa-info-circle" style="font-size: 1.5rem;"></i>`;
            break;
    }
    
    // 添加通知内容
    notification.innerHTML += `
        <div class="notification-content">
            <div class="notification-title" style="font-weight: bold; margin-bottom: 3px;">${title}</div>
            <div class="notification-message" style="font-size: 0.9rem; opacity: 0.9;">${message}</div>
        </div>
        <button class="notification-close" style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; opacity: 0.7; margin-left: auto;">&times;</button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加关闭按钮事件
    notification.querySelector('.notification-close').addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // 添加自动关闭
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 关闭通知
 */
function closeNotification(notification) {
    notification.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 300);
}

// 当页面加载完成后初始化应用管理器
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否存在应用容器
    if (document.getElementById('appDownloadContainer')) {
        window.appManager = new AppManager();
    }
});
