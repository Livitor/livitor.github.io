/**
 * 全局背景应用脚本
 * 在页面加载前立即应用背景设置
 * 此脚本应在所有页面中引入
 */

(function() {
    const backgroundKey = 'ai_pest_detection_background';
    let savedBackground;
    
    // 安全获取localStorage中的背景设置
    try {
        savedBackground = localStorage.getItem(backgroundKey) || 'default';
    } catch (error) {
        console.error('获取背景设置失败:', error);
        savedBackground = 'default';
    }
    
    // 立即应用背景类到html和body元素
    const applyBgClass = () => {
        const html = document.documentElement;
        const body = document.body;
        
        if (savedBackground === 'custom') {
            html.classList.add('bg-custom');
            if (body) body.classList.add('bg-custom');
        } else {
            html.classList.remove('bg-custom');
            if (body) body.classList.remove('bg-custom');
        }
        
        // 添加标记，表示背景已应用
        html.setAttribute('data-bg-applied', 'true');
    };
    
    // 立即应用到html元素
    applyBgClass();
    
    // 如果body还不存在，监听其创建
    if (!document.body) {
        const observer = new MutationObserver(() => {
            if (document.body) {
                applyBgClass();
                observer.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    
    // 页面完全加载后再次确保背景正确
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBgClass);
    }
    
    // 监听localStorage变化，实时更新背景
    window.addEventListener('storage', (event) => {
        if (event.key === backgroundKey) {
            savedBackground = event.newValue || 'default';
            applyBgClass();
        }
    });
})();