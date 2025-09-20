/**
 * 通用侧边栏组件
 * 为所有页面提供统一的菜单栏
 * 替代原有的mobile-menu.js文件
 */

class MobileMenuManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.menuToggle = null;
        this.sidebar = null;
        this.sidebarOverlay = null;
        this.body = document.body;
        this.isMenuOpen = false;
        this.init();
    }

    /**
     * 获取当前页面的标识
     * @returns {string} 当前页面的标识
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);
        
        // 根据文件名确定当前页面
        switch (filename) {
            case '':
            case 'index.html':
                return 'main';
            case 'pest-detection.html':
                return 'pest-detection';
            case 'analysis.html':
                return 'analysis';
            case 'model-training.html':
                return 'model-training';
            case 'smart-management.html':
                return 'smart-management';
            case 'reports.html':
                return 'reports';
            case 'help.html':
                return 'help';
            default:
                return 'main';
        }
    }

    /**
     * 初始化侧边栏
     */
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.injectSidebar();
                this.setupElements();
            });
        } else {
            this.injectSidebar();
            this.setupElements();
        }
    }

    /**
     * 注入侧边栏到页面中
     */
    injectSidebar() {
        // 检查页面中是否已存在侧边栏
        const existingSidebar = document.getElementById('sidebar');
        if (existingSidebar) {
            existingSidebar.remove();
        }

        // 检查页面中是否已存在菜单切换按钮
        const existingMenuToggle = document.getElementById('menuToggle');
        if (existingMenuToggle) {
            existingMenuToggle.remove();
        }

        // 检查页面中是否已存在侧边栏遮罩层
        const existingSidebarOverlay = document.getElementById('sidebarOverlay');
        if (existingSidebarOverlay) {
            existingSidebarOverlay.remove();
        }

        // 创建侧边栏HTML
        const sidebarHTML = this.createSidebarHTML();
        
        // 将侧边栏插入到页面的body开始位置
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

    /**
     * 创建侧边栏HTML
     * @returns {string} 侧边栏的HTML代码
     */
    createSidebarHTML() {
        return `
        <!-- 左侧菜单 -->
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h3><i class="fas fa-leaf"></i> 穗安巡视官</h3>
            </div>
            <div class="sidebar-menu">
                <div class="menu-item ${this.currentPage === 'main' ? 'active' : ''}" data-page="main">
                    <i class="fas fa-home"></i>
                    <span>主页面</span>
                </div>
                <div class="menu-item ${this.currentPage === 'pest-detection' ? 'active' : ''}" data-page="pest-detection">
                    <i class="fas fa-bug"></i>
                    <span>病虫检测</span>
                </div>
                <div class="menu-item ${this.currentPage === 'model-training' ? 'active' : ''}" data-page="model-training">
                    <i class="fas fa-brain"></i>
                    <span>低代码</span>
                </div>
                <div class="menu-item ${this.currentPage === 'analysis' ? 'active' : ''}" data-page="analysis">
                    <i class="fas fa-microscope"></i>
                    <span>智能分析</span>
                </div>
                <div class="menu-item ${this.currentPage === 'smart-management' ? 'active' : ''}" data-page="smart-management">
                    <i class="fas fa-database"></i>
                    <span>病害样本</span>
                </div>
                <div class="menu-item ${this.currentPage === 'reports' ? 'active' : ''}" data-page="reports">
                    <i class="fas fa-chart-bar"></i>
                    <span>统计报告</span>
                </div>
                <div class="menu-item ${this.currentPage === 'help' ? 'active' : ''}" data-page="help">
                    <i class="fas fa-question-circle"></i>
                    <span>帮助中心</span>
                </div>
            </div>
            
            <!-- 菜单底部管理区域 -->
            <div class="sidebar-footer">
                <div class="menu-item user-menu-item" id="sidebarUserBtn">
                    <i class="fas fa-user-cog"></i>
                    <span>用户管理</span>
                </div>
                <div class="menu-item settings-menu-item" id="sidebarSettingsBtn">
                    <i class="fas fa-cog"></i>
                    <span>系统设置</span>
                </div>
            </div>
        </div>

        <!-- 菜单切换按钮 -->
        <button class="menu-toggle menu-toggle-style" id="menuToggle" title="切换菜单">
            <i class="fas fa-bars"></i>
        </button>

        <!-- 侧边栏遮罩层 -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        `;
    }

    /**
     * 设置元素和绑定事件
     */
    setupElements() {
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');

        if (!this.menuToggle || !this.sidebar) {
            console.error('菜单元素未找到');
            return;
        }

        this.bindEvents();
        this.initializeMenu();
    }

    /**
     * 绑定事件
     */
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

    /**
     * 添加滑动手势支持和鼠标悬停支持
     */
    addSwipeGesture() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isSwipeActive = false;
        let hoverTimer = null;
        let isHoverActive = false;

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

        // 添加鼠标悬停支持
        // 创建一个悬停区域
        const hoverZone = document.createElement('div');
        hoverZone.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 20px;
            height: 100%;
            z-index: 9990;
        `;
        document.body.appendChild(hoverZone);

        // 鼠标进入左侧区域
        hoverZone.addEventListener('mouseenter', () => {
            if (this.isMenuOpen) return;
            
            // 清除之前的定时器
            if (hoverTimer) {
                clearTimeout(hoverTimer);
            }
            
            // 设置新的定时器，延迟显示菜单
            hoverTimer = setTimeout(() => {
                if (!isHoverActive) {
                    isHoverActive = true;
                    this.openMenu();
                }
            }, 300); // 300毫秒延迟，避免意外触发
        });

        // 鼠标离开左侧区域
        document.addEventListener('mousemove', (e) => {
            // 如果鼠标不在左侧区域且不在菜单上，关闭菜单
            if (isHoverActive && this.isMenuOpen && e.clientX > 300 && !this.isMouseOverMenu(e)) {
                isHoverActive = false;
                this.closeMenu();
            }
        });

        // 监听菜单区域的鼠标事件
        this.sidebar.addEventListener('mouseleave', () => {
            if (isHoverActive) {
                isHoverActive = false;
                this.closeMenu();
            }
        });
    }

    /**
     * 检查鼠标是否在菜单上
     * @param {MouseEvent} e 鼠标事件
     * @returns {boolean} 是否在菜单上
     */
    isMouseOverMenu(e) {
        const rect = this.sidebar.getBoundingClientRect();
        return (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        );
    }

    /**
     * 绑定菜单项点击事件
     */
    bindMenuItems() {
        const menuItems = this.sidebar.querySelectorAll('.menu-item:not(.settings-menu-item):not(.user-menu-item)');
        
        menuItems.forEach((item) => {
            // 跳过系统设置项和用户管理项，它们由专门的模块处理
            if (item.id === 'sidebarSettingsBtn' || item.id === 'sidebarUserBtn') {
                return;
            }
            
            // 移除原有的点击事件
            item.removeAttribute('onclick');
            
            // 绑定点击事件
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

    /**
     * 处理菜单项点击事件
     * @param {HTMLElement} item 被点击的菜单项
     */
    handleMenuItemClick(item) {
        const page = item.getAttribute('data-page');
        
        // 如果点击的是当前页面，不做任何操作
        if (page === this.currentPage) {
            // 关闭菜单
            this.closeMenu();
            return;
        }
        
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

    /**
     * 切换菜单状态
     */
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * 打开菜单
     */
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

    /**
     * 关闭菜单
     */
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

    /**
     * 初始化菜单
     */
    initializeMenu() {
        // 初始状态确保菜单是关闭的
        this.closeMenu();
    }

    /**
     * 显示即将推出的提示
     * @param {string} message 提示消息
     */
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