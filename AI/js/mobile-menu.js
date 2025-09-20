/**
 * 移动端和APP优化的菜单系统
 * 适用于所有页面的通用菜单管理器
 */

class MobileMenuManager {
    constructor() {
        this.menuToggle = null;
        this.sidebar = null;
        this.sidebarOverlay = null;
        this.body = document.body;
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupElements();
            });
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');

        if (!this.menuToggle || !this.sidebar) {
            console.error('菜单元素未找到');
            return;
        }

        // 如果没有遮罩层，创建一个
        if (!this.sidebarOverlay) {
            this.createOverlay();
        }

        this.bindEvents();
        this.initializeMenu();
    }

    createOverlay() {
        this.sidebarOverlay = document.createElement('div');
        this.sidebarOverlay.className = 'sidebar-overlay';
        this.sidebarOverlay.id = 'sidebarOverlay';
        document.body.appendChild(this.sidebarOverlay);
    }

    bindEvents() {
        // 菜单按钮点击事件
        this.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        // 触摸事件支持（移动端）
        this.menuToggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this.menuToggle.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        // 遮罩层点击关闭菜单
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMenu();
            });
        }

        // 添加右滑手势支持
        this.addSwipeGesture();

        // 菜单项点击事件
        this.bindMenuItems();

        // 键盘支持（ESC键关闭菜单）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // 窗口大小改变时的处理
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // 防止菜单内部滚动时影响背景
        this.sidebar.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
    }

    addSwipeGesture() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isSwipeActive = false;

        // 触摸开始
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isSwipeActive = true;
            }
        }, { passive: true });

        // 触摸移动
        document.addEventListener('touchmove', (e) => {
            if (!isSwipeActive || e.touches.length !== 1) return;

            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            // 检查是否是水平滑动（右滑）
            if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
                // 只有在屏幕左边缘开始滑动才触发菜单
                if (startX < 50 && !this.isMenuOpen) {
                    e.preventDefault();
                    this.openMenu();
                    isSwipeActive = false;
                }
            }
            // 检查是否是水平滑动（左滑关闭菜单）
            else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -50) {
                if (this.isMenuOpen) {
                    e.preventDefault();
                    this.closeMenu();
                    isSwipeActive = false;
                }
            }
        }, { passive: false });

        // 触摸结束
        document.addEventListener('touchend', () => {
            isSwipeActive = false;
        }, { passive: true });

        // 触摸取消
        document.addEventListener('touchcancel', () => {
            isSwipeActive = false;
        }, { passive: true });
    }

    bindMenuItems() {
        const menuItems = this.sidebar.querySelectorAll('.menu-item:not(.settings-menu-item):not(.user-menu-item)');
        
        menuItems.forEach((item, index) => {
            // 跳过系统设置项和用户管理项，它们由专门的模块处理
            if (item.id === 'sidebarSettingsBtn' || item.id === 'sidebarUserBtn') {
                return;
            }
            
            // 移除原有的点击事件
            item.removeAttribute('onclick');
            
            const page = item.getAttribute('data-page');
            
            // 强制绑定点击事件，确保在所有设备上都能正常工作
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleMenuItemClick(item);
            });

            // 触摸事件支持（移动端）
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleMenuItemClick(item);
            });
        });
    }

    handleMenuItemClick(item) {
        const page = item.getAttribute('data-page');
        
        // 关闭菜单
        this.closeMenu();
        
        // 延迟执行跳转，确保动画完成
        setTimeout(() => {
            switch(page) {
                case 'main':
                    window.location.href = 'index.html';
                    break;
                case 'pest-detection':
                    window.location.href = 'pest-detection.html';
                    break;
                case 'analysis':
                    window.location.href = 'analysis.html';
                    break;
                case 'model-training':
                    window.location.href = 'model-training.html';
                    break;
                case 'smart-management':
                    window.location.href = 'smart-management.html';
                    break;
                case 'reports':
                    window.location.href = 'reports.html';
                    break;
                case 'help':
                    window.location.href = 'help.html';
                    break;
                default:
                    console.log('未知页面:', page);
                    // 显示页面开发中的提示
                    this.showComingSoon(`${page} 页面正在开发中，敬请期待！`);
            }
        }, 300);
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        
        this.sidebar.classList.add('show');
        this.sidebar.classList.remove('collapsed');
        
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.add('show');
        }
        
        this.menuToggle.classList.add('menu-open');
        this.body.classList.add('menu-open');
        
        // 更新按钮图标
        const icon = this.menuToggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-times';
        }
    }

    closeMenu() {
        this.isMenuOpen = false;
        
        this.sidebar.classList.remove('show');
        this.sidebar.classList.add('collapsed');
        
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('show');
        }
        
        this.menuToggle.classList.remove('menu-open');
        this.body.classList.remove('menu-open');
        
        // 更新按钮图标
        const icon = this.menuToggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
    }

    initializeMenu() {
        // 初始状态确保菜单是关闭的
        this.closeMenu();
    }

    showComingSoon(message) {
        // 创建提示元素
        const notification = document.createElement('div');
        notification.className = 'pwa-notification success';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    destroy() {
        // 清理事件监听器
        if (this.menuToggle) {
            this.menuToggle.removeEventListener('click', this.toggleMenu);
        }
        
        if (this.sidebarOverlay) {
            this.sidebarOverlay.removeEventListener('click', this.closeMenu);
        }
    }
}

// 创建全局菜单管理器实例
let mobileMenuManager;

// 确保在DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mobileMenuManager = new MobileMenuManager();
    });
} else {
    mobileMenuManager = new MobileMenuManager();
}

// 导出到全局作用域
window.mobileMenuManager = mobileMenuManager;