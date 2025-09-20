/**
 * 背景管理模块
 * 负责处理背景图片的切换和状态管理
 */
class BackgroundManager {
    constructor() {
        this.currentBackground = 'light';
        this.backgroundKey = 'ai_pest_detection_background';
        this.init();
    }

    /**
     * 初始化背景管理
     */
    init() {
        this.loadBackground();
        this.applyBackgroundImmediately(); // 立即应用背景，避免闪白
        this.bindEvents();
        this.updateUI();
        
        // 确保在DOM加载完成后更新预览
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updatePreview(this.currentBackground);
            });
        } else {
            this.updatePreview(this.currentBackground);
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const bgLightBtn = document.getElementById('bgLight');
        const bgDarkBtn = document.getElementById('bgDark');
        const bgCustomBtn = document.getElementById('bgCustom');
        const previewLight = document.getElementById('previewLight');
        const previewDark = document.getElementById('previewDark');
        const previewCustom = document.getElementById('previewCustom');

        if (bgLightBtn) {
            bgLightBtn.addEventListener('click', () => {
                this.setBackground('light');
                this.updatePreview('light');
            });
        }

        if (bgDarkBtn) {
            bgDarkBtn.addEventListener('click', () => {
                this.setBackground('dark');
                this.updatePreview('dark');
            });
        }

        if (bgCustomBtn) {
            bgCustomBtn.addEventListener('click', () => {
                this.setBackground('custom');
                this.updatePreview('custom');
            });
        }
        
        // 初始化预览
        this.updatePreview(this.currentBackground);
    }
    
    /**
     * 更新背景预览
     */
    updatePreview(type) {
        const previewLight = document.getElementById('previewLight');
        const previewDark = document.getElementById('previewDark');
        const previewCustom = document.getElementById('previewCustom');
        
        if (previewLight && previewDark && previewCustom) {
            previewLight.style.display = 'none';
            previewDark.style.display = 'none';
            previewCustom.style.display = 'none';
            
            if (type === 'light' || type === 'default') {
                previewLight.style.display = 'block';
            } else if (type === 'dark') {
                previewDark.style.display = 'block';
            } else if (type === 'custom') {
                previewCustom.style.display = 'block';
            }
        }
    }

    /**
     * 设置背景
     */
    setBackground(type) {
        this.currentBackground = type;
        this.applyBackground();
        this.saveBackground();
        this.updateUI();
    }

    /**
     * 立即应用背景（避免闪白）
     */
    applyBackgroundImmediately() {
        // 在DOM完全加载前就设置背景
        const applyBg = () => {
            const body = document.body || document.documentElement;
            
            // 移除所有背景类
            body.classList.remove('bg-custom', 'bg-light', 'bg-dark');
            
            // 添加当前背景类
            if (this.currentBackground === 'custom') {
                body.classList.add('bg-custom');
            } else if (this.currentBackground === 'dark') {
                body.classList.add('bg-dark');
            } else {
                body.classList.add('bg-light');
            }
        };

        // 如果body已存在，立即应用
        if (document.body) {
            applyBg();
        } else {
            // 否则等待DOM加载
            document.addEventListener('DOMContentLoaded', applyBg);
        }
    }

    /**
     * 应用背景
     */
    applyBackground() {
        const body = document.body;
        
        // 移除所有背景类
        body.classList.remove('bg-custom', 'bg-light', 'bg-dark');
        
        // 添加当前背景类
        if (this.currentBackground === 'custom') {
            body.classList.add('bg-custom');
        } else if (this.currentBackground === 'dark') {
            body.classList.add('bg-dark');
        } else {
            body.classList.add('bg-light');
        }
    }

    /**
     * 更新UI状态
     */
    updateUI() {
        const bgLightBtn = document.getElementById('bgLight');
        const bgDarkBtn = document.getElementById('bgDark');
        const bgCustomBtn = document.getElementById('bgCustom');

        // 移除所有活动状态
        if (bgLightBtn) bgLightBtn.classList.remove('active');
        if (bgDarkBtn) bgDarkBtn.classList.remove('active');
        if (bgCustomBtn) bgCustomBtn.classList.remove('active');

        // 添加当前活动状态
        if ((this.currentBackground === 'light' || this.currentBackground === 'default') && bgLightBtn) {
            bgLightBtn.classList.add('active');
        } else if (this.currentBackground === 'dark' && bgDarkBtn) {
            bgDarkBtn.classList.add('active');
        } else if (this.currentBackground === 'custom' && bgCustomBtn) {
            bgCustomBtn.classList.add('active');
        }
    }

    /**
     * 保存背景设置到本地存储
     */
    saveBackground() {
        try {
            localStorage.setItem(this.backgroundKey, this.currentBackground);
            console.log('背景设置已保存:', this.currentBackground);
        } catch (error) {
            console.error('保存背景设置失败:', error);
        }
    }

    /**
     * 从本地存储加载背景设置
     */
    loadBackground() {
        try {
            const savedBackground = localStorage.getItem(this.backgroundKey);
            if (savedBackground) {
                this.currentBackground = savedBackground;
            }
        } catch (error) {
            console.error('加载背景设置失败:', error);
        }
    }

    /**
     * 获取当前背景类型
     */
    getCurrentBackground() {
        return this.currentBackground;
    }

    /**
     * 检查背景图片是否加载成功
     */
    checkBackgroundImage() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve(true);
            };
            img.onerror = () => {
                resolve(false);
            };
            img.src = 'pic/background.png';
        });
    }

    /**
     * 预加载背景图片
     */
    async preloadBackgroundImage() {
        const isLoaded = await this.checkBackgroundImage();
        if (!isLoaded) {
            console.warn('背景图片加载失败，将使用默认背景');
            this.setBackground('default');
        }
    }

    /**
     * 重置为默认背景
     */
    resetToDefault() {
        this.setBackground('light');
    }

    /**
     * 获取背景信息
     */
    getBackgroundInfo() {
        return {
            current: this.currentBackground,
            available: ['light', 'dark', 'custom'],
            imagePath: 'pic/background.png'
        };
    }
}

// 在页面加载前立即应用背景，避免闪白
(function() {
    const backgroundKey = 'ai_pest_detection_background';
    let savedBackground;
    
    // 安全获取localStorage
    try {
        savedBackground = localStorage.getItem(backgroundKey) || 'light';
    } catch (error) {
        savedBackground = 'light';
    }
    
    // 立即应用背景类到html元素
    const applyBgClass = () => {
        const html = document.documentElement;
        const body = document.body;
        
        // 移除所有背景类
        html.classList.remove('bg-custom', 'bg-light', 'bg-dark');
        if (body) body.classList.remove('bg-custom', 'bg-light', 'bg-dark');
        
        // 添加当前背景类
        if (savedBackground === 'custom') {
            html.classList.add('bg-custom');
            if (body) body.classList.add('bg-custom');
        } else if (savedBackground === 'dark') {
            html.classList.add('bg-dark');
            if (body) body.classList.add('bg-dark');
        } else {
            html.classList.add('bg-light');
            if (body) body.classList.add('bg-light');
        }
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
})();

// 创建全局背景管理器实例
const backgroundManager = new BackgroundManager();
