// 鼠标拖尾和点击效果系统
class MouseEffects {
    constructor(options = {}) {
        this.options = {
            enableTrail: options.enableTrail !== false,
            enableClickRipple: options.enableClickRipple !== false,
            trailLength: options.trailLength || 10,
            trailDelay: options.trailDelay || 30,
            colorfulTrail: options.colorfulTrail || false,
            trailStyle: options.trailStyle || 'default', // 'default', 'star', 'heart'
            ...options
        };
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.trails = [];
        this.isMouseDown = false;
        this.lastClickTime = 0;
        this.longPressTimer = null;
        this.container = null;
        
        this.init();
    }
    
    init() {
        // 检查用户是否偏好减少动画
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        // 检查是否为移动设备
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.createContainer();
        this.bindEvents();
        if (this.options.enableTrail) {
            this.startTrailAnimation();
        }
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'mouse-trail-container';
        document.body.appendChild(this.container);
    }
    

    
    bindEvents() {
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // 鼠标点击事件
        document.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.handleMouseDown(e);
        });
        
        document.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
            this.handleMouseUp(e);
        });
        
        // 点击事件
        document.addEventListener('click', (e) => {
            if (this.options.enableClickRipple) {
                this.createClickRipple(e.clientX, e.clientY);
            }
            this.handleClick(e);
        });
        
        // 双击事件
        document.addEventListener('dblclick', (e) => {
            this.createDoubleClickBurst(e.clientX, e.clientY);
        });
        

        
        // 移动端触摸事件
        if (this.isMobile) {
            document.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                this.createTouchRipple(touch.clientX, touch.clientY);
            });
        }
    }
    

    
    handleMouseDown(e) {
        // 长按检测
        this.longPressTimer = setTimeout(() => {
            this.createLongPressIndicator(e.clientX, e.clientY);
        }, 500);
    }
    
    handleMouseUp(e) {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }
    
    handleClick(e) {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastClickTime;
        
        // 双击检测
        if (timeDiff < 300) {
            // 这是双击的第二次点击
            return;
        }
        
        this.lastClickTime = currentTime;
    }
    
    startTrailAnimation() {
        const createTrail = () => {
            if (this.trails.length > 0) {
                this.createTrailParticle();
            }
            
            // 添加新的拖尾点
            this.trails.push({
                x: this.mouseX,
                y: this.mouseY,
                time: Date.now()
            });
            
            // 限制拖尾长度
            if (this.trails.length > this.options.trailLength) {
                this.trails.shift();
            }
        };
        
        setInterval(createTrail, this.options.trailDelay);
    }
    
    createTrailParticle() {
        if (!this.container || this.trails.length === 0) return;
        
        const trail = this.trails[0];
        const particle = document.createElement('div');
        
        // 随机选择粒子大小，与背景粒子一致
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        
        particle.className = `trail-particle ${randomSize}`;
        
        if (this.options.colorfulTrail) {
            particle.classList.add('colorful');
        }
        
        // 根据粒子大小调整位置偏移
        let offset = 3;
        if (randomSize === 'small') offset = 2;
        if (randomSize === 'large') offset = 4;
        
        particle.style.left = (trail.x - offset) + 'px';
        particle.style.top = (trail.y - offset) + 'px';
        
        this.container.appendChild(particle);
        
        // 根据粒子大小调整存在时间
        const duration = randomSize === 'small' ? 1000 : 
                        randomSize === 'medium' ? 1200 : 1400;
        
        // 自动移除粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration);
    }
    
    createClickRipple(x, y) {
        if (!this.container) return;
        
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = (x - 50) + 'px';
        ripple.style.top = (y - 50) + 'px';
        
        this.container.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    createDoubleClickBurst(x, y) {
        if (!this.container) return;
        
        const burst = document.createElement('div');
        burst.className = 'double-click-burst';
        burst.style.left = (x - 10) + 'px';
        burst.style.top = (y - 10) + 'px';
        
        this.container.appendChild(burst);
        
        setTimeout(() => {
            if (burst.parentNode) {
                burst.parentNode.removeChild(burst);
            }
        }, 800);
    }
    
    createLongPressIndicator(x, y) {
        if (!this.container) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'long-press-indicator';
        indicator.style.left = (x - 30) + 'px';
        indicator.style.top = (y - 30) + 'px';
        
        this.container.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 2000);
    }
    
    createTouchRipple(x, y) {
        if (!this.container) return;
        
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        ripple.style.left = (x - 40) + 'px';
        ripple.style.top = (y - 40) + 'px';
        
        this.container.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 500);
    }
    
    // 切换拖尾样式
    setTrailStyle(style) {
        this.options.trailStyle = style;
    }
    
    // 切换彩色拖尾
    toggleColorfulTrail() {
        this.options.colorfulTrail = !this.options.colorfulTrail;
    }
    
    // 销毁效果
    destroy() {
        if (this.container) {
            this.container.remove();
        }
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
    }
}

// 全局鼠标效果实例
let mouseEffects = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    mouseEffects = new MouseEffects({
        enableTrail: true,
        enableClickRipple: true,
        trailLength: 10,
        trailDelay: 35,
        colorfulTrail: false,
        trailStyle: 'default'
    });
});

// 导出供其他脚本使用
window.MouseEffects = MouseEffects;
window.mouseEffects = mouseEffects;