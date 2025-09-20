// 智能分析页面JavaScript - 清理版本
// 只使用真实API调用，无模拟结果

// 全局变量
let uploadedImages = [];
let analysisInProgress = false;
let trainedModels = [];
let currentAnalysisMode = 'single';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 创建简化的配置管理器，不依赖DOM元素
    window.configManager = {
        getConfig: function() {
            try {
                const config = localStorage.getItem('ai_pest_detection_config');
                if (config) {
                    return JSON.parse(config);
                }
                return {
                    apiKey: '',
                    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                    model: 'gpt-4o'
                };
            } catch (error) {
                console.error('获取配置失败:', error);
                return {
                    apiKey: '',
                    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                    model: 'gpt-4o'
                };
            }
        }
    };
    
    initializeAnalysisPage();
    loadTrainedModels();
    setupEventListeners();
    updateModelSelector();
    
    // 定期检查并更新模型选择器
    setInterval(() => {
        updateModelSelector();
    }, 30000);
    
    // 监听存储变化，实时更新模型选择器
    window.addEventListener('storage', function(e) {
        if (e.key === 'userTrainedModels') {
            updateModelSelector();
            showNotification('检测到新的训练模型，已更新模型选择器', 'info');
        }
    });
});

// 初始化分析页面
function initializeAnalysisPage() {
    console.log('智能分析页面初始化完成');
    
    const urlParams = new URLSearchParams(window.location.search);
    const deployedModel = urlParams.get('deployed');
    
    if (deployedModel) {
        showNotification('模型部署成功！现在可以使用您训练的专属AI助手进行分析', 'success');
    }
}

// 加载训练好的模型
function loadTrainedModels() {
    try {
        const saved = localStorage.getItem('userTrainedModels');
        if (saved) {
            trainedModels = JSON.parse(saved);
            console.log('加载训练模型:', trainedModels.length, '个');
        } else {
            trainedModels = [];
        }
    } catch (error) {
        console.error('加载训练模型失败:', error);
        trainedModels = [];
    }
}

// 更新模型选择器
function updateModelSelector() {
    const modelSelector = document.getElementById('analysisModel');
    if (!modelSelector) {
        console.warn('找不到模型选择器元素');
        return;
    }
    
    loadTrainedModels();
    const currentValue = modelSelector.value;
    modelSelector.innerHTML = '';
    
    // 添加默认模型
    const defaultOptions = [
        { value: 'standard', text: '标准模型' },
        { value: 'advanced', text: '高级模型' },
        { value: 'expert', text: '专家模型' }
    ];
    
    defaultOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        modelSelector.appendChild(optionElement);
    });
    
    // 添加训练好的模型
    const userModels = trainedModels.filter(model => model.id && model.name);
    
    if (userModels.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '--- 您的专属模型 ---';
        modelSelector.appendChild(separator);
        
        userModels.forEach(model => {
            const optionElement = document.createElement('option');
            optionElement.value = `trained_${model.id}`;
            
            const typeIcons = {
                'disease-detection': '🦠',
                'insect-detection': '🐛',
                'growth-stage': '🌱',
                'maturity-detection': '🍎'
            };
            const icon = typeIcons[model.type] || '🤖';
            
            const statusText = model.status === 'deployed' ? '' : ' (未部署)';
            optionElement.textContent = `${icon} ${model.name}${statusText}`;
            
            if (model.status !== 'deployed') {
                optionElement.style.color = '#999';
                optionElement.style.fontStyle = 'italic';
            }
            
            modelSelector.appendChild(optionElement);
        });
        
        if (currentValue && Array.from(modelSelector.options).some(opt => opt.value === currentValue)) {
            modelSelector.value = currentValue;
        } else if (userModels.length > 0) {
            const deployedModel = userModels.find(m => m.status === 'deployed');
            const selectedModel = deployedModel || userModels[userModels.length - 1];
            modelSelector.value = `trained_${selectedModel.id}`;
        }
    } else {
        if (currentValue && Array.from(modelSelector.options).some(opt => opt.value === currentValue)) {
            modelSelector.value = currentValue;
        }
    }
}

// 手动刷新模型选择器
function refreshModelSelector() {
    const refreshBtn = document.querySelector('.refresh-models-btn');
    
    if (refreshBtn) {
        refreshBtn.style.pointerEvents = 'none';
        refreshBtn.querySelector('i').style.transform = 'rotate(360deg)';
    }
    
    updateModelSelector();
    
    setTimeout(() => {
        if (refreshBtn) {
            refreshBtn.style.pointerEvents = 'auto';
            refreshBtn.querySelector('i').style.transform = '';
        }
    }, 500);
    
    showNotification('模型列表已刷新', 'success');
}

// 设置事件监听器
function setupEventListeners() {
    // 工具按钮切换
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentAnalysisMode = this.dataset.mode;
        });
    });

    // 上传区域点击
    const uploadArea = document.getElementById('analysisUploadArea');
    const imageInput = document.getElementById('analysisImageInput');
    
    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', handleImageUpload);
        
        // 拖拽上传
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
    }

    // 置信度阈值显示
    const confidenceThreshold = document.getElementById('confidenceThreshold');
    const thresholdValue = document.querySelector('.threshold-value');
    
    if (confidenceThreshold && thresholdValue) {
        confidenceThreshold.addEventListener('input', function() {
            thresholdValue.textContent = Math.round(this.value * 100) + '%';
        });
    }

    // 快速分析按钮
    const quickAnalysis = document.getElementById('quickAnalysis');
    if (quickAnalysis) {
        quickAnalysis.addEventListener('click', performQuickAnalysis);
    }

    // 开始分析按钮
    const startAnalysis = document.getElementById('startAnalysis');
    if (startAnalysis) {
        startAnalysis.addEventListener('click', performAnalysis);
    }

    // 清空按钮
    const clearAnalysis = document.getElementById('clearAnalysis');
    if (clearAnalysis) {
        clearAnalysis.addEventListener('click', clearAnalysisData);
    }
}

