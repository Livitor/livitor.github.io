// 性能优化脚本
(function() {
    // 延迟加载非关键CSS
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    
    // 页面加载完成后再加载次要样式
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadCSS('css/mobile-responsive.css');
            loadCSS('css/modal-fix.css');
        }, 100);
    });
    
    // 优化动画性能
    document.addEventListener('DOMContentLoaded', function() {
        // 减少不必要的重绘
        const style = document.createElement('style');
        style.textContent = `
            * {
                will-change: auto;
            }
            .feature-card {
                transform: translateZ(0);
            }
        `;
        document.head.appendChild(style);
    });
})();