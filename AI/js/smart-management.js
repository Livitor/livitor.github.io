// 智能管理系统JavaScript文件

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initSmartManagement();
});

// 初始化智能管理系统
function initSmartManagement() {
    // 初始化实时时间显示
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // 初始化农场操作按钮事件
    initOperationButtons();
    
    // 初始化植株表格交互
    initPlantTable();
    
    // 模拟环境数据更新
    startEnvironmentDataUpdate();
}

// 更新当前时间显示
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// 初始化农场操作按钮
function initOperationButtons() {
    const operationButtons = document.querySelectorAll('.operation-btn');
    
    operationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const operation = this.classList[1]; // 获取操作类型
            handleFarmOperation(operation);
        });
    });
}

// 处理农场操作
function handleFarmOperation(operation) {
    let operationName = '';
    let message = '';
    
    switch(operation) {
        case 'irrigation':
            operationName = '灌溉';
            message = '正在启动自动灌溉系统...';
            break;
        case 'fertilizer':
            operationName = '施肥';
            message = '正在配置施肥方案...';
            break;
        case 'pest-control':
            operationName = '病虫害防治';
            message = '正在启动病虫害防治程序...';
            break;
        case 'harvest':
            operationName = '收获';
            message = '正在评估收获条件...';
            break;
        default:
            operationName = '未知操作';
            message = '操作类型未识别';
    }
    
    // 显示操作确认对话框
    if (confirm(`确定要执行${operationName}操作吗？`)) {
        showNotification('info', `${operationName}操作`, message);
        
        // 模拟操作执行
        setTimeout(() => {
            showNotification('success', `${operationName}完成`, `${operationName}操作已成功执行`);
        }, 2000);
    }
}

// 初始化植株表格交互
function initPlantTable() {
    const tableRows = document.querySelectorAll('.plant-table tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            // 移除其他行的选中状态
            tableRows.forEach(r => r.classList.remove('selected'));
            
            // 添加当前行的选中状态
            this.classList.add('selected');
            
            // 获取植株信息
            const cells = this.querySelectorAll('td');
            const plantInfo = {
                id: cells[0].textContent,
                variety: cells[1].textContent,
                plantDate: cells[2].textContent,
                status: cells[3].textContent,
                harvestDate: cells[4].textContent
            };
            
            showPlantDetails(plantInfo);
        });
    });
}

// 显示植株详细信息
function showPlantDetails(plantInfo) {
    const details = `
        植株ID: ${plantInfo.id}
        品种: ${plantInfo.variety}
        种植日期: ${plantInfo.plantDate}
        当前状态: ${plantInfo.status}
        预计收获: ${plantInfo.harvestDate}
    `;
    
    showNotification('info', '植株详情', details);
}

// 开始环境数据更新
function startEnvironmentDataUpdate() {
    // 每30秒更新一次环境数据
    setInterval(updateEnvironmentData, 30000);
}

// 更新环境数据
function updateEnvironmentData() {
    // 模拟环境数据变化
    const temperature = (25 + Math.random() * 2).toFixed(1);
    const humidity = (65 + Math.random() * 10).toFixed(0);
    const light = (800 + Math.random() * 100).toFixed(0);
    const soil = (40 + Math.random() * 10).toFixed(0);
    
    // 更新显示
    updateDataCard('temperature', `${temperature}°C`);
    updateDataCard('humidity', `${humidity}%`);
    updateDataCard('light', `${light} lux`);
    updateDataCard('soil', `${soil}%`);
}

// 更新数据卡片
function updateDataCard(type, value) {
    const card = document.querySelector(`.data-card.${type} .data-value`);
    if (card) {
        card.textContent = value;
        
        // 添加更新动画效果
        card.style.transform = 'scale(1.1)';
        card.style.color = '#4a7c59';
        
        setTimeout(() => {
            card.style.transform = 'scale(1)';
            card.style.color = '';
        }, 300);
    }
}

// 显示通知
function showNotification(type, title, message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加关闭事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // 自动关闭
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// 导出函数供其他模块使用
window.SmartManagement = {
    updateEnvironmentData,
    handleFarmOperation,
    showNotification
};