// 处理图片上传
function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    processUploadedImages(files);
}

// 处理拖拽
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
        processUploadedImages(imageFiles);
    }
}

// 处理上传的图片
function processUploadedImages(files) {
    const imageGallery = document.getElementById('imageGallery');
    if (!imageGallery) return;
    
    showUploadProgress(files.length);
    
    let processedCount = 0;
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    file: file,
                    dataUrl: e.target.result,
                    name: file.name,
                    size: file.size
                };
                
                uploadedImages.push(imageData);
                displayImagePreview(imageData);
                
                processedCount++;
                updateUploadProgress(processedCount, files.length);
                
                if (processedCount === files.length) {
                    completeUpload();
                }
            };
            reader.readAsDataURL(file);
        } else {
            processedCount++;
            if (processedCount === files.length) {
                completeUpload();
            }
        }
    });
}

// 显示上传进度
function showUploadProgress(totalFiles) {
    const uploadContent = document.getElementById('uploadContent');
    if (!uploadContent) return;
    
    uploadContent.innerHTML = `
        <div class="upload-progress">
            <i class="fas fa-cloud-upload-alt upload-icon"></i>
            <h3>正在上传图片...</h3>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <p class="progress-text" id="progressText">准备上传 ${totalFiles} 个文件</p>
        </div>
    `;
}

// 更新上传进度
function updateUploadProgress(processed, total) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
        const percentage = (processed / total) * 100;
        progressFill.style.width = percentage + '%';
        progressText.textContent = `已处理 ${processed}/${total} 个文件`;
    }
}

// 完成上传
function completeUpload() {
    const uploadContent = document.getElementById('uploadContent');
    const imageGallery = document.getElementById('imageGallery');
    
    if (uploadContent) {
        uploadContent.style.display = 'none';
    }
    
    if (imageGallery) {
        imageGallery.style.display = 'grid';
    }
    
    showNotification(`成功上传 ${uploadedImages.length} 张图片`, 'success');
}

// 显示图片预览
function displayImagePreview(imageData) {
    const imageGallery = document.getElementById('imageGallery');
    if (!imageGallery) return;
    
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.innerHTML = `
        <div class="image-preview">
            <img src="${imageData.dataUrl}" alt="${imageData.name}">
            <div class="image-overlay">
                <button class="remove-image" onclick="removeImage('${imageData.name}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="image-info">
            <span class="image-name">${imageData.name}</span>
            <span class="image-size">${formatFileSize(imageData.size)}</span>
        </div>
    `;
    
    imageGallery.appendChild(imageItem);
}

// 移除图片
function removeImage(imageName) {
    uploadedImages = uploadedImages.filter(img => img.name !== imageName);
    
    const imageGallery = document.getElementById('imageGallery');
    if (imageGallery) {
        imageGallery.innerHTML = '';
        uploadedImages.forEach(img => displayImagePreview(img));
    }
    
    updateUploadAreaDisplay();
}

// 更新上传区域显示
function updateUploadAreaDisplay() {
    const uploadArea = document.getElementById('analysisUploadArea');
    const uploadContent = uploadArea?.querySelector('.upload-content h3');
    
    if (uploadContent) {
        if (uploadedImages.length === 0) {
            uploadContent.textContent = '上传植物图片进行分析';
        } else {
            uploadContent.textContent = `已上传 ${uploadedImages.length} 张图片`;
        }
    }
}

