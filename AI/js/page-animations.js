// 通用页面动画控制器
class PageAnimator {
    constructor() {
        this.titleAnimators = [];
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }
    
    init() {
        // 页面加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
        } else {
            this.setupAnimations();
        }
    }
    
    setupAnimations() {
        this.initTitleAnimations();
        this.initScrollAnimations();
        this.initButtonAnimations();
        this.initInputAnimations();
        this.initCardAnimations();
    }
    
    // 初始化标题动画
    initTitleAnimations() {
        const titleSelectors = [
            'h1', 'h2.section-title', '.page-title', '.main-title'
        ];
        
        titleSelectors.forEach(selector => {
            const titles = document.querySelectorAll(selector);
            titles.forEach(title => {
                if (!title.classList.contains('typewriter-title') && 
                    !title.classList.contains('page-title-animated')) {
                    this.createTitleAnimation(title);
                }
            });
        });
    }
    
    // 创建标题动画
    createTitleAnimation(titleElement) {
        const text = titleElement.textContent.trim();
        if (text.length === 0) return;
        
        titleElement.innerHTML = '';
        titleElement.classList.add('page-title-animated');
        
        const chars = [];
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.classList.add('char');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.opacity = '0';
            titleElement.appendChild(span);
            chars.push(span);
        }
        
        // 创建动画实例
        const animator = new TitleTypewriter(titleElement, chars);
        this.titleAnimators.push(animator);
        
        // 开始动画
        setTimeout(() => animator.startAnimation(), 300);
    }
    
    // 初始化滚动动画
    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, this.observerOptions);
        
        // 观察需要动画的元素
        const animatedElements = document.querySelectorAll(
            '.card, .feature-card, .section, .panel, .form-group, .chart-container, .data-item'
        );
        
        animatedElements.forEach((el, index) => {
            el.classList.add('animate-hidden');
            observer.observe(el);
        });
    }
    
    // 动画化元素
    animateElement(element) {
        const animations = ['animate-slide-up', 'animate-fade-in', 'animate-scale-in'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        
        element.classList.remove('animate-hidden');
        element.classList.add(randomAnimation);
        
        // 添加随机延迟
        const delay = Math.random() * 0.3;
        element.style.animationDelay = `${delay}s`;
    }
    
    // 初始化按钮动画
    initButtonAnimations() {
        const buttons = document.querySelectorAll('button, .btn, .button');
        buttons.forEach(btn => {
            if (!btn.classList.contains('btn-animated')) {
                btn.classList.add('btn-animated');
            }
        });
    }
    
    // 初始化输入框动画
    initInputAnimations() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (!input.classList.contains('input-animated')) {
                input.classList.add('input-animated');
            }
        });
    }
    
    // 初始化卡片动画
    initCardAnimations() {
        const cards = document.querySelectorAll('.card, .feature-card, .panel');
        cards.forEach(card => {
            if (!card.classList.contains('enhanced-hover')) {
                card.classList.add('enhanced-hover');
            }
        });
    }
    
    // 添加加载动画
    showLoading(element) {
        const spinner = document.createElement('span');
        spinner.classList.add('loading-spinner');
        element.appendChild(spinner);
        return spinner;
    }
    
    // 移除加载动画
    hideLoading(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }
    
    // 添加成功动画
    showSuccess(element) {
        element.classList.add('bounce-animation');
        setTimeout(() => {
            element.classList.remove('bounce-animation');
        }, 600);
    }
    
    // 添加错误动画
    showError(element) {
        element.classList.add('shake-animation');
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 500);
    }
    
    // 停止所有标题动画
    stopTitleAnimations() {
        this.titleAnimators.forEach(animator => animator.stop());
    }
}

// 标题打字机效果类
class TitleTypewriter {
    constructor(element, chars) {
        this.element = element;
        this.chars = chars;
        this.isAnimating = false;
        this.typeDelay = 100;
        this.eraseDelay = 80;
        this.pauseTime = 3000;
        this.restartDelay = 1000;
    }
    
    async startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        while (this.isAnimating) {
            await this.typeIn();
            await this.delay(this.pauseTime);
            await this.typeOut();
            await this.delay(this.restartDelay);
        }
    }
    
    async typeIn() {
        for (let i = 0; i < this.chars.length; i++) {
            if (!this.isAnimating) break;
            this.chars[i].style.opacity = '1';
            await this.delay(this.typeDelay);
        }
    }
    
    async typeOut() {
        for (let i = this.chars.length - 1; i >= 0; i--) {
            if (!this.isAnimating) break;
            this.chars[i].style.opacity = '0';
            await this.delay(this.eraseDelay);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    stop() {
        this.isAnimating = false;
    }
}

// 全局页面动画实例
let pageAnimator;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    pageAnimator = new PageAnimator();
});

// 导出给其他脚本使用
window.PageAnimator = PageAnimator;
window.pageAnimator = pageAnimator;