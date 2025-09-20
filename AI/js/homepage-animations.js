// 主页面动画控制脚本

class HomepageAnimations {
    constructor() {
        this.particles = [];
        this.isAnimationEnabled = true;
        this.init();
    }

    init() {
        this.checkUserPreferences();
        this.createParticles();
        this.initScrollAnimations();
        this.initInteractiveElements();
        this.initNumberCounters();
        this.initWeatherAnimations();
    }

    // 检查用户动画偏好
    checkUserPreferences() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            this.isAnimationEnabled = false;
            document.body.classList.add('reduced-motion');
        }
    }

    // 创建背景粒子效果
    createParticles() {
        if (!this.isAnimationEnabled) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        document.body.appendChild(particlesContainer);

        const particleCount = window.innerWidth < 768 ? 20 : 40;

        for (let i = 0; i < particleCount; i++) {
            this.createParticle(particlesContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机位置和大小
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 4 + 4;
        const delay = Math.random() * 2;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';

        container.appendChild(particle);
        this.particles.push(particle);

        // 粒子生命周期管理
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
                this.particles = this.particles.filter(p => p !== particle);
                // 创建新粒子保持数量
                this.createParticle(container);
            }
        }, (duration + delay) * 1000);
    }

    // 初始化滚动动画
    initScrollAnimations() {
        if (!this.isAnimationEnabled) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // 观察需要动画的元素
        document.querySelectorAll('.weather-section, .system-functions, .function-card').forEach(el => {
            observer.observe(el);
        });
    }

    // 初始化交互元素
    initInteractiveElements() {
        // 按钮波纹效果
        document.querySelectorAll('.btn, .function-card').forEach(btn => {
            btn.classList.add('btn-ripple');
            
            btn.addEventListener('click', (e) => {
                if (!this.isAnimationEnabled) return;
                
                const ripple = document.createElement('span');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');

                btn.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // 卡片悬停效果增强
        document.querySelectorAll('.function-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!this.isAnimationEnabled) return;
                card.style.transform = 'translateY(-8px) rotateX(5deg)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // 数字计数动画
    initNumberCounters() {
        if (!this.isAnimationEnabled) return;

        const counters = document.querySelectorAll('.temperature-value, .humidity-value, .wind-value');
        
        counters.forEach(counter => {
            const target = parseFloat(counter.textContent);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = current.toFixed(2);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toFixed(2);
                }
            };

            // 延迟启动动画
            setTimeout(updateCounter, 1000);
        });
    }

    // 天气动画效果
    initWeatherAnimations() {
        if (!this.isAnimationEnabled) return;

        // 天气图标动画
        const weatherIcon = document.querySelector('.weather-icon');
        if (weatherIcon) {
            setInterval(() => {
                weatherIcon.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    weatherIcon.style.transform = '';
                }, 300);
            }, 5000);
        }

        // 湿度指示器动画
        const humidityIndicator = document.querySelector('.humidity-indicator');
        if (humidityIndicator) {
            humidityIndicator.classList.add('status-indicator');
        }
    }

    // 页面加载完成动画
    startLoadingAnimation() {
        if (!this.isAnimationEnabled) return;

        // 标题动画
        const title = document.querySelector('.main-title');
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(-30px)';
            
            setTimeout(() => {
                title.style.transition = 'all 1s ease-out';
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 300);
        }

        // 依次显示各个部分
        const sections = document.querySelectorAll('.weather-section, .system-functions');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.8s ease-out';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 500 + index * 200);
        });
    }

    // 响应式处理
    handleResize() {
        // 重新计算粒子位置
        this.particles.forEach(particle => {
            if (Math.random() > 0.5) {
                particle.style.left = Math.random() * window.innerWidth + 'px';
            }
        });
    }

    // 销毁动画（页面切换时）
    destroy() {
        const particlesContainer = document.querySelector('.particles-container');
        if (particlesContainer) {
            particlesContainer.remove();
        }
        this.particles = [];
    }
}

// 页面加载完成后初始化动画
document.addEventListener('DOMContentLoaded', () => {
    const animations = new HomepageAnimations();
    
    // 页面完全加载后启动动画
    window.addEventListener('load', () => {
        animations.startLoadingAnimation();
    });

    // 响应式处理
    window.addEventListener('resize', () => {
        animations.handleResize();
    });

    // 页面可见性变化处理
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面隐藏时暂停动画
            document.body.style.animationPlayState = 'paused';
        } else {
            // 页面显示时恢复动画
            document.body.style.animationPlayState = 'running';
        }
    });
});

// 添加CSS样式到页面
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .animate-in {
        animation: fadeInUp 0.8s ease-out forwards;
    }

    .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
`;
document.head.appendChild(style);