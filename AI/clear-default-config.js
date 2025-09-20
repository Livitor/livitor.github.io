/**
 * 清理默认配置脚本
 * 用于彻底清除浏览器中保存的默认API配置
 */

console.log('=== 开始清理默认配置 ===');

// 清理localStorage中的配置
const configKeys = [
    'ai_pest_detection_config',
    'baiduAccessToken',
    'baiduAccessTokenExpiry',
    'speechApiConfig'
];

configKeys.forEach(key => {
    if (localStorage.getItem(key)) {
        console.log(`清理localStorage中的 ${key}`);
        localStorage.removeItem(key);
    }
});

// 清理sessionStorage中的配置
configKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
        console.log(`清理sessionStorage中的 ${key}`);
        sessionStorage.removeItem(key);
    }
});

// 重置配置为空值
const emptyConfig = {
    apiKey: '',
    apiEndpoint: '',
    model: ''
};

localStorage.setItem('ai_pest_detection_config', JSON.stringify(emptyConfig));
console.log('已设置空配置到localStorage');

// 清理表单中的默认值
document.addEventListener('DOMContentLoaded', function() {
    const fieldsToReset = [
        'apiKey',
        'baiduAppId', 
        'baiduApiKey',
        'baiduSecretKey'
    ];
    
    fieldsToReset.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
            console.log(`已清空字段: ${fieldId}`);
        }
    });
});

console.log('=== 配置清理完成 ===');
console.log('请刷新页面以确保更改生效');

// 提供手动清理函数
window.clearAllConfig = function() {
    configKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    localStorage.setItem('ai_pest_detection_config', JSON.stringify(emptyConfig));
    location.reload();
};

console.log('如需手动清理，请在控制台执行: clearAllConfig()');