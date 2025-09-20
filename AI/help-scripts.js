// 帮助中心页面的脚本整合文件
// 移动端和APP优化的菜单系统

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化背景管理器
    if (typeof backgroundManager !== 'undefined') {
        backgroundManager.init();
    }
    
    // 初始化移动端优化的菜单功能
    initMobileOptimizedMenu();
    
    // 帮助中心特有的功能
    initHelpCenter();
});

// 初始化移动端优化的菜单系统
function initMobileOptimizedMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const body = document.body;
    
    if (!menuToggle || !sidebar || !sidebarOverlay) {
        console.error('菜单元素未找到');
        return;
    }
    
    let isMenuOpen = false;
    
    // 菜单切换函数
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            openMenu();
        } else {
            closeMenu();
        }
    }
    
    // 打开菜单
    function openMenu() {
        sidebar.classList.add('show');
        sidebarOverlay.classList.add('show');
        menuToggle.classList.add('menu-open');
        body.style.overflow = 'hidden'; // 防止背景滚动
        
        // 更新按钮图标
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-times';
        }
    }
    
    // 关闭菜单
    function closeMenu() {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        menuToggle.classList.remove('menu-open');
        body.style.overflow = ''; // 恢复滚动
        
        // 更新按钮图标
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
        
        isMenuOpen = false;
    }
    
    // 菜单按钮点击事件
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // 触摸事件支持（移动端）
    menuToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
    
    menuToggle.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // 遮罩层点击关闭菜单
    sidebarOverlay.addEventListener('click', function(e) {
        e.preventDefault();
        closeMenu();
    });
    
    // 菜单项点击事件
    const menuItems = sidebar.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 如果有onclick属性，执行它
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                // 关闭菜单
                closeMenu();
                // 延迟执行跳转，确保动画完成
                setTimeout(() => {
                    eval(onclick);
                }, 300);
            }
        });
        
        // 触摸事件支持
        item.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        });
    });
    
    // 键盘支持（ESC键关闭菜单）
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });
    
    // 窗口大小改变时的处理
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024 && isMenuOpen) {
            // 大屏幕时自动关闭菜单
            closeMenu();
        }
    });
    
    // 防止菜单内部滚动时影响背景
    sidebar.addEventListener('touchmove', function(e) {
        e.stopPropagation();
    });
    
    // 初始状态确保菜单是关闭的
    closeMenu();
}

function initHelpCenter() {
    // 搜索功能
    const searchInput = document.getElementById('helpSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchHelp();
            }
        });
    }
    
    // FAQ展开/收缩功能
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            // 关闭所有其他FAQ
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });
            
            // 切换当前FAQ
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
}

// 搜索帮助内容
function searchHelp() {
    const searchTerm = document.getElementById('helpSearchInput').value.toLowerCase();
    if (!searchTerm) return;
    
    const sections = document.querySelectorAll('.help-section');
    let found = false;
    
    sections.forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            section.scrollIntoView({ behavior: 'smooth' });
            section.classList.add('highlight');
            setTimeout(() => section.classList.remove('highlight'), 3000);
            found = true;
            return;
        }
    });
    
    if (!found) {
        alert('未找到相关内容，请尝试其他关键词。');
    }
}

// 滚动到指定部分
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        section.classList.add('highlight');
        setTimeout(() => section.classList.remove('highlight'), 3000);
    }
}