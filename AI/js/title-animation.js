// 标题逐字动画控制器
class TitleAnimator {
    constructor(titleElement, text) {
        this.titleElement = titleElement;
        this.originalText = text;
        this.chars = [];
        this.isAnimating = false;
        this.typeDelay = 150; // 每个字符出现的延迟时间(ms)
        this.eraseDelay = 100; // 每个字符消失的延迟时间(ms)
        this.pauseTime = 2000; // 完全显示后的停留时间(ms)
        this.restartDelay = 500; // 重新开始前的延迟时间(ms)
        
        this.init();
    }
    
    init() {
        // 将文本分解为字符并包装在span中
        this.titleElement.innerHTML = '';
        this.titleElement.classList.add('typewriter-title');
        
        for (let i = 0; i < this.originalText.length; i++) {
            const char = this.originalText[i];
            const span = document.createElement('span');
            span.classList.add('char');
            span.textContent = char === ' ' ? '\u00A0' : char; // 使用不间断空格
            span.style.opacity = '0'; // 初始状态为隐藏
            this.titleElement.appendChild(span);
            this.chars.push(span);
        }
        
        // 开始动画循环
        this.startAnimation();
    }
    
    async startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        while (this.isAnimating) {
            // 1. 从左往右逐字显示
            await this.typeIn();
            
            // 2. 停留一段时间
            await this.delay(this.pauseTime);
            
            // 3. 从右往左逐字消失
            await this.typeOut();
            
            // 4. 短暂停留后重新开始
            await this.delay(this.restartDelay);
        }
    }
    
    async typeIn() {
        // 从左往右依次显示每个字符
        for (let i = 0; i < this.chars.length; i++) {
            this.chars[i].style.opacity = '1';
            await this.delay(this.typeDelay);
        }
    }
    
    async typeOut() {
        // 从右往左依次隐藏每个字符
        for (let i = this.chars.length - 1; i >= 0; i--) {
            this.chars[i].style.opacity = '0';
            await this.delay(this.eraseDelay);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 停止动画
    stop() {
        this.isAnimating = false;
    }
    
    // 重置到初始状态
    reset() {
        this.chars.forEach(char => {
            char.style.opacity = '0';
        });
    }
}

// 页面加载完成后初始化动画
document.addEventListener('DOMContentLoaded', function() {
    const titleElement = document.querySelector('.header h1');
    if (titleElement) {
        const titleText = titleElement.textContent.trim();
        new TitleAnimator(titleElement, titleText);
    }
});