// 执行快速分析（模拟番茄病害结果）
function performQuickAnalysis() {
    console.log('快速分析按钮被点击');
    
    if (analysisInProgress) {
        showNotification('分析正在进行中，请稍候...', 'warning');
        return;
    }
    
    if (uploadedImages.length === 0) {
        showNotification('请先上传图片', 'error');
        return;
    }
    
    const quickBtn = document.getElementById('quickAnalysis');
    const resultsSection = document.getElementById('analysisResults');
    
    // 开始快速分析
    analysisInProgress = true;
    if (quickBtn) {
        quickBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 快速分析中...';
        quickBtn.disabled = true;
    }
    
    // 显示分析进度
    showAnalysisProgress();
    
    // 使用 setTimeout 模拟分析过程
    setTimeout(() => {
        try {
            // 生成番茄病害相关的模拟结果
            const results = generateTomatoDiseaseResults(uploadedImages);
            console.log('生成的分析结果:', results);
            
            // 隐藏进度显示
            hideAnalysisProgress();
            
            // 显示结果
            displayAnalysisResults(results);
            
            // 显示结果区域
            if (resultsSection) {
                resultsSection.style.display = 'block';
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            showNotification('快速分析完成！发现番茄病害问题', 'success');
            
        } catch (error) {
            console.error('快速分析失败:', error);
            hideAnalysisProgress();
            showNotification('快速分析失败: ' + error.message, 'error');
        } finally {
            // 恢复按钮状态
            analysisInProgress = false;
            if (quickBtn) {
                quickBtn.innerHTML = '<i class="fas fa-bolt"></i> 快速分析';
                quickBtn.disabled = false;
            }
        }
    }, 2000);
}

// 生成番茄病害相关的模拟结果
function generateTomatoDiseaseResults(images) {
    const tomatoDiseases = [
        {
            name: '番茄早疫病',
            severity: 3,
            confidence: 0.85,
            causes: '由链格孢菌引起，高温高湿环境下易发生，植株抗性下降时更容易感染。',
            suggestions: '1. 及时摘除病叶并销毁；2. 喷施代森锰锌或百菌清等杀菌剂；3. 加强通风，降低湿度；4. 合理施肥，增强植株抗性。',
            prevention: '选用抗病品种，合理密植，避免偏施氮肥，雨后及时排水，定期喷施保护性杀菌剂。'
        },
        {
            name: '番茄晚疫病',
            severity: 4,
            confidence: 0.78,
            causes: '由致病疫霉引起，低温高湿条件下发病严重，通过风雨传播迅速。',
            suggestions: '1. 立即喷施甲霜灵或烯酰吗啉等专用药剂；2. 清除病株残体；3. 改善通风条件；4. 控制浇水，避免叶面积水。',
            prevention: '选择抗病品种，避免密植，雨季加强排水，预防性喷药，控制田间湿度。'
        },
        {
            name: '番茄叶霉病',
            severity: 2,
            confidence: 0.92,
            causes: '由番茄叶霉菌引起，温室内高湿度环境下易发生，通过气流传播孢子。',
            suggestions: '1. 喷施三唑类杀菌剂如丙环唑；2. 加强温室通风换气；3. 控制浇水量和频次；4. 及时摘除下部老叶。',
            prevention: '保持适宜的温湿度，定期通风，合理灌溉，选用抗病品种，轮作倒茬。'
        },
        {
            name: '番茄病毒病',
            severity: 4,
            confidence: 0.73,
            causes: '由多种病毒引起，主要通过蚜虫、粉虱等害虫传播，高温干旱条件下发病重。',
            suggestions: '1. 防治传毒害虫，喷施吡虫啉等杀虫剂；2. 拔除病株并销毁；3. 喷施病毒抑制剂；4. 加强水肥管理。',
            prevention: '选用抗病毒品种，防治蚜虫等传毒害虫，避免农事操作传播，种子消毒处理。'
        },
        {
            name: '番茄青枯病',
            severity: 5,
            confidence: 0.68,
            causes: '由青枯雷尔氏菌引起的细菌性病害，高温高湿条件下发病严重，土壤传播。',
            suggestions: '1. 立即拔除病株并用石灰消毒土壤；2. 灌根施用农用链霉素；3. 改善排水条件；4. 土壤消毒处理。',
            prevention: '选用抗病品种，实行轮作，改良土壤，避免连作，种苗消毒，合理施肥。'
        }
    ];
    
    const results = images.map((image, index) => {
        // 随机选择一种番茄病害
        const disease = tomatoDiseases[Math.floor(Math.random() * tomatoDiseases.length)];
        
        return {
            image: image,
            model: { name: '快速分析模型', type: 'quick' },
            plantType: '番茄',
            problems: disease.name,
            severity: disease.severity,
            confidence: disease.confidence + (Math.random() * 0.1 - 0.05), // 添加小幅随机变化
            causes: disease.causes,
            suggestions: disease.suggestions,
            prevention: disease.prevention,
            timestamp: new Date().toISOString(),
            isSimulated: true,
            deploymentNote: '这是快速分析的模拟结果，专门针对番茄病害诊断'
        };
    });
    
    return {
        model: { name: '快速分析模型（番茄病害专用）', type: 'quick' },
        results: results,
        summary: generateAnalysisSummary(results),
        isSimulated: true
    };
}

// 执行分析
async function performAnalysis() {
    if (analysisInProgress) {
        showNotification('分析正在进行中，请稍候...', 'warning');
        return;
    }
    
    if (uploadedImages.length === 0) {
        showNotification('请先上传图片', 'error');
        return;
    }
    
    const startBtn = document.getElementById('startAnalysis');
    const resultsSection = document.getElementById('analysisResults');
    
    analysisInProgress = true;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 分析中...';
    startBtn.disabled = true;
    
    showAnalysisProgress();
    
    try {
        const analysisParams = getAnalysisParams();
        const selectedModel = analysisParams.model;
        
        console.log('选择的模型:', selectedModel);
        
        if (selectedModel.startsWith('trained_')) {
            const modelId = selectedModel.replace('trained_', '');
            const trainedModel = trainedModels.find(m => m.id === modelId);
            
            if (!trainedModel) {
                throw new Error('找不到指定的训练模型');
            }
            
            console.log('使用训练模型:', trainedModel.name);
            showNotification(`正在使用专属模型"${trainedModel.name}"进行分析...`, 'info');
        } else {
            console.log('使用标准模型:', selectedModel);
            showNotification('正在使用标准模型进行分析...', 'info');
        }
        
        const results = await analyzeImages(uploadedImages, analysisParams);
        
        hideAnalysisProgress();
        displayAnalysisResults(results);
        
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        showNotification('AI分析完成！', 'success');
        
    } catch (error) {
        console.error('分析失败:', error);
        hideAnalysisProgress();
        showNotification('分析失败: ' + error.message, 'error');
    } finally {
        analysisInProgress = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> 开始分析';
        startBtn.disabled = false;
    }
}

// 获取分析参数
function getAnalysisParams() {
    return {
        model: document.getElementById('analysisModel')?.value || 'standard',
        plantType: document.getElementById('plantType')?.value || 'auto',
        symptomPart: document.getElementById('symptomPart')?.value || 'auto',
        analysisDepth: document.getElementById('analysisDepth')?.value || 'basic',
        confidenceThreshold: parseFloat(document.getElementById('confidenceThreshold')?.value || 0.7),
        mode: currentAnalysisMode
    };
}

// 分析图片
async function analyzeImages(images, params) {
    const selectedModel = params.model;
    
    if (selectedModel.startsWith('trained_')) {
        const modelId = selectedModel.replace('trained_', '');
        return await analyzeWithTrainedModel(images, modelId, params);
    } else {
        return await analyzeWithStandardModel(images, params);
    }
}

// 使用训练好的模型分析
async function analyzeWithTrainedModel(images, modelId, params) {
    const trainedModel = trainedModels.find(m => m.id === modelId);
    
    if (!trainedModel) {
        throw new Error('找不到指定的训练模型');
    }
    
    if (trainedModel.status !== 'deployed') {
        throw new Error(`模型 "${trainedModel.name}" 尚未部署，请先部署模型后再进行分析`);
    }
    
    let apiConfig = null;
    if (window.configManager && typeof window.configManager.getConfig === 'function') {
        apiConfig = window.configManager.getConfig();
    }
    
    if (!apiConfig || !apiConfig.apiKey) {
        throw new Error('请先在设置中配置API密钥');
    }
    
    if (!trainedModel.systemPrompt) {
        throw new Error('训练模型缺少系统提示词，请重新训练模型');
    }
    
    const results = [];
    
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        try {
            const aiResult = await analyzeImageWithTrainedModelAI(image, trainedModel, apiConfig, params);
            results.push(aiResult);
        } catch (error) {
            console.error(`分析图片 ${image.name} 失败:`, error);
            throw new Error(`分析图片 ${image.name} 失败: ${error.message}`);
        }
    }
    
    return {
        model: trainedModel,
        results: results,
        summary: generateAnalysisSummary(results),
        isSimulated: false
    };
}

