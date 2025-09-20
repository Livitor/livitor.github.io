/**
 * 增强菜单功能
 * 支持电脑端鼠标悬停和手机端滑动手势
 */
class EnhancedMenu {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
        this.isDesktop = window.innerWidth > 768;
        this.isMenuOpen = false;
        this.isHoverOpen = false; // 区分悬停打开和点击打开
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.hoverTimeout = null; // 添加悬停延时控制
        
        this.init();
    }

    init() {
        console.log('Enhanced Menu 初始化开始');
        console.log('是否为桌面端:', this.isDesktop);
        console.log('侧边栏元素:', this.sidebar);
        console.log('菜单按钮元素:', this.menuToggle);
        
        // 确保菜单初始状态正确
        this.initializeMenuState();
        
        this.setupDesktopHover();
        this.setupMobileSwipe();
        this.setupResizeHandler();
        this.setupMenuToggle();
        
        console.log('Enhanced Menu 初始化完成');
    }

    /**
     * 初始化菜单状态
     */
    initializeMenuState() {
        if (this.sidebar) {
            // 确保菜单初始状态是关闭的
            this.sidebar.classList.remove('show');
            this.sidebar.classList.add('collapsed');
            this.sidebar.style.transform = 'translateX(-100%)';
        }
        
        if (this.menuToggle) {
            this.menuToggle.classList.remove('menu-open');
            this.menuToggle.style.left = '20px';
            this.menuToggle.style.transform = 'rotate(0deg)';
        }
        
        this.isMenuOpen = false;
        this.isHoverOpen = false;
        
        console.log('菜单初始状态设置完成');
    }

    /**
     * 设置电脑端鼠标悬停功能
     */
    setupDesktopHover() {
        console.log('设置桌面端悬停功能, isDesktop:', this.isDesktop);
        if (!this.isDesktop) {
            console.log('不是桌面端，跳过悬停设置');
            return;
        }

        console.log('开始绑定鼠标事件');

        // 鼠标进入左侧边缘区域时展开菜单
        document.addEventListener('mousemove', (e) => {
            if (!this.isDesktop) return;
            
            // 左侧50px区域触发展开，增加触发区域
            if (e.clientX <= 50 && !this.isMenuOpen && !this.isHoverOpen) {
                console.log('鼠标触发左侧边缘，展开菜单, clientX:', e.clientX);
                this.showMenuHover();
            }
        });

        // 鼠标离开菜单区域时收缩
        if (this.sidebar) {
            console.log('绑定侧边栏鼠标事件');
            this.sidebar.addEventListener('mouseleave', (e) => {
                if (!this.isDesktop || this.isMenuOpen) return;
                
                console.log('鼠标离开菜单区域');
                
                // 延迟隐藏，给用户时间移动鼠标
                setTimeout(() => {
                    if (!this.isMenuOpen && this.isHoverOpen) {
                        console.log('延时后隐藏菜单');
                        this.hideMenuHover();
                    }
                }, 800);
            });

            // 鼠标进入菜单区域时确保菜单保持展开
            this.sidebar.addEventListener('mouseenter', () => {
                if (!this.isDesktop || this.isMenuOpen) return;
                
                console.log('鼠标进入菜单区域');
                if (!this.isHoverOpen) {
                    this.showMenuHover();
                }
            });
        } else {
            console.log('侧边栏元素不存在');
        }
        
        console.log('桌面端悬停功能设置完成');
    }

    /**
     * 设置手机端滑动手势
     */
    setupMobileSwipe() {
        if (this.isDesktop) return;

        // 触摸开始
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        // 触摸结束
        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe();
        }, { passive: true });
    }

    /**
     * 处理滑动手势
     */
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // 确保是水平滑动（垂直滑动距离小于水平滑动距离）
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;
        
        // 确保滑动距离足够
        if (Math.abs(deltaX) < this.minSwipeDistance) return;

        // 从左往右滑动且菜单未打开 - 打开菜单
        if (deltaX > 0 && this.touchStartX < 50 && !this.isMenuOpen) {
            this.openMenu();
        }
        // 从右往左滑动且菜单已打开 - 关闭菜单
        else if (deltaX < 0 && this.isMenuOpen) {
            this.closeMenu();
        }
    }

    /**
     * 设置窗口大小变化处理
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            const wasDesktop = this.isDesktop;
            this.isDesktop = window.innerWidth > 768;
            
            // 从手机切换到电脑时，重新设置悬停功能
            if (!wasDesktop && this.isDesktop) {
                this.setupDesktopHover();
                // 如果菜单是打开状态，关闭它
                if (this.isMenuOpen) {
                    this.closeMenu();
                }
            }
            // 从电脑切换到手机时，清理悬停状态
            else if (wasDesktop && !this.isDesktop) {
                if (this.isHoverOpen) {
                    this.hideMenuHover();
                }
            }
        });
    }

    /**
     * 设置菜单切换按钮
     */
    setupMenuToggle() {
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.closeMenu();
                } else {
                    this.openMenu();
                }
            });
        }

        // 设置菜单项点击事件
        this.setupMenuItemClickHandlers();
        
        // 设置用户管理和系统设置按钮
        this.setupManagementButtons();
    }

    /**
     * 设置用户管理和系统设置按钮
     */
    setupManagementButtons() {
        console.log('Enhanced Menu - 设置管理按钮');
        
        // 用户管理按钮
        const userBtn = document.getElementById('sidebarUserBtn');
        if (userBtn) {
            console.log('Enhanced Menu - 绑定用户管理按钮');
            userBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Enhanced Menu - 用户管理按钮被点击');
                this.openUserManagement();
                
                // 在移动端点击后关闭菜单
                if (!this.isDesktop) {
                    this.closeMenu();
                }
            });
            
            // 触摸事件支持
            userBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openUserManagement();
                
                if (!this.isDesktop) {
                    this.closeMenu();
                }
            });
        }
        
        // 系统设置按钮
        const settingsBtn = document.getElementById('sidebarSettingsBtn');
        if (settingsBtn) {
            console.log('Enhanced Menu - 绑定系统设置按钮');
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Enhanced Menu - 系统设置按钮被点击');
                this.openSystemSettings();
                
                // 在移动端点击后关闭菜单
                if (!this.isDesktop) {
                    this.closeMenu();
                }
            });
            
            // 触摸事件支持
            settingsBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openSystemSettings();
                
                if (!this.isDesktop) {
                    this.closeMenu();
                }
            });
        }
    }

    /**
     * 打开用户管理
     */
    openUserManagement() {
        console.log('Enhanced Menu - 打开用户管理');
        
        // 检查是否有用户管理模块
        if (typeof window.userManagement !== 'undefined' && window.userManagement.openUserManagement) {
            window.userManagement.openUserManagement();
        } else if (typeof userManagement !== 'undefined' && userManagement.openUserManagement) {
            userManagement.openUserManagement();
        } else if (typeof openUserModal === 'function') {
            openUserModal();
        } else {
            // 直接触发用户管理按钮的点击事件
            const userModal = document.getElementById('userModal');
            if (userModal) {
                userModal.classList.add('show');
                userModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }
    }

    /**
     * 打开系统设置
     */
    openSystemSettings() {
        console.log('Enhanced Menu - 打开系统设置');
        
        // 检查是否有设置模块
        if (typeof window.settingsManager !== 'undefined' && window.settingsManager.openModal) {
            window.settingsManager.openModal();
        } else if (typeof openSettingsModal === 'function') {
            openSettingsModal();
        } else if (document.getElementById('settingsModal')) {
            // 如果有设置模态框，直接显示
            const modal = document.getElementById('settingsModal');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            // 如果没有设置模块，显示提示
            this.showComingSoon('系统设置功能正在开发中，敬请期待！');
        }
    }

    /**
     * 设置菜单项点击处理器
     */
    setupMenuItemClickHandlers() {
        const menuItems = document.querySelectorAll('.menu-item:not(.settings-menu-item):not(.user-menu-item)');
        console.log('Enhanced Menu - 绑定菜单项数量:', menuItems.length);
        
        menuItems.forEach((item, index) => {
            const page = item.getAttribute('data-page');
            console.log(`Enhanced Menu - 菜单项 ${index}: ${page}`);
            
            // 跳过系统设置项和用户管理项，它们由专门的模块处理
            if (item.id === 'sidebarSettingsBtn' || item.id === 'sidebarUserBtn') {
                return;
            }
            
            // 确保没有重复绑定
            item.removeEventListener('click', this.handleMenuClick);
            
            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Enhanced Menu - 菜单项被点击:', page);
                
                // 移除所有活动状态
                menuItems.forEach(mi => mi.classList.remove('active'));
                
                // 添加当前项的活动状态
                item.classList.add('active');
                
                // 页面跳转逻辑
                this.navigateToPage(page);
                
                // 在移动端点击后关闭菜单
                if (!this.isDesktop) {
                    this.closeMenu();
                }
            };
            
            item.addEventListener('click', handleClick);
            
            // 触摸事件支持
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Enhanced Menu - 菜单项被触摸:', page);
                handleClick(e);
            });
        });
    }

    /**
     * 导航到指定页面
     */
    navigateToPage(page) {
        const pageMap = {
            'main': 'index.html',
            'pest-detection': 'pest-detection.html',
            'model-training': 'model-training.html',
            'analysis': 'analysis.html',
            'smart-management': 'smart-management.html',
            'reports': 'reports.html',
            'help': 'help.html'
        };

        const targetPage = pageMap[page];
        
        if (targetPage) {
            console.log('跳转到页面:', targetPage);
            window.location.href = targetPage;
        } else {
            console.log('未知页面:', page);
            this.showPageNotFound(page);
        }
    }

    /**
     * 显示页面未找到提示
     */
    showPageNotFound(page) {
        const pageNames = {
            'pest-detection': '病虫检测',
            'model-training': '模型训练',
            'analysis': '智能分析',
            'smart-management': '智能管理',
            'reports': '统计报告',
            'help': '帮助中心'
        };

        const pageName = pageNames[page] || page;
        
        // 创建更友好的提示
        this.showComingSoon(`${pageName}页面正在开发中，敬请期待！`);
    }

    /**
     * 显示开发中提示
     */
    showComingSoon(message) {
        // 创建提示元素
        const notification = document.createElement('div');
        notification.className = 'menu-notification';
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
            animation: slideInFromRight 0.3s ease-out;
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
                notification.style.animation = 'slideOutToRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * 显示菜单（电脑端悬停）
     */
    showMenuHover() {
        console.log('showMenuHover 被调用');
        
        // 清除之前的延时
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        this.isHoverOpen = true;
        console.log('设置 isHoverOpen = true');
        
        if (this.sidebar) {
            console.log('展开侧边栏');
            this.sidebar.classList.remove('collapsed');
            this.sidebar.classList.add('show');
            this.sidebar.style.transform = 'translateX(0)';
        }
        
        if (this.menuToggle) {
            console.log('更新菜单按钮位置');
            this.menuToggle.classList.add('menu-open');
            this.menuToggle.style.left = '290px';
            this.menuToggle.style.transform = 'rotate(90deg)';
        }
        
        console.log('菜单悬停展开完成');
    }

    /**
     * 隐藏菜单（电脑端悬停）
     */
    hideMenuHover() {
        // 清除之前的延时
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        
        // 设置延时隐藏，避免误触
        this.hoverTimeout = setTimeout(() => {
            this.isHoverOpen = false;
            
            if (this.sidebar) {
                this.sidebar.classList.remove('show');
                this.sidebar.style.transform = 'translateX(-100%)';
            }
            
            if (this.menuToggle) {
                this.menuToggle.classList.remove('menu-open');
                this.menuToggle.style.left = '20px';
                this.menuToggle.style.transform = 'rotate(0deg)';
            }
        }, 300);
    }

    /**
     * 打开菜单（手机端或点击）
     */
    openMenu() {
        this.isMenuOpen = true;
        
        if (this.sidebar) {
            this.sidebar.classList.add('show');
            this.sidebar.style.transform = 'translateX(0)';
        }
        
        if (this.menuToggle) {
            this.menuToggle.classList.add('menu-open');
            if (this.isDesktop) {
                this.menuToggle.style.left = '290px';
                this.menuToggle.style.transform = 'rotate(90deg)';
            } else {
                this.menuToggle.style.left = '290px';
            }
        }
        
        // 添加遮罩层（仅手机端）
        if (!this.isDesktop) {
            this.addOverlay();
        }
    }

    /**
     * 关闭菜单（手机端或点击）
     */
    closeMenu() {
        this.isMenuOpen = false;
        
        if (this.sidebar) {
            this.sidebar.classList.remove('show');
            this.sidebar.style.transform = 'translateX(-100%)';
        }
        
        if (this.menuToggle) {
            this.menuToggle.classList.remove('menu-open');
            this.menuToggle.style.left = '20px';
            this.menuToggle.style.transform = 'rotate(0deg)';
        }
        
        // 移除遮罩层
        this.removeOverlay();
    }

    /**
     * 添加遮罩层
     */
    addOverlay() {
        if (document.querySelector('.menu-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // 触发动画
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        // 点击遮罩层关闭菜单
        overlay.addEventListener('click', () => {
            this.closeMenu();
        });
    }

    /**
     * 移除遮罩层
     */
    removeOverlay() {
        const overlay = document.querySelector('.menu-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    /**
     * 获取当前菜单状态
     */
    getMenuState() {
        return {
            isOpen: this.isMenuOpen,
            isDesktop: this.isDesktop
        };
    }
}

// 页面加载完成后初始化增强菜单
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedMenu = new EnhancedMenu();
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedMenu;
}