/**
 * 菜单管理模块
 * 负责处理左侧菜单的显示、隐藏和页面切换
 */
class MenuManager {
    constructor() {
        this.sidebar = null;
        this.menuToggle = null;
        this.mainContainer = null;
        this.menuItems = [];
        this.currentPage = 'main';
        this.isMenuCollapsed = false;
        this.init();
    }

    /**
     * 初始化菜单管理器
     */
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
        this.mainContainer = document.getElementById('mainContainer');
        this.menuItems = document.querySelectorAll('.menu-item');

        this.bindEvents();
        this.loadMenuState();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 菜单切换按钮事件
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                this.toggleMenu();
            });
        }

        // 菜单项点击事件
        this.menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.getAttribute('data-page');
                this.switchPage(page);
            });
        });

        // 点击外部区域关闭菜单（移动端）
        document.addEventListener('click', (e) => {
            if (this.isMenuCollapsed && 
                !this.sidebar.contains(e.target) && 
                !this.menuToggle.contains(e.target)) {
                this.collapseMenu();
            }
        });

        // 窗口大小改变时调整菜单
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    /**
     * 切换菜单显示状态
     */
    toggleMenu() {
        if (this.isMenuCollapsed) {
            this.expandMenu();
        } else {
            this.collapseMenu();
        }
    }

    /**
     * 展开菜单
     */
    expandMenu() {
        this.sidebar.classList.remove('collapsed');
        this.menuToggle.classList.add('menu-open');
        this.isMenuCollapsed = false;
        this.saveMenuState();
    }

    /**
     * 收起菜单
     */
    collapseMenu() {
        this.sidebar.classList.add('collapsed');
        this.menuToggle.classList.remove('menu-open');
        this.isMenuCollapsed = true;
        this.saveMenuState();
    }

    /**
     * 切换页面
     */
    switchPage(page) {
        // 移除所有活动状态
        this.menuItems.forEach(item => {
            item.classList.remove('active');
        });

        // 添加当前页面活动状态
        const currentItem = document.querySelector(`[data-page="${page}"]`);
        if (currentItem) {
            currentItem.classList.add('active');
        }

        this.currentPage = page;
        this.handlePageSwitch(page);
    }

    /**
     * 处理页面切换
     */
    handlePageSwitch(page) {
        // 这里可以根据页面类型加载不同的内容
        switch (page) {
            case 'main':
                this.showMainPage();
                break;
            case 'analysis':
                this.showAnalysisPage();
                break;
            case 'model-training':
            case 'model-training':
                this.showModelTrainingPage();
                break;
            case 'smart-management':
                this.showSmartManagementPage();
                break;
            case 'reports':
                this.showReportsPage();
                break;
            case 'help':
                this.showHelpPage();
                break;
            default:
                this.showMainPage();
        }
    }

    /**
     * 显示主页面
     */
    showMainPage() {
        // 主页面内容已经在HTML中，不需要特殊处理
        console.log('显示主页面');
    }

    /**
     * 显示分析页面
     */
    showAnalysisPage() {
        console.log('跳转到智能分析页面');
        window.location.href = 'analysis.html';
    }


    /**
     * 显示模型训练页面
     */
    showModelTrainingPage() {
        console.log('跳转到模型训练页面');
        window.location.href = 'model-training.html';
    }

    /**
     * 显示智能管理系统页面
     */
    showSmartManagementPage() {
        console.log('跳转到智能管理系统页面');
        window.location.href = 'smart-management.html';
    }

    /**
     * 显示统计报告页面
     */
    showReportsPage() {
        console.log('跳转到统计报告页面');
        window.location.href = 'reports.html';
    }

    /**
     * 显示帮助中心页面
     */
    showHelpPage() {
        console.log('跳转到帮助中心页面');
        window.location.href = 'help.html';
    }

    /**
     * 显示"即将推出"提示
     */
    showComingSoon(message) {
        // 创建提示元素
        const notification = document.createElement('div');
        notification.className = 'pwa-notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <h4><i class="fas fa-info-circle"></i> 功能提示</h4>
                <p>${message}</p>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
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

    /**
     * 处理窗口大小改变
     */
    handleResize() {
        if (window.innerWidth <= 768) {
            // 移动端自动收起菜单
            this.collapseMenu();
        }
    }

    /**
     * 保存菜单状态到本地存储
     */
    saveMenuState() {
        try {
            localStorage.setItem('menu_state', JSON.stringify({
                isCollapsed: this.isMenuCollapsed,
                currentPage: this.currentPage
            }));
        } catch (error) {
            console.error('保存菜单状态失败:', error);
        }
    }

    /**
     * 从本地存储加载菜单状态
     */
    loadMenuState() {
        try {
            const savedState = localStorage.getItem('menu_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.isMenuCollapsed = state.isCollapsed || false;
                this.currentPage = state.currentPage || 'main';

                // 应用保存的状态
                if (this.isMenuCollapsed) {
                    this.collapseMenu();
                } else {
                    this.expandMenu();
                }

                // 设置当前页面
                this.switchPage(this.currentPage);
            }
        } catch (error) {
            console.error('加载菜单状态失败:', error);
        }
    }

    /**
     * 获取当前页面
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * 获取菜单状态
     */
    getMenuState() {
        return {
            isCollapsed: this.isMenuCollapsed,
            currentPage: this.currentPage
        };
    }

    /**
     * 添加新的菜单项
     */
    addMenuItem(page, icon, text) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.setAttribute('data-page', page);
        menuItem.innerHTML = `
            <i class="${icon}"></i>
            <span>${text}</span>
        `;

        // 添加到菜单中
        const sidebarMenu = document.querySelector('.sidebar-menu');
        if (sidebarMenu) {
            sidebarMenu.appendChild(menuItem);
        }

        // 绑定事件
        menuItem.addEventListener('click', (e) => {
            const pageName = e.currentTarget.getAttribute('data-page');
            this.switchPage(pageName);
        });

        // 更新菜单项列表
        this.menuItems = document.querySelectorAll('.menu-item');
    }

    /**
     * 销毁菜单管理器
     */
    destroy() {
        // 清理事件监听器
        if (this.menuToggle) {
            this.menuToggle.removeEventListener('click', this.toggleMenu);
        }

        this.menuItems.forEach(item => {
            item.removeEventListener('click', this.switchPage);
        });
    }
}

// 创建全局菜单管理器实例
const menuManager = new MenuManager(); 