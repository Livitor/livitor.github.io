/**
 * 页面导航功能模块
 * 处理页面间的跳转和导航逻辑
 */

/**
 * 导航到指定页面
 * @param {string} pageName - 页面名称
 */
function navigateTo(pageName) {
    console.log('Page Navigation - 导航到页面:', pageName);
    
    // 显示加载状态
    showNotification('正在跳转...', 'info');
    
    // 延迟跳转，确保动画完成
    setTimeout(() => {
        console.log('Page Navigation - 执行跳转:', pageName);
        window.location.href = pageName;
    }, 300);
}

/**
 * 根据页面标识导航到对应页面
 * @param {string} pageId - 页面标识
 */
function navigateToPage(pageId) {
    console.log('Page Navigation - 根据ID导航:', pageId);
    
    const pageMap = {
        'main': 'index.html',
        'pest-detection': 'pest-detection.html',
        'model-training': 'model-training.html',
        'analysis': 'analysis.html',
        'smart-management': 'smart-management.html',
        'reports': 'reports.html',
        'help': 'help.html'
    };

    const targetPage = pageMap[pageId];
    
    if (targetPage) {
        console.log('Page Navigation - 找到目标页面:', targetPage);
        navigateTo(targetPage);
    } else {
        console.error('Page Navigation - 未找到页面:', pageId);
        showNotification(`页面 ${pageId} 正在开发中`, 'warning');
    }
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型
 */
function showNotification(message, type = 'info') {
    console.log('Page Navigation - 显示通知:', message, type);
    
    // 创建通知容器（如果不存在）
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        pointer-events: auto;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideInFromRight 0.3s ease-out;
    `;
    
    const iconMap = {
        'info': 'fas fa-info-circle',
        'warning': 'fas fa-exclamation-triangle',
        'error': 'fas fa-exclamation-circle',
        'success': 'fas fa-check-circle'
    };

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="${iconMap[type] || iconMap.info}"></i>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 0; margin-left: 8px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // 设置不同类型的颜色
    if (type === 'error') {
        notification.style.background = 'rgba(244, 67, 54, 0.9)';
    } else if (type === 'warning') {
        notification.style.background = 'rgba(255, 193, 7, 0.9)';
    } else if (type === 'info') {
        notification.style.background = 'rgba(33, 150, 243, 0.9)';
    }

    // 添加到容器
    container.appendChild(notification);

    // 自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutToRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    container.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

/**
 * 处理菜单项点击事件
 * @param {string} pageId - 页面ID
 */
function handleMenuClick(pageId) {
    console.log('Page Navigation - 处理菜单点击:', pageId);
    
    // 关闭移动端菜单
    if (window.mobileMenuManager && window.mobileMenuManager.isMenuOpen) {
        window.mobileMenuManager.closeMenu();
    }
    
    // 延迟导航，确保菜单关闭动画完成
    setTimeout(() => {
        navigateToPage(pageId);
    }, 300);
}

// 确保函数在全局作用域可用
window.navigateTo = navigateTo;
window.navigateToPage = navigateToPage;
window.showNotification = showNotification;
window.handleMenuClick = handleMenuClick;

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page Navigation - 页面导航模块已加载');
    
    // 绑定所有功能卡片的点击事件
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        const onclick = card.getAttribute('onclick');
        if (onclick && onclick.includes('navigateToPage')) {
            console.log('Page Navigation - 绑定功能卡片事件:', onclick);
        }
    });
});