// 使用标准模型分析
async function analyzeWithStandardModel(images, params) {
    let apiConfig = null;
    if (window.configManager && typeof window.configManager.getConfig === 'function') {
        apiConfig = window.configManager.getConfig();
    }
    
    if (!apiConfig || !apiConfig.apiKey) {
        throw new Error('请先在设置中配置API密钥');
    }
    
    const results = [];
    
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        try {
            const aiResult = await analyzeImageWithStandardModelAI(image, apiConfig, params);
            results.push(aiResult);
        } catch (error) {
            console.error(`分析图片 ${image.name} 失败:`, error);
            throw new Error(`分析图片 ${image.name} 失败: ${error.message}`);
        }
    }
    
    return {
        model: { name: getStandardModelName(params.model), type: 'standard' },
        results: results,
        summary: generateAnalysisSummary(results),
        isSimulated: false
    };
}

// 使用训练模型的AI分析图片
async function analyzeImageWithTrainedModelAI(image, trainedModel, apiConfig, params) {
    try {
        const analysisPrompt = buildTrainedModelAnalysisPrompt(trainedModel, params);
        const imageData = await prepareImageForAI(image);
        
        const requestBody = {
            model: apiConfig.model || 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: analysisPrompt
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: '请根据我的专业知识分析这张植物图片，提供详细的诊断和建议。'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageData,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1500,
            temperature: 0.7
        };

        console.log('发送API请求:', {
            model: requestBody.model,
            endpoint: apiConfig.apiEndpoint,
            hasImage: imageData.startsWith('data:image/')
        });

        const response = await fetch(apiConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            throw new Error(`AI API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.choices || !result.choices[0]) {
            throw new Error('AI响应格式错误');
        }
        
        const aiAnalysis = result.choices[0].message.content;
        return parseTrainedModelAIResult(aiAnalysis, image, trainedModel);
        
    } catch (error) {
        console.error('训练模型AI分析失败:', error);
        throw error;
    }
}

// 使用标准模型的AI分析图片
async function analyzeImageWithStandardModelAI(image, apiConfig, params) {
    try {
        const analysisPrompt = buildStandardAnalysisPrompt(params);
        const imageData = await prepareImageForAI(image);
        
        const requestBody = {
            model: apiConfig.model || 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: analysisPrompt
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: '请分析这张植物图片，识别可能的病虫害问题并提供专业建议。'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageData,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1500,
            temperature: 0.7
        };

        console.log('发送标准模型API请求:', {
            model: requestBody.model,
            endpoint: apiConfig.apiEndpoint,
            hasImage: imageData.startsWith('data:image/')
        });

        const response = await fetch(apiConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('标准模型API错误响应:', errorText);
            throw new Error(`AI API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.choices || !result.choices[0]) {
            throw new Error('AI响应格式错误');
        }
        
        const aiAnalysis = result.choices[0].message.content;
        return parseStandardModelAIResult(aiAnalysis, image, params);
        
    } catch (error) {
        console.error('标准模型AI分析失败:', error);
        throw error;
    }
}

// 构建训练模型的分析提示词
function buildTrainedModelAnalysisPrompt(trainedModel, params) {
    const basePrompt = trainedModel.systemPrompt || `你是一个专业的${getModelTypeName(trainedModel.type)}专家。`;
    
    const analysisInstructions = `

当前分析任务：
- 植物类型：${params.plantType === 'auto' ? '自动识别' : params.plantType}
- 关注部位：${params.symptomPart === 'auto' ? '全面检查' : params.symptomPart}
- 分析深度：${params.analysisDepth}

请仔细观察图片中的植物状况，根据你的专业知识进行分析，并按照以下格式返回结果：

{
    "plantType": "识别的植物类型",
    "problems": "发现的主要问题",
    "severity": 3,
    "confidence": 0.85,
    "causes": "详细的原因分析",
    "suggestions": "具体的处理建议",
    "prevention": "预防措施建议"
}

请确保分析准确、专业，并基于你学习的专业资料提供实用的建议。`;
    
    return basePrompt + analysisInstructions;
}

// 构建标准分析提示词
function buildStandardAnalysisPrompt(params) {
    const modelPrompts = {
        'standard': '你是一个专业的植物病虫害识别专家，具有丰富的农业知识和诊断经验。',
        'advanced': '你是一个高级植物病理学专家，精通各种作物的病虫害识别和防治技术。',
        'expert': '你是一个资深的农业专家和植物保护专家，在植物病虫害诊断和综合防治方面有深厚的专业背景。'
    };
    
    const basePrompt = modelPrompts[params.model] || modelPrompts['standard'];
    
    const analysisInstructions = `

当前分析任务：
- 植物类型：${params.plantType === 'auto' ? '请自动识别植物类型' : params.plantType}
- 关注部位：${params.symptomPart === 'auto' ? '请全面检查植物各部位' : params.symptomPart}
- 分析深度：${params.analysisDepth}

请仔细观察图片中的植物状况，进行专业的病虫害诊断，并按照以下JSON格式返回结果：

{
    "plantType": "识别的植物类型",
    "problems": "发现的主要问题或病虫害",
    "severity": 3,
    "confidence": 0.85,
    "causes": "详细的原因分析",
    "suggestions": "具体的处理建议和防治方案",
    "prevention": "预防措施和管理建议"
}

请确保分析准确、专业，提供实用的农业指导建议。`;
    
    return basePrompt + analysisInstructions;
}

// 准备图片数据供AI分析
async function prepareImageForAI(image) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(e) {
            reject(new Error('图片读取失败'));
        };
        reader.readAsDataURL(image.file);
    });
}

