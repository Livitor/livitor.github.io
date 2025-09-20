// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    initializeRealTimeData();
    initializeInteractions();
});

// 初始化图表
function initializeChart() {
    const canvas = document.getElementById('lineChart');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // 绘制折线图
    drawLineChart(ctx, canvas.width, canvas.height);
}

// 绘制折线图
function drawLineChart(ctx, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置样式
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // 绘制网格线
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
        const x = padding + (chartWidth / 10) * i;
        const y = padding + (chartHeight / 10) * i;
        
        // 垂直线
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        
        // 水平线
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
    }
    ctx.stroke();
    
    // 根据原图的数据点绘制折线图
    const data1 = [30, 25, 35, 20, 40, 15, 45, 25, 50, 30]; // 紫色线数据
    const data2 = [20, 40, 25, 50, 30, 55, 35, 45, 40, 60]; // 黄色线数据
    const data3 = [15, 20, 30, 25, 35, 30, 25, 35, 30, 40]; // 青色线数据
    
    // 绘制第一条线（紫色）
    ctx.strokeStyle = '#9c27b0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data1.length; i++) {
        const x = padding + (chartWidth / (data1.length - 1)) * i;
        const y = height - padding - (data1[i] / 60) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // 绘制第二条线（黄色）
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data2.length; i++) {
        const x = padding + (chartWidth / (data2.length - 1)) * i;
        const y = height - padding - (data2[i] / 60) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // 绘制第三条线（青色）
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data3.length; i++) {
        const x = padding + (chartWidth / (data3.length - 1)) * i;
        const y = height - padding - (data3[i] / 60) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // 绘制数据点
    data1.forEach((value, index) => {
        const x = padding + (chartWidth / (data1.length - 1)) * index;
        const y = height - padding - (value / 60) * chartHeight;
        
        ctx.fillStyle = '#9c27b0';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    data2.forEach((value, index) => {
        const x = padding + (chartWidth / (data2.length - 1)) * index;
        const y = height - padding - (value / 60) * chartHeight;
        
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    data3.forEach((value, index) => {
        const x = padding + (chartWidth / (data3.length - 1)) * index;
        const y = height - padding - (value / 60) * chartHeight;
        
        ctx.fillStyle = '#00bcd4';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 初始化实时数据更新
function initializeRealTimeData() {
    // 更新时间
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // 立即设置仪表盘数据
    updateGaugeData();
    
    // 更新系统信息
    updateSystemInfo();
    setInterval(updateSystemInfo, 5000);
}

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'long'
    };
    
    const dateTimeStr = now.toLocaleDateString('zh-CN', options);
    const datetimeElement = document.querySelector('.datetime');
    if (datetimeElement) {
        datetimeElement.textContent = dateTimeStr;
    }
}

// 更新仪表盘数据 - 固定数据与原图一致
function updateGaugeData() {
    const gauges = document.querySelectorAll('.gauge');
    
    // 固定数据，与原图一致
    const fixedData = [
        { value: 75, unit: '%', rotation: 45 },   // 土壤湿度 75%
        { value: 28, unit: '°C', rotation: 90 },  // 环境温度 28°C  
        { value: 65, unit: '%', rotation: 135 }   // 空气湿度 65%
    ];
    
    gauges.forEach((gauge, index) => {
        const needle = gauge.querySelector('.gauge-needle');
        const value = gauge.querySelector('.gauge-value');
        
        if (needle && value && fixedData[index]) {
            needle.style.transform = `rotate(${fixedData[index].rotation}deg)`;
            value.textContent = fixedData[index].value + fixedData[index].unit;
        }
    });
}

// 更新系统信息
function updateSystemInfo() {
    const cpuProgress = document.querySelector('.info-item:first-child .progress-fill');
    const memoryProgress = document.querySelector('.info-item:last-child .progress-fill');
    
    if (cpuProgress) {
        const cpuUsage = Math.floor(Math.random() * 40) + 40;
        cpuProgress.style.width = cpuUsage + '%';
    }
    
    if (memoryProgress) {
        const memoryUsage = Math.floor(Math.random() * 30) + 30;
        memoryProgress.style.width = memoryUsage + '%';
    }
    
    // 更新连接数
    const connectionCount = document.querySelector('.monitor-item:last-child .monitor-value');
    if (connectionCount) {
        const count = Math.floor(Math.random() * 10) + 8;
        connectionCount.textContent = count;
    }
}

// 初始化交互功能
function initializeInteractions() {
    // 导航标签切换
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            navTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 侧边栏菜单项点击
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 灯控系统开关
    const lightItems = document.querySelectorAll('.light-item');
    lightItems.forEach(item => {
        item.addEventListener('click', function() {
            const bulb = this.querySelector('.light-bulb');
            const switchElement = this.querySelector('.light-switch');
            
            if (bulb.classList.contains('active')) {
                bulb.classList.remove('active');
                switchElement.textContent = '关';
                switchElement.classList.remove('on');
                switchElement.classList.add('off');
            } else {
                bulb.classList.add('active');
                switchElement.textContent = '开';
                switchElement.classList.remove('off');
                switchElement.classList.add('on');
            }
        });
    });
    
    // 风控系统开关
    const windPanel = document.querySelector('.wind-control-panel');
    if (windPanel) {
        windPanel.addEventListener('click', function() {
            const fanIcon = this.querySelector('.fan-icon');
            const windSwitch = this.querySelector('.wind-switch');
            
            if (windSwitch.classList.contains('on')) {
                windSwitch.textContent = '关';
                windSwitch.classList.remove('on');
                windSwitch.classList.add('off');
                fanIcon.style.animationPlayState = 'paused';
            } else {
                windSwitch.textContent = '开';
                windSwitch.classList.remove('off');
                windSwitch.classList.add('on');
                fanIcon.style.animationPlayState = 'running';
            }
        });
    }
    
    // 快速操作按钮
    const quickBtns = document.querySelectorAll('.quick-btn');
    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent;
            
            // 添加点击效果
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // 模拟操作
            switch (action) {
                case '刷新数据':
                    updateGaugeData();
                    updateSystemInfo();
                    showNotification('数据已刷新');
                    break;
                case '导出报告':
                    showNotification('报告导出中...');
                    break;
                case '系统设置':
                    showNotification('打开系统设置');
                    break;
            }
        });
    });
    
    // 详细数据按钮
    const detailBtn = document.querySelector('.detail-btn');
    if (detailBtn) {
        detailBtn.addEventListener('click', function() {
            showNotification('查看详细数据');
        });
    }
    
    // 主题切换
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            document.body.classList.toggle('dark-theme', this.checked);
            showNotification(this.checked ? '已切换到深色主题' : '已切换到浅色主题');
        });
    }
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(0, 255, 150, 0.9);
        color: #000;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 窗口大小改变时重新绘制图表
window.addEventListener('resize', function() {
    setTimeout(() => {
        initializeChart();
    }, 100);
});

// 页面可见性改变时的处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时暂停动画
        const fanIcon = document.querySelector('.fan-icon');
        if (fanIcon) {
            fanIcon.style.animationPlayState = 'paused';
        }
    } else {
        // 页面显示时恢复动画
        const fanIcon = document.querySelector('.fan-icon');
        const windSwitch = document.querySelector('.wind-switch');
        if (fanIcon && windSwitch && windSwitch.classList.contains('on')) {
            fanIcon.style.animationPlayState = 'running';
        }
    }
});