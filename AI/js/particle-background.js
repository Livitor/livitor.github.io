// 粒子背景特效系统
class ParticleBackground {
    constructor(options = {}) {
        this.options = {
            particleCount: options.particleCount || 50,
            particleSpeed: options.particleSpeed || 1,
            particleSize: options.particleSize || { min: 2, max: 8 },
            particleColor: options.particleColor || 'rgba(255, 255, 255, 0.7)',
            connectionDistance: options.connectionDistance || 120,
            enableConnections: options.enableConnections !== false,
            enableCanvas: options.enableCanvas !== false,
            ...options
        };
        
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        // 检查用户是否偏好减少动画
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        this.createCanvas();
        this.createParticles();
        this.startAnimation();
        this.bindEvents();
    }
    
    createCanvas() {
        if (!this.options.enableCanvas) return;
        
        // 移除已存在的canvas
        const existingCanvas = document.getElementById('particles-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particles-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            background: linear-gradient(135deg, 
                rgba(102, 126, 234, 0.05) 0%, 
                rgba(118, 75, 162, 0.05) 100%);
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        const count = Math.min(this.options.particleCount, window.innerWidth / 20);
        
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * this.options.particleSpeed,
            vy: (Math.random() - 0.5) * this.options.particleSpeed,
            size: Math.random() * (this.options.particleSize.max - this.options.particleSize.min) + this.options.particleSize.min,
            opacity: Math.random() * 0.5 + 0.3,
            life: Math.random() * 100
        };
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += 0.5;
            
            // 边界检测
            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.vy *= -1;
            }
            
            // 透明度变化
            particle.opacity = 0.3 + Math.sin(particle.life * 0.02) * 0.3;
        });
    }
    
    drawParticles() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制粒子
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
            this.ctx.closePath();
        });
        
        // 绘制连线
        if (this.options.enableConnections) {
            this.drawConnections();
        }
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.connectionDistance) {
                    const opacity = (1 - distance / this.options.connectionDistance) * 0.2;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
        this.isRunning = true;
        this.animate();
    }
    
    stopAnimation() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    bindEvents() {
        // 窗口大小改变时重新调整
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
        
        // 页面可见性改变时控制动画
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAnimation();
            } else {
                this.startAnimation();
            }
        });
    }
    
    destroy() {
        this.stopAnimation();
        if (this.canvas) {
            this.canvas.remove();
        }
        this.particles = [];
    }
}

// 创建简化版粒子背景（用于性能较低的设备）
class SimpleParticleBackground {
    constructor() {
        this.container = null;
        this.particles = [];
        this.init();
    }
    
    init() {
        this.createContainer();
        this.createSimpleParticles();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'particles-container';
        document.body.appendChild(this.container);
    }
    
    createSimpleParticles() {
        const count = Math.min(20, window.innerWidth / 50);
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${this.getRandomSize()}`;
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
            
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }
    
    getRandomSize() {
        const sizes = ['small', 'medium', 'large'];
        return sizes[Math.floor(Math.random() * sizes.length)];
    }
    
    destroy() {
        if (this.container) {
            this.container.remove();
        }
        this.particles = [];
    }
}

// 自动初始化粒子背景
let particleBackground = null;

function initParticleBackground() {
    // 检查设备性能
    const isLowPerformance = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                            window.innerWidth < 768 ||
                            navigator.hardwareConcurrency < 4;
    
    if (isLowPerformance) {
        particleBackground = new SimpleParticleBackground();
    } else {
        particleBackground = new ParticleBackground({
            particleCount: 45,
            particleSpeed: 0.6,
            particleSize: { min: 2, max: 8 },
            connectionDistance: 130,
            enableConnections: true
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initParticleBackground);

// 导出供其他脚本使用
window.ParticleBackground = ParticleBackground;
window.SimpleParticleBackground = SimpleParticleBackground;
window.particleBackground = particleBackground;