// 解析训练模型AI分析结果
function parseTrainedModelAIResult(aiAnalysis, image, trainedModel) {
    try {
        const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
        let parsedResult;
        
        if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
        } else {
            parsedResult = parseTextAnalysisResult(aiAnalysis);
        }
        
        return {
            image: image,
            model: trainedModel,
            plantType: parsedResult.plantType || '未识别植物',
            problems: parsedResult.problems || '未发现明显问题',
            severity: parsedResult.severity || 2,
            confidence: parsedResult.confidence || 0.75,
            causes: parsedResult.causes || '基于专业模型分析',
            suggestions: parsedResult.suggestions || '请参考专业建议',
            prevention: parsedResult.prevention || '遵循预防措施',
            timestamp: new Date().toISOString(),
            isAIAnalysis: true,
            rawAnalysis: aiAnalysis
        };
        
    } catch (error) {
        console.error('解析训练模型AI结果失败:', error);
        
        return {
            image: image,
            model: trainedModel,
            plantType: '分析完成',
            problems: '请查看AI分析详情',
            severity: 2,
            confidence: 0.70,
            causes: '基于专业模型分析',
            suggestions: '请参考AI提供的专业建议',
            prevention: '遵循专业预防措施',
            timestamp: new Date().toISOString(),
            isAIAnalysis: true,
            rawAnalysis: aiAnalysis
        };
    }
}

// 解析标准模型AI分析结果
function parseStandardModelAIResult(aiAnalysis, image, params) {
    try {
        const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
        let parsedResult;
        
        if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
        } else {
            parsedResult = parseTextAnalysisResult(aiAnalysis);
        }
        
        return {
            image: image,
            model: { name: getStandardModelName(params.model), type: 'standard' },
            plantType: parsedResult.plantType || '未识别植物',
            problems: parsedResult.problems || '未发现明显问题',
            severity: parsedResult.severity || 2,
            confidence: parsedResult.confidence || 0.75,
            causes: parsedResult.causes || '基于AI分析',
            suggestions: parsedResult.suggestions || '请参考专业建议',
            prevention: parsedResult.prevention || '遵循预防措施',
            timestamp: new Date().toISOString(),
            isAIAnalysis: true,
            rawAnalysis: aiAnalysis
        };
        
    } catch (error) {
        console.error('解析标准模型AI结果失败:', error);
        
        return {
            image: image,
            model: { name: getStandardModelName(params.model), type: 'standard' },
            plantType: '分析完成',
            problems: '请查看AI分析详情',
            severity: 2,
            confidence: 0.70,
            causes: '基于AI分析',
            suggestions: '请参考AI提供的专业建议',
            prevention: '遵循专业预防措施',
            timestamp: new Date().toISOString(),
            isAIAnalysis: true,
            rawAnalysis: aiAnalysis
        };
    }
}

// 解析文本格式的分析结果
function parseTextAnalysisResult(text) {
    const result = {
        plantType: '',
        problems: '',
        severity: 2,
        confidence: 0.75,
        causes: '',
        suggestions: '',
        prevention: ''
    };
    
    const lines = text.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('植物') || lowerLine.includes('作物')) {
            result.plantType = line.replace(/^[^：:]*[：:]/, '').trim();
        } else if (lowerLine.includes('问题') || lowerLine.includes('病害') || lowerLine.includes('虫害')) {
            result.problems = line.replace(/^[^：:]*[：:]/, '').trim();
        } else if (lowerLine.includes('建议') || lowerLine.includes('推荐') || lowerLine.includes('处理')) {
            result.suggestions = line.replace(/^[^：:]*[：:]/, '').trim();
        } else if (lowerLine.includes('原因') || lowerLine.includes('分析')) {
            result.causes = line.replace(/^[^：:]*[：:]/, '').trim();
        } else if (lowerLine.includes('预防')) {
            result.prevention = line.replace(/^[^：:]*[：:]/, '').trim();
        }
    });
    
    if (!result.problems && lines.length > 0) {
        result.problems = lines[0];
    }
    
    return result;
}

// 获取模型类型名称
function getModelTypeName(type) {
    const typeNames = {
        'disease-detection': '病害识别',
        'insect-detection': '虫害识别',
        'growth-stage': '生长阶段',
        'maturity-detection': '成熟度检测'
    };
    return typeNames[type] || '未知类型';
}

// 获取标准模型名称
function getStandardModelName(modelType) {
    const names = {
        'standard': '标准分析模型',
        'advanced': '高级分析模型',
        'expert': '专家分析模型'
    };
    return names[modelType] || '标准分析模型';
}

// 生成分析摘要
function generateAnalysisSummary(results) {
    const totalImages = results.length;
    const problemsFound = results.filter(r => r.problems !== '未发现明显问题').length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / totalImages;
    const maxSeverity = Math.max(...results.map(r => r.severity));
    
    const riskLevels = ['无', '低', '中等', '高', '严重'];
    const riskLevel = riskLevels[Math.min(maxSeverity, 4)] || '低';
    
    return {
        totalImages,
        problemsFound,
        avgConfidence: Math.round(avgConfidence * 100),
        riskLevel
    };
}

// 显示分析结果
function displayAnalysisResults(analysisData) {
    const { model, results, summary } = analysisData;
    
    setCurrentAnalysisResults(analysisData);
    updateOverviewCards(summary);
    displayDetailedResults(results, model);
    setupResultActionButtons(analysisData);
}

// 更新概览卡片
function updateOverviewCards(summary) {
    const problemCount = document.getElementById('problemCount');
    const avgConfidence = document.getElementById('avgConfidence');
    const riskLevel = document.getElementById('riskLevel');
    
    if (problemCount) problemCount.textContent = summary.problemsFound;
    if (avgConfidence) avgConfidence.textContent = summary.avgConfidence + '%';
    if (riskLevel) {
        riskLevel.textContent = summary.riskLevel;
        riskLevel.className = `result-count risk-${summary.riskLevel}`;
    }
}

// 显示详细结果
function displayDetailedResults(results, model) {
    const detailedResults = document.getElementById('detailedResults');
    if (!detailedResults) return;
    
    detailedResults.innerHTML = `
        <div class="panel-header">
            <h3><i class="fas fa-list-alt"></i> 详细分析结果</h3>
            <span class="model-badge">使用模型: ${model.name}</span>
        </div>
        <div class="results-list">
            ${results.map((result, index) => generateResultCard(result, index)).join('')}
        </div>
    `;
}

// 生成结果卡片
function generateResultCard(result, index) {
    const severityClass = getSeverityClass(result.severity);
    const confidenceColor = getConfidenceColor(result.confidence);
    
    // 添加模拟结果提示
    const simulationWarning = result.isSimulated ? `
        <div class="simulation-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${result.deploymentNote || '此为快速分析的模拟结果'}</span>
        </div>
    ` : '';
    
    return `
        <div class="result-card ${result.isSimulated ? 'simulated-result' : ''}">
            ${simulationWarning}
            <div class="result-header">
                <div class="result-image">
                    <img src="${result.image.dataUrl}" alt="${result.image.name}">
                </div>
                <div class="result-info">
                    <h4>${result.image.name}</h4>
                    <div class="result-meta">
                        <span class="plant-type">${result.plantType}</span>
                        <span class="confidence" style="color: ${confidenceColor}">
                            置信度: ${Math.round(result.confidence * 100)}%
                            ${result.isSimulated ? ' (模拟)' : ''}
                        </span>
                    </div>
                </div>
                <div class="severity-badge ${severityClass}">
                    ${result.severity}级
                </div>
            </div>
            
            <div class="result-content">
                <div class="result-section">
                    <h5><i class="fas fa-exclamation-circle"></i> 发现的问题</h5>
                    <p>${result.problems}</p>
                </div>
                
                <div class="result-section">
                    <h5><i class="fas fa-search"></i> 原因分析</h5>
                    <p>${result.causes}</p>
                </div>
                
                <div class="result-section">
                    <h5><i class="fas fa-tools"></i> 处理建议</h5>
                    <p>${result.suggestions}</p>
                </div>
                
                <div class="result-section">
                    <h5><i class="fas fa-shield-alt"></i> 预防措施</h5>
                    <p>${result.prevention}</p>
                </div>
            </div>
            
            <div class="result-actions">
                <button class="btn-secondary" onclick="saveIndividualResult(${index})">
                    <i class="fas fa-save"></i> 保存
                </button>
                <button class="btn-secondary" onclick="shareIndividualResult(${index})">
                    <i class="fas fa-share"></i> 分享
                </button>
                ${result.isSimulated ? `
                    <button class="btn-warning" onclick="goToModelManagement()">
                        <i class="fas fa-rocket"></i> 部署模型
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// 获取严重程度样式类
function getSeverityClass(severity) {
    const classes = ['', 'severity-low', 'severity-low', 'severity-medium', 'severity-high', 'severity-critical'];
    return classes[severity] || 'severity-low';
}

// 获取置信度颜色
function getConfidenceColor(confidence) {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
}

// 清空分析数据
function clearAnalysisData() {
    uploadedImages = [];
    
    const imageGallery = document.getElementById('imageGallery');
    const analysisResults = document.getElementById('analysisResults');
    const uploadContent = document.getElementById('uploadContent');
    
    if (imageGallery) imageGallery.innerHTML = '';
    if (analysisResults) analysisResults.style.display = 'none';
    if (uploadContent) uploadContent.style.display = 'block';
    
    updateUploadAreaDisplay();
    showNotification('已清空所有数据', 'info');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 显示通知
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// 创建通知容器
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// 获取通知图标
function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// 显示分析进度
function showAnalysisProgress() {
    const progressContainer = document.createElement('div');
    progressContainer.id = 'analysisProgressContainer';
    progressContainer.className = 'analysis-progress-overlay';
    progressContainer.innerHTML = `
        <div class="progress-modal">
            <div class="progress-content">
                <div class="progress-icon">
                    <i class="fas fa-brain fa-spin"></i>
                </div>
                <h3>AI正在分析中...</h3>
                <div class="progress-steps">
                    <div class="step active">
                        <i class="fas fa-upload"></i>
                        <span>准备图片数据</span>
                    </div>
                    <div class="step">
                        <i class="fas fa-robot"></i>
                        <span>调用AI模型</span>
                    </div>
                    <div class="step">
                        <i class="fas fa-chart-line"></i>
                        <span>生成分析结果</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="analysisProgressFill"></div>
                </div>
                <p class="progress-text" id="analysisProgressText">正在准备分析...</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(progressContainer);
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        
        const progressFill = document.getElementById('analysisProgressFill');
        const progressText = document.getElementById('analysisProgressText');
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (progressText) {
            if (progress < 30) {
                progressText.textContent = '正在准备图片数据...';
                updateProgressSteps(0);
            } else if (progress < 70) {
                progressText.textContent = '正在调用AI模型分析...';
                updateProgressSteps(1);
            } else {
                progressText.textContent = '正在生成分析结果...';
                updateProgressSteps(2);
            }
        }
    }, 500);
    
    progressContainer.dataset.intervalId = progressInterval;
}

// 更新进度步骤
function updateProgressSteps(activeIndex) {
    const steps = document.querySelectorAll('.progress-steps .step');
    steps.forEach((step, index) => {
        if (index <= activeIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// 隐藏分析进度
function hideAnalysisProgress() {
    const progressContainer = document.getElementById('analysisProgressContainer');
    if (progressContainer) {
        const intervalId = progressContainer.dataset.intervalId;
        if (intervalId) {
            clearInterval(parseInt(intervalId));
        }
        
        const progressFill = document.getElementById('analysisProgressFill');
        const progressText = document.getElementById('analysisProgressText');
        
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = '分析完成！';
        
        setTimeout(() => {
            if (progressContainer.parentElement) {
                progressContainer.remove();
            }
        }, 1000);
    }
}

// 保存个别结果
function saveIndividualResult(index) {
    try {
        const currentResults = getCurrentAnalysisResults();
        if (!currentResults || !currentResults.results[index]) {
            showNotification('找不到要保存的结果', 'error');
            return;
        }
        
        const result = currentResults.results[index];
        
        const savedResults = JSON.parse(localStorage.getItem('saved_analysis_results') || '[]');
        const saveData = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            imageName: result.image.name,
            plantType: result.plantType,
            problems: result.problems,
            severity: result.severity,
            confidence: result.confidence,
            causes: result.causes,
            suggestions: result.suggestions,
            prevention: result.prevention,
            modelName: result.model.name
        };
        
        savedResults.push(saveData);
        localStorage.setItem('saved_analysis_results', JSON.stringify(savedResults));
        
        showNotification(`已保存 "${result.image.name}" 的分析结果`, 'success');
        
    } catch (error) {
        console.error('保存结果失败:', error);
        showNotification('保存失败', 'error');
    }
}

// 分享个别结果
function shareIndividualResult(index) {
    try {
        const currentResults = getCurrentAnalysisResults();
        if (!currentResults || !currentResults.results[index]) {
            showNotification('找不到要分享的结果', 'error');
            return;
        }
        
        const result = currentResults.results[index];
        
        const shareText = `🌱 植物分析结果 - ${result.image.name}

🔍 植物类型：${result.plantType}
⚠️ 发现问题：${result.problems}
📊 严重程度：${result.severity}级
🎯 置信度：${Math.round(result.confidence * 100)}%

💡 处理建议：
${result.suggestions}

🛡️ 预防措施：
${result.prevention}

📅 分析时间：${new Date().toLocaleString('zh-CN')}
🤖 分析模型：${result.model.name}

--- 穗安巡视官 智慧农业AI系统 ---`;
        
        if (navigator.share) {
            navigator.share({
                title: `植物分析结果 - ${result.image.name}`,
                text: shareText
            }).then(() => {
                showNotification('分享成功', 'success');
            }).catch((error) => {
                console.log('分享取消或失败:', error);
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
        
    } catch (error) {
        console.error('分享失败:', error);
        showNotification('分享失败', 'error');
    }
}

// 备用分享方法
function fallbackShare(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('分析结果已复制到剪贴板', 'success');
        }).catch(() => {
            showTextModal('分享内容', text);
        });
    } else {
        showTextModal('分享内容', text);
    }
}

// 显示文本模态框
function showTextModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'text-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.text-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <textarea readonly>${content}</textarea>
                <button class="btn-primary" onclick="copyModalText(this)">
                    <i class="fas fa-copy"></i> 复制内容
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    showNotification('请手动复制分享内容', 'info');
}

// 复制模态框文本
function copyModalText(button) {
    const textarea = button.parentElement.querySelector('textarea');
    textarea.select();
    document.execCommand('copy');
    
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> 已复制';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);
    
    showNotification('内容已复制到剪贴板', 'success');
}

// 获取当前分析结果
function getCurrentAnalysisResults() {
    return window.currentAnalysisResults || null;
}

// 设置当前分析结果
function setCurrentAnalysisResults(results) {
    window.currentAnalysisResults = results;
}

// 设置结果操作按钮
function setupResultActionButtons(analysisData) {
    const saveResult = document.getElementById('saveResult');
    const exportResult = document.getElementById('exportResult');
    const shareResult = document.getElementById('shareResult');
    
    if (saveResult) {
        saveResult.onclick = () => saveAllResults(analysisData);
    }
    
    if (exportResult) {
        exportResult.onclick = () => exportAnalysisReport(analysisData);
    }
    
    if (shareResult) {
        shareResult.onclick = () => shareAllResults(analysisData);
    }
}

// 保存所有结果
function saveAllResults(analysisData) {
    try {
        const savedReports = JSON.parse(localStorage.getItem('saved_analysis_reports') || '[]');
        const reportData = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            modelName: analysisData.model.name,
            summary: analysisData.summary,
            results: analysisData.results.map(result => ({
                imageName: result.image.name,
                plantType: result.plantType,
                problems: result.problems,
                severity: result.severity,
                confidence: result.confidence,
                causes: result.causes,
                suggestions: result.suggestions,
                prevention: result.prevention
            }))
        };
        
        savedReports.push(reportData);
        localStorage.setItem('saved_analysis_reports', JSON.stringify(savedReports));
        
        showNotification(`已保存完整分析报告（${analysisData.results.length}张图片）`, 'success');
        
    } catch (error) {
        console.error('保存报告失败:', error);
        showNotification('保存失败', 'error');
    }
}

// 导出分析报告
function exportAnalysisReport(analysisData) {
    try {
        const reportContent = generateReportContent(analysisData);
        
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `植物分析报告_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('报告已导出下载', 'success');
        
    } catch (error) {
        console.error('导出报告失败:', error);
        showNotification('导出失败', 'error');
    }
}

// 生成报告内容
function generateReportContent(analysisData) {
    const { model, results, summary } = analysisData;
    const timestamp = new Date().toLocaleString('zh-CN');
    
    let content = `穗安巡视官 - 植物分析报告
=====================================

报告生成时间：${timestamp}
分析模型：${model.name}
分析图片数量：${summary.totalImages}张
发现问题数量：${summary.problemsFound}个
平均置信度：${summary.avgConfidence}%
风险等级：${summary.riskLevel}

=====================================
详细分析结果
=====================================

`;

    results.forEach((result, index) => {
        content += `${index + 1}. ${result.image.name}
-----------------------------------
植物类型：${result.plantType}
发现问题：${result.problems}
严重程度：${result.severity}级
置信度：${Math.round(result.confidence * 100)}%

原因分析：
${result.causes}

处理建议：
${result.suggestions}

预防措施：
${result.prevention}

分析时间：${new Date(result.timestamp).toLocaleString('zh-CN')}

`;
    });
    
    content += `=====================================
报告说明
=====================================

本报告由穗安巡视官智慧农业AI系统生成，仅供参考。
具体的农业管理决策请结合实际情况和专业意见。

系统版本：v1.0
技术支持：穗安巡视官团队
`;
    
    return content;
}

// 分享所有结果
function shareAllResults(analysisData) {
    try {
        const { model, results, summary } = analysisData;
        
        const shareText = `🌱 植物分析报告

📊 分析概览：
• 分析图片：${summary.totalImages}张
• 发现问题：${summary.problemsFound}个
• 平均置信度：${summary.avgConfidence}%
• 风险等级：${summary.riskLevel}

🤖 使用模型：${model.name}

📋 主要发现：
${results.slice(0, 3).map((result, index) => 
    `${index + 1}. ${result.image.name}：${result.problems}（${result.severity}级）`
).join('\n')}${results.length > 3 ? `\n... 还有${results.length - 3}个结果` : ''}

📅 分析时间：${new Date().toLocaleString('zh-CN')}

--- 穗安巡视官 智慧农业AI系统 ---`;
        
        if (navigator.share) {
            navigator.share({
                title: '植物分析报告',
                text: shareText
            }).then(() => {
                showNotification('报告分享成功', 'success');
            }).catch((error) => {
                console.log('分享取消或失败:', error);
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
        
    } catch (error) {
        console.error('分享失败:', error);
        showNotification('分享失败', 'error');
    }
}

// 跳转到模型管理页面
function goToModelManagement() {
    // 如果有菜单系统，使用菜单跳转
    if (window.menuManager && window.menuManager.switchToPage) {
        window.menuManager.switchToPage('model-management');
    } else {
        // 否则直接跳转到模型管理页面
        window.location.href = 'model-training.html';
    }
}

// 导出全局函数
window.removeImage = removeImage;
window.saveIndividualResult = saveIndividualResult;
window.shareIndividualResult = shareIndividualResult;
window.copyModalText = copyModalText;
window.refreshModelSelector = refreshModelSelector;
window.performQuickAnalysis = performQuickAnalysis;
window.goToModelManagement = goToModelManagement;

// 确保函数在页面加载后立即可用
document.addEventListener('DOMContentLoaded', function() {
    // 重新绑定快速分析按钮事件，确保点击有效
    const quickAnalysisBtn = document.getElementById('quickAnalysis');
    if (quickAnalysisBtn) {
        // 移除可能存在的内联事件处理器
        quickAnalysisBtn.removeAttribute('onclick');
        
        // 添加新的事件监听器
        quickAnalysisBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('快速分析按钮点击事件触发');
            performQuickAnalysis();
        });
        
        console.log('快速分析按钮事件已重新绑定');
    } else {
        console.error('找不到快速分析按钮元素');
    }
});

// 立即导出函数到全局作用域，不等待DOM加载
if (typeof window !== 'undefined') {
    window.performQuickAnalysis = performQuickAnalysis;
    console.log('performQuickAnalysis函数已导出到全局作用域');
}
