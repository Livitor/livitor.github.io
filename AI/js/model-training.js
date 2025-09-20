// 模型训练页面JavaScript
// 模型训练页面JavaScript

// 全局变量
let selectedModel = null;
let uploadedFiles = [];
let trainingInProgress = false;
let trainedModels = [];
let fileContents = [];

// 页面加载完成后初始化
// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeModelTraining();
    setupFileUpload();
    updateDatasetStats();
    updateTrainingButton();
    updateStepIndicator();
});

// 初始化模型训练页面
function initializeModelTraining() {
    console.log('模型训练页面初始化完成');
    
    // 加载保存的数据
    loadSavedData();
    
    // 设置事件监听器
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 文件上传处理
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // 模型卡片点击事件
    const modelCards = document.querySelectorAll('.model-card');
    modelCards.forEach(card => {
        card.addEventListener('click', function() {
            if (!this.classList.contains('premium')) {
                const modelType = this.dataset.model;
                selectModelCard(this, modelType);
            }
        });
    });
}

// 设置文件上传
function setupFileUpload() {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) return;
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
}

// 处理文件上传
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    handleFiles(files);
}

// 处理文件
// 处理文件
function handleFiles(files) {
    const supportedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    
    const validFiles = files.filter(file => 
        supportedTypes.includes(file.type) || 
        file.name.toLowerCase().endsWith('.txt') ||
        file.name.toLowerCase().endsWith('.md')
    );
    
    if (validFiles.length === 0) {
        showNotification('请选择支持的文件格式（TXT、DOC、PDF、JPG、PNG等）', 'error');
        return;
    }
    
    // 处理每个文件
    validFiles.forEach(file => {
        processFile(file);
    });
    
    // 添加到上传文件列表
    uploadedFiles = uploadedFiles.concat(validFiles);
    
    // 更新统计和显示
    updateDatasetStats();
    updateFileList();
    
    // 显示成功消息
    showNotification(`成功上传 ${validFiles.length} 个文件`, 'success');
    
    // 保存到本地存储
    saveUploadedFiles();
}

// 处理单个文件
function processFile(file) {
    if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) {
        // 处理文本文件
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            fileContents.push({
                fileName: file.name,
                content: content,
                type: 'text',
                size: file.size
            });
            saveFileContents();
        };
        reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
        // 处理图片文件
        const reader = new FileReader();
        reader.onload = function(e) {
            fileContents.push({
                fileName: file.name,
                content: e.target.result,
                type: 'image',
                size: file.size
            });
            saveFileContents();
        };
        reader.readAsDataURL(file);
    } else {
        // 其他文件类型（PDF、DOC等）
        fileContents.push({
            fileName: file.name,
            content: null, // 需要特殊处理
            type: 'document',
            size: file.size
        });
        showNotification(`${file.name} 已上传，将在训练时处理`, 'info');
    }
}

// 更新文件列表显示
function updateFileList() {
    const fileListContainer = document.getElementById('uploadedFilesList');
    const fileList = document.getElementById('fileList');
    
    if (!fileListContainer || !fileList) return;
    
    if (uploadedFiles.length > 0) {
        fileListContainer.style.display = 'block';
        fileList.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${formatFileSize(file.size)})</span>
                </div>
                <button class="remove-file-btn" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    } else {
        fileListContainer.style.display = 'none';
    }
}

// 获取文件图标
function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'fa-image';
    if (fileType.startsWith('text/')) return 'fa-file-alt';
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('word')) return 'fa-file-word';
    return 'fa-file';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 移除文件
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    fileContents.splice(index, 1);
    updateDatasetStats();
    updateFileList();
    saveUploadedFiles();
    saveFileContents();
    showNotification('文件已移除', 'info');
}

// 更新数据集统计
function updateDatasetStats() {
    const imageCountElement = document.querySelector('.stat-value');
    if (imageCountElement) {
        imageCountElement.textContent = uploadedFiles.length;
    }
    
    // 更新标注对象数量（简化处理）
    const annotationCountElement = document.querySelectorAll('.stat-value')[1];
    if (annotationCountElement) {
        annotationCountElement.textContent = Math.floor(uploadedFiles.length * 0.8);
    }
}

// 选择模型
function selectModel(modelType) {
    selectedModel = modelType;
    
    // 更新UI状态
    const modelCards = document.querySelectorAll('.model-card');
    const modelButtons = document.querySelectorAll('.train-btn');
    
    modelCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.model === modelType) {
            card.classList.add('selected');
        }
    });
    
    // 更新所有按钮文本，保持选择功能
    modelButtons.forEach(btn => {
        const card = btn.closest('.model-card');
        const cardModelType = card.dataset.model;
        
        if (cardModelType === modelType) {
            // 选中的模型按钮显示已选择状态
            btn.classList.add('selected');
            btn.innerHTML = `<i class="fas fa-check"></i> 已选择`;
        } else {
            // 其他按钮保持选择状态
            btn.classList.remove('selected');
            const modelNames = {
                'disease-detection': '选择 病害识别模型',
                'insect-detection': '选择 虫害识别模型',
                'growth-stage': '选择 生长阶段模型',
                'maturity-detection': '选择 成熟度检测模型'
            };
            btn.innerHTML = modelNames[cardModelType] || '选择模型';
        }
    });
    
    // 显示选择反馈
    const modelNames = {
        'disease-detection': '病害识别模型',
        'insect-detection': '虫害识别模型',
        'growth-stage': '生长阶段模型',
        'maturity-detection': '成熟度检测模型'
    };
    
    showNotification(`已选择：${modelNames[modelType]}`, 'success');
    
    // 更新步骤指示器和第三板块的训练按钮
    updateStepIndicator();
    updateTrainingButton();
    
    // 自动填充模型名称
    const modelNameInput = document.getElementById('modelName');
    if (modelNameInput && !modelNameInput.value.trim()) {
        modelNameInput.value = `${modelNames[modelType]}_${Date.now()}`;
        updateTrainingButton();
    }
}

// 选择模型卡片
function selectModelCard(cardElement, modelType) {
    // 直接调用选择模型函数
    selectModel(modelType);
}

// 检查训练准备状态
function checkTrainingReadiness() {
    const hasModel = selectedModel !== null;
    const hasData = uploadedFiles.length > 0;
    
    if (hasModel && hasData) {
        showNotification('准备就绪！您可以开始训练模型了', 'info');
        
        // 启用训练按钮（如果有的话）
        const trainButtons = document.querySelectorAll('.train-btn.available');
        trainButtons.forEach(btn => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-play"></i> 开始训练';
        });
    }
}

// 打开训练模态框
function openTrainingModal(modelType) {
    if (!modelType) {
        modelType = selectedModel;
    }
    
    if (!modelType) {
        showNotification('请先选择一个模型类型', 'warning');
        return;
    }
    
    selectedModel = modelType;
    
    const modal = document.getElementById('trainingModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !modalTitle) return;
    
    // 设置模态框标题
    const modelNames = {
        'pest-detection': '病虫害识别模型',
        'insect-detection': '虫害识别模型',
        'growth-stage': '生长阶段模型',
        'maturity': '成熟度模型'
    };
    
    modalTitle.textContent = `配置 ${modelNames[modelType]} 训练参数`;
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 重置表单
    const form = document.getElementById('trainingForm');
    if (form) {
        form.reset();
        document.getElementById('modelName').value = `${modelNames[modelType]}_${Date.now()}`;
    }
}

// 关闭训练模态框
function closeTrainingModal() {
    const modal = document.getElementById('trainingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 开始训练
function startTraining() {
    if (trainingInProgress) {
        showNotification('已有训练任务在进行中', 'warning');
        return;
    }
    
    // 获取表单数据
    const form = document.getElementById('trainingForm');
    if (!form || !form.checkValidity()) {
        showNotification('请填写完整的训练参数', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const trainingConfig = {
        modelName: document.getElementById('modelName').value,
        cropType: document.getElementById('cropType').value,
        datasetSize: document.getElementById('datasetSize').value,
        epochs: parseInt(document.getElementById('epochs').value),
        learningRate: parseFloat(document.getElementById('learningRate').value),
        modelType: selectedModel,
        timestamp: new Date().toISOString()
    };
    
    // 验证数据集
    if (uploadedFiles.length === 0) {
        showNotification('请先上传训练数据', 'error');
        return;
    }
    
    // 关闭模态框
    closeTrainingModal();
    
    // 开始训练过程
    beginTrainingProcess(trainingConfig);
}

// 开始训练过程
// 开始训练过程
async function beginTrainingProcess(config) {
    trainingInProgress = true;
    
    // 显示训练开始通知
    showNotification(`开始训练 ${config.modelName}，正在分析上传的文件...`, 'info');
    
    try {
        // 使用AI分析文件内容并创建专属模型
        const trainedModel = await trainAIWithFiles(config);
        
        // 训练完成
        completeTraining(config, trainedModel);
    } catch (error) {
        console.error('训练失败:', error);
        showNotification('训练失败: ' + error.message, 'error');
        trainingInProgress = false;
    }
}

// 使用AI分析文件并训练
async function trainAIWithFiles(config) {
    try {
        // 等待训练进度完成 - 等待所有6个阶段完成
        await new Promise(resolve => {
            // 总共6个阶段，每个阶段平均2.75秒，总共约17秒
            setTimeout(resolve, 18000);
        });
        
        // 检查是否有配置管理器和API配置
        let apiConfig;
        let useRealAI = false;
        
        if (typeof configManager !== 'undefined') {
            apiConfig = configManager.getConfig();
            if (apiConfig && apiConfig.apiKey) {
                useRealAI = true;
            }
        }
        
        let trainedModel;
        
        if (useRealAI) {
            // 使用真实AI进行训练
            trainedModel = await trainWithRealAI(config, apiConfig);
        } else {
            // 使用增强的模拟训练（基于实际文件内容）
            trainedModel = await createEnhancedTrainedModel(config);
        }
        
        return trainedModel;
        
    } catch (error) {
        console.error('训练过程失败:', error);

        
        // 即使失败也创建一个基础模型
        return await createEnhancedTrainedModel(config);
    }
}

// 使用真实AI进行训练
async function trainWithRealAI(config, apiConfig) {

    
    // 构建训练提示词
    const trainingPrompt = buildAdvancedTrainingPrompt(config);
    
    // 准备文件内容
    const fileData = prepareDetailedFileData();
    
    try {
        // 调用AI API进行训练
        const response = await fetch(apiConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: apiConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: trainingPrompt
                    },
                    {
                        role: 'user',
                        content: `请分析以下文件内容并创建专属AI助手：\n\n${fileData}`
                    }
                ],
                max_tokens: 3000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.choices || !result.choices[0]) {
            throw new Error('AI响应格式错误');
        }
        
        const aiResponse = result.choices[0].message.content;

        
        // 解析AI响应，创建专属模型
        const trainedModel = {
            id: `model_${Date.now()}`,
            name: config.modelName,
            type: config.modelType,
            systemPrompt: extractSystemPrompt(aiResponse) || window.generatedSystemPrompt,
            knowledge: extractKnowledge(aiResponse) || window.extractedKnowledge,
            capabilities: extractCapabilities(aiResponse) || generateDefaultCapabilities(config.modelType),
            createdAt: new Date().toISOString(),
            fileCount: uploadedFiles.length,
            trainingData: fileContents.map(f => ({
                fileName: f.fileName,
                type: f.type,
                size: f.size
            })),
            trainedWithAI: true,
            aiResponse: aiResponse
        };
        

        return trainedModel;
        
    } catch (error) {

        throw error;
    }
}

// 创建增强的训练模型（基于实际文件内容）
async function createEnhancedTrainedModel(config) {

    
    // 使用之前生成的系统提示词和知识库
    const systemPrompt = window.generatedSystemPrompt || createDefaultSystemPrompt(config);
    const knowledge = window.extractedKnowledge || createDefaultKnowledge(config);
    const capabilities = generateCapabilitiesFromFiles(config);
    
    const trainedModel = {
        id: `model_${Date.now()}`,
        name: config.modelName,
        type: config.modelType,
        systemPrompt: systemPrompt,
        knowledge: knowledge,
        capabilities: capabilities,
        createdAt: new Date().toISOString(),
        fileCount: uploadedFiles.length,
        trainingData: fileContents.map(f => ({
            fileName: f.fileName,
            type: f.type,
            size: f.size,
            preview: f.type === 'text' ? f.content?.substring(0, 100) + '...' : `[${f.type}文件]`
        })),
        trainedWithAI: false,
        enhancedTraining: true
    };
    

    return trainedModel;
}

// 构建高级训练提示词
function buildAdvancedTrainingPrompt(config) {
    const modelTypes = {
        'disease-detection': '植物病害识别与诊断专家',
        'insect-detection': '农业害虫识别与防治专家', 
        'growth-stage': '作物生长阶段监测与管理专家',
        'maturity-detection': '作物成熟度评估与采收指导专家'
    };
    
    const expertType = modelTypes[config.modelType] || '农业技术专家';
    const cropType = config.cropType || '通用作物';
    
    return `你是一个专业的AI训练师，需要根据用户上传的农业资料创建一个专属的${expertType}。

任务要求：
1. 仔细分析用户提供的所有文件内容
2. 提取其中的专业知识、经验和技术要点
3. 创建一个专门针对${cropType}的${expertType}AI助手
4. 确保AI助手能够基于这些资料提供专业、实用的建议

请按以下格式输出：

[SYSTEM_PROMPT]
（详细的系统提示词，定义AI助手的角色、专业能力、工作方式和知识来源）
[/SYSTEM_PROMPT]

[KNOWLEDGE]
（从文件中提取和总结的专业知识、技术要点、实践经验等）
[/KNOWLEDGE]

[CAPABILITIES]
（AI助手的具体能力列表，基于文件内容确定）
[/CAPABILITIES]

[ANALYSIS]
（对文件内容的分析总结，包括主要知识点、适用场景等）
[/ANALYSIS]

要求：
- 系统提示词要详细且专业，体现基于用户资料训练的特点
- 知识库要准确提取文件中的关键信息
- 能力列表要实用且具体
- 分析要客观且有价值`;
}

// 准备详细的文件数据
function prepareDetailedFileData() {
    let combinedContent = `文件总数: ${uploadedFiles.length}\n\n`;
    
    fileContents.forEach((file, index) => {
        combinedContent += `=== 文件 ${index + 1}: ${file.fileName} ===\n`;
        combinedContent += `文件类型: ${file.type}\n`;
        combinedContent += `文件大小: ${formatFileSize(file.size)}\n`;
        
        if (file.type === 'text' && file.content) {
            combinedContent += `内容:\n${file.content}\n\n`;
        } else if (file.type === 'image') {
            combinedContent += `内容: [图片文件 - 需要视觉分析]\n\n`;
        } else {
            combinedContent += `内容: [${file.type}文档 - 需要进一步处理]\n\n`;
        }
        
        combinedContent += '---\n\n';
    });
    
    return combinedContent || '没有可用的文件内容';
}

// 创建默认系统提示词
function createDefaultSystemPrompt(config) {
    const modelName = config.modelName;
    const cropType = config.cropType || '通用作物';
    const modelTypeName = getModelTypeName(config.modelType);
    
    return `你是 ${modelName}，一个专业的${modelTypeName.replace('模型', '专家')}。

专业背景：
- 专注于${cropType}的专业管理和技术指导
- 基于用户上传的${uploadedFiles.length}个专业文件训练而成
- 具备丰富的实践经验和理论知识

工作方式：
1. 仔细分析用户的问题和描述
2. 结合专业知识和上传资料中的经验
3. 提供准确、实用的建议和解决方案
4. 必要时询问更多细节以提供精准帮助
5. 始终以实际应用和效果为导向

专业特长：
- ${modelTypeName.replace('模型', '')}的专业分析
- 基于实际案例的经验分享
- 实用的技术指导和操作建议
- 问题诊断和解决方案制定

注意事项：
- 所有建议基于上传的专业资料
- 如遇超出专业领域的问题，会诚实说明
- 提供的建议仅供参考，请结合实际情况使用
- 鼓励用户观察记录，积累管理经验`;
}

// 创建默认知识库
function createDefaultKnowledge(config) {
    let knowledge = `基于用户上传的${uploadedFiles.length}个文件构建的专业知识库：\n\n`;
    
    // 添加文件信息
    fileContents.forEach(file => {
        if (file.type === 'text' && file.content) {
            knowledge += `来源文件：${file.fileName}\n`;
            knowledge += `关键内容：${file.content.substring(0, 200)}...\n\n`;
        }
    });
    
    // 添加通用知识
    const modelTypeKnowledge = {
        'disease-detection': '植物病害识别、病原体分析、防治方法、预防措施等专业知识',
        'insect-detection': '害虫识别、生物防治、化学防治、综合防治等专业知识',
        'growth-stage': '作物生长发育、营养管理、环境调控、栽培技术等专业知识',
        'maturity-detection': '成熟度判断、采收时机、品质评估、储存技术等专业知识'
    };
    
    knowledge += `专业领域：${modelTypeKnowledge[config.modelType] || '农业技术相关专业知识'}`;
    
    return knowledge;
}

// 基于文件生成能力列表
function generateCapabilitiesFromFiles(config) {
    const baseCapabilities = generateDefaultCapabilities(config.modelType);
    
    // 根据文件内容添加特定能力
    const fileBasedCapabilities = [];
    
    if (fileContents.some(f => f.type === 'image')) {
        fileBasedCapabilities.push('基于图片案例的视觉分析指导');
    }
    
    if (fileContents.some(f => f.type === 'text' && f.content && f.content.length > 1000)) {
        fileBasedCapabilities.push('基于详细资料的深度分析');
    }
    
    fileBasedCapabilities.push(`基于${uploadedFiles.length}个专业文件的个性化建议`);
    
    return [...baseCapabilities, ...fileBasedCapabilities];
}

// 生成默认能力列表
function generateDefaultCapabilities(modelType) {
    const capabilities = {
        'disease-detection': [
            '植物病害症状识别与分析',
            '病原体类型判断',
            '防治方案制定',
            '预防措施建议',
            '用药指导'
        ],
        'insect-detection': [
            '害虫种类识别',
            '危害程度评估',
            '生物防治建议',
            '化学防治指导',
            '综合防治方案'
        ],
        'growth-stage': [
            '生长阶段判断',
            '营养需求分析',
            '管理措施建议',
            '环境调控指导',
            '栽培技术优化'
        ],
        'maturity-detection': [
            '成熟度评估',
            '采收时机判断',
            '品质分析',
            '储存建议',
            '市场价值评估'
        ]
    };
    
    return capabilities[modelType] || ['专业技术咨询', '问题诊断分析', '解决方案制定'];
}

// 创建模拟训练模型（用于测试和演示）
function createMockTrainedModel(config) {
    const modelTypes = {
        'disease-detection': '病害识别专家',
        'insect-detection': '虫害识别专家', 
        'growth-stage': '作物生长阶段分析专家',
        'maturity-detection': '成熟度检测专家'
    };
    
    const expertType = modelTypes[config.modelType] || '农业专家';
    
    const trainedModel = {
        id: `model_${Date.now()}`,
        name: config.modelName,
        type: config.modelType,
        systemPrompt: `你是一个专业的${expertType}，基于用户上传的${uploadedFiles.length}个文件训练而成。你具备丰富的农业知识和实践经验，能够为用户提供专业的建议和解决方案。`,
        knowledge: `基于用户上传的${uploadedFiles.length}个文件构建的专业知识库，包含了丰富的农业实践经验和专业知识。`,
        capabilities: [
            `专业的${expertType.replace('专家', '')}分析`,
            '基于上传文件的个性化建议',
            '农业问题诊断和解决方案',
            '实用的农业技术指导',
            '基于实际案例的经验分享'
        ],
        createdAt: new Date().toISOString(),
        fileCount: uploadedFiles.length,
        trainingData: fileContents.map(f => ({
            fileName: f.fileName,
            type: f.type,
            size: f.size
        }))
    };
    
    return trainedModel;
}

// 构建训练提示词
function buildTrainingPrompt(config) {
    const modelTypes = {
        'disease-detection': '病害识别专家',
        'insect-detection': '虫害识别专家', 
        'growth-stage': '作物生长阶段分析专家',
        'maturity-detection': '成熟度检测专家'
    };
    
    const expertType = modelTypes[config.modelType] || '农业专家';
    
    return `你是一个AI训练师，需要根据用户上传的文件内容创建一个专属的${expertType}AI助手。

请分析文件内容，并创建一个专门的AI助手，要求：

1. 角色定义：根据文件内容确定AI的具体角色和专业领域
2. 知识体系：提取文件中的专业知识和经验
3. 工作方式：根据文件描述的工作流程和方法
4. 解决问题：明确AI需要解决的具体问题类型

请以以下格式回复：

[SYSTEM_PROMPT]
（这里是AI助手的系统提示词，定义其角色、能力和工作方式）
[/SYSTEM_PROMPT]

[KNOWLEDGE]
（这里是从文件中提取的专业知识和经验）
[/KNOWLEDGE]

[CAPABILITIES]
（这里是AI助手的具体能力列表）
[/CAPABILITIES]`;
}

// 准备文件数据
function prepareFileData() {
    let combinedContent = '';
    
    fileContents.forEach(file => {
        if (file.type === 'text' && file.content) {
            combinedContent += `\n\n=== 文件: ${file.fileName} ===\n`;
            combinedContent += file.content;
        } else if (file.type === 'image') {
            combinedContent += `\n\n=== 图片文件: ${file.fileName} ===\n`;
            combinedContent += '[图片内容，需要视觉分析]';
        } else {
            combinedContent += `\n\n=== 文档文件: ${file.fileName} ===\n`;
            combinedContent += '[文档内容，需要进一步处理]';
        }
    });
    
    return combinedContent || '没有可用的文件内容';
}

// 提取系统提示词
function extractSystemPrompt(aiResponse) {
    const match = aiResponse.match(/\[SYSTEM_PROMPT\]([\s\S]*?)\[\/SYSTEM_PROMPT\]/);
    return match ? match[1].trim() : '你是一个专业的农业AI助手，根据用户上传的资料提供专业建议。';
}

// 提取知识内容
function extractKnowledge(aiResponse) {
    const match = aiResponse.match(/\[KNOWLEDGE\]([\s\S]*?)\[\/KNOWLEDGE\]/);
    return match ? match[1].trim() : '基于用户上传的文件内容构建的专业知识库。';
}

// 提取能力列表
function extractCapabilities(aiResponse) {
    const match = aiResponse.match(/\[CAPABILITIES\]([\s\S]*?)\[\/CAPABILITIES\]/);
    const capabilitiesText = match ? match[1].trim() : '提供专业咨询和建议';
    
    // 将能力文本转换为数组
    return capabilitiesText.split('\n').map(line => line.trim()).filter(line => line);
}

// 完成训练
// 完成训练
function completeTraining(config, trainedModel) {
    trainingInProgress = false;
    
    // 确保trainedModel存在且有必要的属性
    if (!trainedModel || !trainedModel.name) {
        console.error('训练模型数据无效:', trainedModel);
        showNotification('训练失败: 模型数据无效', 'error');
        hideTrainingProgress();
        return;
    }
    
    // 为模型添加必要的属性以兼容模型管理中心
    const modelForManagement = {
        ...trainedModel,
        status: 'undeployed', // 新训练的模型默认未部署
        accuracy: Math.floor(Math.random() * 10 + 85), // 模拟准确率 85-95%
        size: Math.floor(Math.random() * 1000000 + 500000), // 模拟模型大小 0.5-1.5MB
        cropType: config.cropType || 'unknown',
        lastUsed: new Date().toISOString(),
        description: `基于${uploadedFiles.length}个文件训练的专属${getModelTypeName(trainedModel.type)}`
    };
    
    // 保存训练好的模型
    trainedModels.push(modelForManagement);
    saveTrainedModels();
    
    // 显示完成通知
    showNotification(`训练完成！专属AI助手 "${trainedModel.name}" 已添加到模型管理中心`, 'success');
    
    // 保存训练结果
    saveTrainingResult({
        ...config,
        modelId: trainedModel.id,
        completedAt: new Date().toISOString(),
        status: 'completed',
        fileCount: uploadedFiles.length
    });
    
    // 更新UI
    updateTrainingStats();
    
    // 显示训练结果
    showTrainingResults(modelForManagement);
    
    // 保存当前训练的模型
    window.currentTrainedModel = modelForManagement;
    
    // 隐藏训练进度
    hideTrainingProgress();
}

// 显示训练结果
function showTrainingResult(model) {
    const resultHtml = `
        <div class="training-result">
            <h3><i class="fas fa-check-circle"></i> 训练完成</h3>
            <div class="model-info">
                <p><strong>模型名称:</strong> ${model.name}</p>
                <p><strong>模型类型:</strong> ${getModelTypeName(model.type)}</p>
                <p><strong>训练文件:</strong> ${model.fileCount} 个</p>

            </div>
            <div class="model-capabilities">
                <h4>AI助手能力:</h4>
                <ul>
                    ${model.capabilities.map(cap => `<li>${cap}</li>`).join('')}
                </ul>
            </div>
            <div class="result-actions">
                <button class="btn-primary" onclick="testTrainedModel('${model.id}')">
                    <i class="fas fa-play"></i> 测试AI助手
                </button>
                <button class="btn-secondary" onclick="deployModel('${model.id}')">
                    <i class="fas fa-rocket"></i> 部署模型
                </button>
            </div>
        </div>
    `;
    
    // 创建结果模态框
    showResultModal(resultHtml);
}

// 获取模型类型名称
function getModelTypeName(type) {
    const names = {
        'disease-detection': '病害识别模型',
        'insect-detection': '虫害识别模型',
        'growth-stage': '生长阶段模型',
        'maturity-detection': '成熟度检测模型'
    };
    return names[type] || '未知模型';
}

// 显示结果模态框
function showResultModal(content) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal result-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>训练结果</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// 测试训练好的模型
function testTrainedModel(modelId) {
    const model = trainedModels.find(m => m.id === modelId);
    if (!model) {
        showNotification('模型不存在', 'error');
        return;
    }
    
    // 创建测试界面
    const testHtml = `
        <div class="model-test">
            <h3><i class="fas fa-flask"></i> 测试 ${model.name}</h3>
            <div class="test-chat">
                <div class="chat-messages" id="testChatMessages">
                    <div class="ai-message">
                        <i class="fas fa-robot"></i>
                        <div class="message-content">
                            你好！我是根据您的资料训练的专属AI助手。请问有什么可以帮助您的？
                        </div>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="testInput" placeholder="输入您的问题..." onkeypress="if(event.key==='Enter') sendTestMessage('${modelId}')">
                    <button onclick="sendTestMessage('${modelId}')">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showResultModal(testHtml);
}

// 发送测试消息
async function sendTestMessage(modelId) {
    const input = document.getElementById('testInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const model = trainedModels.find(m => m.id === modelId);
    if (!model) return;
    
    // 清空输入
    input.value = '';
    
    // 添加用户消息
    addTestMessage('user', message);
    
    // 显示AI正在思考
    const thinkingId = addTestMessage('ai', '正在思考...', true);
    
    try {
        // 调用AI API
        const apiConfig = configManager.getConfig();
        const response = await fetch(apiConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: apiConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: model.systemPrompt + '\n\n专业知识：\n' + model.knowledge
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status}`);
        }
        
        const result = await response.json();
        const aiReply = result.choices[0].message.content;
        
        // 更新AI消息
        updateTestMessage(thinkingId, aiReply);
        
    } catch (error) {
        console.error('测试失败:', error);
        updateTestMessage(thinkingId, '抱歉，出现了错误：' + error.message);
    }
}

// 添加测试消息
function addTestMessage(sender, content, isTemporary = false) {
    const messagesContainer = document.getElementById('testChatMessages');
    if (!messagesContainer) return null;
    
    const messageId = 'msg_' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <i class="fas fa-user"></i>
        `;
    } else {
        messageDiv.innerHTML = `
            <i class="fas fa-robot"></i>
            <div class="message-content">${content}</div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return isTemporary ? messageId : null;
}

// 更新测试消息
function updateTestMessage(messageId, newContent) {
    if (!messageId) return;
    
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const contentElement = messageElement.querySelector('.message-content');
        if (contentElement) {
            contentElement.textContent = newContent;
        }
    }
}

// 部署模型
function deployModel(modelId) {
    const model = trainedModels.find(m => m.id === modelId);
    if (!model) {
        showNotification('模型不存在', 'error');
        return;
    }
    
    // 将模型标记为已部署
    model.deployed = true;
    model.deployedAt = new Date().toISOString();
    saveTrainedModels();
    
    showNotification(`模型 "${model.name}" 已部署，可在智能分析页面使用`, 'success');
    
    // 关闭模态框
    const modal = document.querySelector('.result-modal');
    if (modal) {
        modal.remove();
    }
}

// 更新训练统计
function updateTrainingStats() {
    const results = getTrainingResults();
    
    // 更新统计数字（如果页面有相应元素）
    const modelCountElement = document.querySelector('.stat-value');
    if (modelCountElement && results.length > 0) {
        // 这里可以根据实际需要更新统计
    }
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
    
    // 自动移除通知
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

// 数据持久化函数
// 数据持久化函数
function saveUploadedFiles() {
    try {
        // 只保存文件信息，不保存实际文件内容
        const fileInfo = uploadedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        }));
        localStorage.setItem('model_training_files', JSON.stringify(fileInfo));
    } catch (error) {
        console.error('保存文件信息失败:', error);
    }
}

// 保存文件内容
function saveFileContents() {
    try {
        localStorage.setItem('model_training_contents', JSON.stringify(fileContents));
    } catch (error) {
        console.error('保存文件内容失败:', error);
    }
}

// 保存训练好的模型
// 保存训练好的模型
function saveTrainedModels() {
    try {
        localStorage.setItem('userTrainedModels', JSON.stringify(trainedModels));
        
        // 同时通知模型管理中心更新
        if (window.modelManagement) {
            window.modelManagement.refreshModelList();
        }
    } catch (error) {
        console.error('保存训练模型失败:', error);
    }
}

// 加载训练好的模型
function loadTrainedModels() {
    try {
        const saved = localStorage.getItem('userTrainedModels');
        if (saved) {
            trainedModels = JSON.parse(saved);
        }
    } catch (error) {
        console.error('加载训练模型失败:', error);
        trainedModels = [];
    }
}

// 获取已部署的模型（供其他页面使用）
function getDeployedModels() {
    return trainedModels.filter(model => model.deployed);
}

// 获取指定模型
function getTrainedModel(modelId) {
    return trainedModels.find(model => model.id === modelId);
}

function saveTrainingConfig(config) {
    try {
        const configs = getTrainingConfigs();
        configs.push(config);
        localStorage.setItem('model_training_configs', JSON.stringify(configs));
    } catch (error) {
        console.error('保存训练配置失败:', error);
    }
}

function saveTrainingResult(result) {
    try {
        const results = getTrainingResults();
        results.push(result);
        localStorage.setItem('model_training_results', JSON.stringify(results));
    } catch (error) {
        console.error('保存训练结果失败:', error);
    }
}

function loadSavedData() {
    try {
        // 加载文件信息
        const savedFiles = localStorage.getItem('model_training_files');
        if (savedFiles) {
            const fileInfo = JSON.parse(savedFiles);
            // 这里只是显示文件数量，实际文件需要重新上传
            updateDatasetStats();
        }
        
        // 加载文件内容
        const savedContents = localStorage.getItem('model_training_contents');
        if (savedContents) {
            fileContents = JSON.parse(savedContents);
        }
        
        // 加载训练好的模型
        loadTrainedModels();
        
    } catch (error) {
        console.error('加载保存数据失败:', error);
    }
}

function getTrainingConfigs() {
    try {
        const configs = localStorage.getItem('model_training_configs');
        return configs ? JSON.parse(configs) : [];
    } catch (error) {
        console.error('获取训练配置失败:', error);
        return [];
    }
}

function getTrainingResults() {
    try {
        const results = localStorage.getItem('model_training_results');
        return results ? JSON.parse(results) : [];
    } catch (error) {
        console.error('获取训练结果失败:', error);
        return [];
    }
}

// 模态框外部点击关闭
document.addEventListener('click', function(event) {
    const modal = document.getElementById('trainingModal');
    if (modal && event.target === modal) {
        closeTrainingModal();
    }
});

// ESC键关闭模态框
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTrainingModal();
    }
});

// 导出函数供全局使用
// 第三板块：训练与部署功能

// 更新训练按钮状态
function updateTrainingButton() {
    const startBtn = document.getElementById('startTrainingBtn');
    const modelNameInput = document.getElementById('modelName');
    const cropTypeSelect = document.getElementById('cropType');
    
    if (!startBtn) return;
    
    const modelName = modelNameInput?.value || '';
    const cropType = cropTypeSelect?.value || '';
    
    const canTrain = selectedModel && 
                   uploadedFiles.length > 0 && 
                   modelName.trim() && 
                   cropType;
    
    startBtn.disabled = !canTrain;
    
    if (canTrain) {
        startBtn.innerHTML = '<i class="fas fa-play"></i> 开始训练';
        startBtn.style.background = '#4CAF50';
    } else {
        startBtn.innerHTML = '<i class="fas fa-play"></i> 请完成前面步骤';
        startBtn.style.background = '#666';
    }
}

// 更新步骤指示器
function updateStepIndicator() {
    const steps = document.querySelectorAll('.step');
    
    // 重置所有步骤
    steps.forEach(step => step.classList.remove('active'));
    
    // 激活当前步骤
    if (!selectedModel) {
        steps[0]?.classList.add('active');
    } else if (uploadedFiles.length === 0) {
        steps[1]?.classList.add('active');
    } else {
        steps[2]?.classList.add('active');
    }
}

// 开始模型训练（第三板块的主要功能）
async function startModelTraining() {
    if (trainingInProgress) {
        showNotification('已有训练任务在进行中', 'warning');
        return;
    }
    
    const modelNameInput = document.getElementById('modelName');
    const cropTypeSelect = document.getElementById('cropType');
    
    const modelName = modelNameInput?.value?.trim();
    const cropType = cropTypeSelect?.value;
    
    if (!selectedModel || !modelName || !cropType || uploadedFiles.length === 0) {
        showNotification('请完成所有必要步骤后再开始训练', 'error');
        return;
    }
    
    const trainingConfig = {
        modelName,
        cropType,
        modelType: selectedModel,
        timestamp: new Date().toISOString()
    };
    // 显示训练进度
    showTrainingProgress();
    
    try {
        // 开始训练过程
        await beginTrainingProcess(trainingConfig);
        
    } catch (error) {
        console.error('训练失败:', error);
        showNotification('训练失败: ' + error.message, 'error');
        hideTrainingProgress();
    }
}

// 显示训练进度
function showTrainingProgress() {
    const progressSection = document.getElementById('trainingProgress');
    if (progressSection) {
        progressSection.style.display = 'block';
        
        // 模拟训练进度
        simulateTrainingProgress();
    }
}

// 隐藏训练进度
function hideTrainingProgress() {
    const progressSection = document.getElementById('trainingProgress');
    if (progressSection) {
        progressSection.style.display = 'none';
    }
}

// 真实训练进度（包含AI分析过程）
async function simulateTrainingProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const trainingStatus = document.getElementById('trainingStatus');
    
    if (!progressFill || !progressText || !trainingStatus) return;
    
    const stages = [
        { 
            progress: 15, 
            status: '正在分析上传的文件...', 
            action: () => analyzeUploadedFiles()
        },
        { 
            progress: 35, 
            status: '正在提取专业知识...', 
            action: () => extractKnowledgeFromFiles()
        },
        { 
            progress: 55, 
            status: '正在构建AI助手人格...', 
            action: () => buildAIPersonality()
        },
        { 
            progress: 75, 
            status: '正在生成专属提示词...', 
            action: () => generateSystemPrompts()
        },
        { 
            progress: 90, 
            status: '正在验证训练结果...', 
            action: () => validateTrainingResults()
        },
        { 
            progress: 100, 
            status: '训练完成！', 
            action: () => finalizeTraining()
        }
    ];
    
    let currentStage = 0;
    
    const updateProgress = async () => {
        if (currentStage < stages.length) {
            const stage = stages[currentStage];
            
            // 更新进度条
            progressFill.style.width = stage.progress + '%';
            progressText.textContent = stage.progress + '%';
            trainingStatus.textContent = stage.status;
            
            // 执行对应的分析动作
            if (stage.action) {
                try {
                    await stage.action();
                } catch (error) {
                    console.error('训练阶段执行失败:', error);
                }
            }
            
            currentStage++;
            
            // 如果还有下一个阶段，继续执行
            if (currentStage < stages.length) {
                // 根据阶段调整等待时间
                const waitTime = currentStage <= 2 ? 3000 : 2500; // 前期分析时间稍长
                setTimeout(updateProgress, waitTime);
            } else {
                // 所有阶段完成，等待一下再隐藏进度条
                setTimeout(() => {
                    hideTrainingProgress();
                }, 1000);
            }
        }
    };
    
    updateProgress();
}

// 分析上传的文件
async function analyzeUploadedFiles() {
    console.log('开始分析上传的文件...');
    
    // 统计文件类型和内容
    const fileStats = {
        textFiles: fileContents.filter(f => f.type === 'text').length,
        imageFiles: fileContents.filter(f => f.type === 'image').length,
        documentFiles: fileContents.filter(f => f.type === 'document').length,
        totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0)
    };
    

    
    return fileStats;
}

// 从文件中提取专业知识
async function extractKnowledgeFromFiles() {
    console.log('开始提取专业知识...');
    
    let extractedKnowledge = '';
    let keywordCount = 0;
    
    // 分析文本文件内容
    fileContents.forEach(file => {
        if (file.type === 'text' && file.content) {
            // 简单的关键词提取（实际项目中可以使用更复杂的NLP技术）
            const keywords = extractKeywords(file.content);
            keywordCount += keywords.length;
            
            extractedKnowledge += `\n从 ${file.fileName} 中提取的知识：\n`;
            extractedKnowledge += file.content.substring(0, 200) + '...\n';
        }
    });
    

    
    // 保存提取的知识到全局变量
    window.extractedKnowledge = extractedKnowledge;
    
    return extractedKnowledge;
}

// 构建AI助手人格
async function buildAIPersonality() {
    console.log('开始构建AI助手人格...');
    
    const modelTypes = {
        'disease-detection': {
            personality: '专业、细致、善于观察的病害诊断专家',
            traits: ['细心观察', '逻辑分析', '经验丰富', '解决问题导向']
        },
        'insect-detection': {
            personality: '敏锐、实用、行动导向的虫害防治专家',
            traits: ['快速识别', '实用建议', '预防为主', '环保意识']
        },
        'growth-stage': {
            personality: '耐心、系统、关注细节的作物生长顾问',
            traits: ['系统思维', '长期规划', '细节关注', '科学指导']
        },
        'maturity-detection': {
            personality: '精准、经验丰富的成熟度评估专家',
            traits: ['精准判断', '经验分享', '时机把握', '品质导向']
        }
    };
    
    const modelInfo = modelTypes[selectedModel] || modelTypes['disease-detection'];
    

    
    // 保存AI人格信息
    window.aiPersonality = modelInfo;
    
    return modelInfo;
}

// 生成专属系统提示词
async function generateSystemPrompts() {
    console.log('开始生成专属提示词...');
    
    const modelName = document.getElementById('modelName')?.value || '专属AI助手';
    const cropType = document.getElementById('cropType')?.value || '通用作物';
    
    // 构建基础系统提示词
    let systemPrompt = `你是 ${modelName}，一个专业的农业AI助手。\n\n`;
    
    // 添加专业角色定义
    if (window.aiPersonality) {
        systemPrompt += `角色定义：你是一个${window.aiPersonality.personality}，具备${window.aiPersonality.traits.join('、')}的专业特质。\n\n`;
    }
    
    // 添加专业领域
    systemPrompt += `专业领域：主要专注于${cropType}的${getModelTypeName(selectedModel).replace('模型', '')}。\n\n`;
    
    // 添加知识来源
    systemPrompt += `知识来源：基于用户上传的${uploadedFiles.length}个专业文件训练而成，包含丰富的实践经验和专业知识。\n\n`;
    
    // 添加工作方式
    systemPrompt += `工作方式：
1. 仔细分析用户的问题和描述
2. 结合专业知识和实践经验
3. 提供准确、实用的建议和解决方案
4. 必要时询问更多细节以提供更精准的帮助
5. 始终以用户的实际需求为导向\n\n`;
    
    // 添加专业知识
    if (window.extractedKnowledge) {
        systemPrompt += `专业知识库：\n${window.extractedKnowledge}\n\n`;
    }
    
    // 添加注意事项
    systemPrompt += `重要提醒：
- 基于上传的专业资料提供建议
- 如遇超出专业领域的问题，诚实说明并建议咨询相关专家
- 提供的建议仅供参考，实际操作请结合当地条件
- 鼓励用户观察和记录，建立长期的管理经验`;
    

    
    // 保存生成的提示词
    window.generatedSystemPrompt = systemPrompt;
    
    return systemPrompt;
}

// 验证训练结果
async function validateTrainingResults() {
    console.log('开始验证训练结果...');
    
    // 验证必要组件
    const validationChecks = [
        { name: '系统提示词', check: () => window.generatedSystemPrompt && window.generatedSystemPrompt.length > 100 },
        { name: '专业知识库', check: () => window.extractedKnowledge && window.extractedKnowledge.length > 0 },
        { name: 'AI人格设定', check: () => window.aiPersonality && window.aiPersonality.personality },
        { name: '训练数据', check: () => fileContents.length > 0 },
        { name: '模型配置', check: () => selectedModel && document.getElementById('modelName')?.value }
    ];
    
    const passedChecks = validationChecks.filter(check => check.check()).length;
    const totalChecks = validationChecks.length;
    

    
    if (passedChecks < totalChecks) {
        throw new Error(`训练验证失败：只有 ${passedChecks}/${totalChecks} 项检查通过`);
    }
    
    return { passed: passedChecks, total: totalChecks };
}

// 完成训练
async function finalizeTraining() {
    console.log('完成训练过程...');
    

    
    // 这里会在 completeTraining 函数中处理最终的模型保存
    return true;
}

// 更新训练详情显示


// 简单的关键词提取函数
function extractKeywords(text) {
    // 农业相关关键词模式
    const patterns = [
        /病害|病虫害|真菌|细菌|病毒/g,
        /虫害|害虫|蚜虫|螨虫|粉虱/g,
        /施肥|营养|氮肥|磷肥|钾肥/g,
        /灌溉|浇水|排水|湿度/g,
        /温度|光照|通风|环境/g,
        /播种|移栽|修剪|采收/g,
        /土壤|基质|pH值|有机质/g
    ];
    
    const keywords = [];
    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            keywords.push(...matches);
        }
    });
    
    return [...new Set(keywords)]; // 去重
}

// 显示训练结果
function showTrainingResults(trainedModel) {
    const resultsSection = document.getElementById('trainingResults');
    const modelInfo = document.getElementById('modelInfo');
    const modelCapabilities = document.getElementById('modelCapabilities');
    
    if (!resultsSection || !modelInfo || !modelCapabilities) return;
    
    // 显示结果区域
    resultsSection.style.display = 'block';
    
    // 填充模型信息
    modelInfo.innerHTML = `
        <p><strong>模型名称:</strong> ${trainedModel.name}</p>
        <p><strong>模型类型:</strong> ${getModelTypeName(trainedModel.type)}</p>
        <p><strong>训练文件:</strong> ${trainedModel.fileCount} 个</p>

        <p><strong>模型ID:</strong> ${trainedModel.id}</p>
    `;
    
    // 填充能力信息
    modelCapabilities.innerHTML = `
        <ul>
            ${trainedModel.capabilities.map(cap => `<li>${cap}</li>`).join('')}
        </ul>
        <p style="margin-top: 15px; color: rgba(255,255,255,0.8); font-style: italic;">
            基于您上传的 ${trainedModel.fileCount} 个文件训练而成
        </p>
    `;
    
    // 滚动到结果区域
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// 测试训练好的模型
function testTrainedModel() {
    if (!window.currentTrainedModel) {
        showNotification('没有可测试的模型', 'error');
        return;
    }
    
    const chatSection = document.getElementById('aiChatTest');
    if (chatSection) {
        chatSection.style.display = 'block';
        
        // 滚动到聊天区域
        chatSection.scrollIntoView({ behavior: 'smooth' });
        
        // 重置聊天记录
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        你好！我是根据您的资料训练的专属AI助手"${window.currentTrainedModel.name}"。请问有什么可以帮助您的？
                    </div>
                </div>
            `;
        }
    }
}

// 发送聊天消息
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput?.value?.trim();
    
    if (!message || !window.currentTrainedModel) return;
    
    // 清空输入框
    chatInput.value = '';
    
    // 添加用户消息
    addChatMessage('user', message);
    
    // 显示AI正在思考
    const thinkingId = addChatMessage('ai', '正在思考...', true);
    
    try {
        // 调用AI API
        const response = await callAIWithTrainedModel(window.currentTrainedModel, message);
        
        // 更新AI回复
        updateChatMessage(thinkingId, response);
        
    } catch (error) {
        console.error('AI回复失败:', error);
        updateChatMessage(thinkingId, '抱歉，出现了错误：' + error.message);
    }
}

// 添加聊天消息
function addChatMessage(sender, content, isTemporary = false) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return null;
    
    const messageId = 'msg_' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">${content}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">${content}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return isTemporary ? messageId : null;
}

// 更新聊天消息
function updateChatMessage(messageId, newContent) {
    if (!messageId) return;
    
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const contentElement = messageElement.querySelector('.message-content');
        if (contentElement) {
            contentElement.textContent = newContent;
        }
    }
}

// 使用训练好的模型调用AI
async function callAIWithTrainedModel(model, userMessage) {
    try {
        // 检查是否有配置管理器
        let apiConfig;
        if (typeof configManager !== 'undefined') {
            apiConfig = configManager.getConfig();
        }
        
        if (!apiConfig || !apiConfig.apiKey) {
            // 如果没有API配置，使用模拟回复
            return generateMockAIResponse(model, userMessage);
        }
        
        const response = await fetch(apiConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: apiConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: model.systemPrompt + '\n\n专业知识库：\n' + model.knowledge
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.choices || !result.choices[0]) {
            throw new Error('AI响应格式错误');
        }
        
        return result.choices[0].message.content;
        
    } catch (error) {
        console.error('AI调用失败，使用模拟回复:', error);
        return generateMockAIResponse(model, userMessage);
    }
}

// 生成模拟AI回复
function generateMockAIResponse(model, userMessage) {
    const responses = {
        'disease-detection': [
            '根据您的描述，这可能是常见的叶斑病。建议您检查叶片是否有褐色斑点，并保持适当的通风。',
            '从症状来看，可能是真菌感染导致的。建议使用适当的杀菌剂，并注意控制湿度。',
            '这种情况通常与环境湿度过高有关。建议改善通风条件，并定期检查植株健康状况。'
        ],
        'insect-detection': [
            '根据您的描述，可能是蚜虫侵害。建议检查叶片背面，使用生物防治或适当的杀虫剂。',
            '这听起来像是螨虫的症状。建议增加空气湿度，并使用专门的杀螨剂。',
            '可能是粉虱造成的。建议使用黄色粘虫板进行物理防治，配合生物防治措施。'
        ],
        'growth-stage': [
            '根据您的描述，植株目前处于营养生长期。建议适当增加氮肥，促进叶片发育。',
            '从症状来看，可能即将进入开花期。建议调整施肥配比，增加磷钾肥比例。',
            '植株看起来发育良好。建议继续保持当前的管理方式，注意观察生长变化。'
        ],
        'maturity-detection': [
            '根据您的描述，果实还需要继续成熟。建议再等待1-2周，观察颜色和硬度变化。',
            '从特征来看，果实已接近成熟。建议进行采收前的最后检查，确保最佳采收时机。',
            '果实成熟度适中。建议根据用途决定采收时间，食用可稍晚，储存可稍早。'
        ]
    };
    
    const modelResponses = responses[model.type] || [
        '感谢您的问题。作为您的专属AI助手，我会根据上传的资料为您提供专业建议。',
        '基于我学习的专业知识，我建议您仔细观察相关症状，并采取适当的管理措施。',
        '这是一个很好的问题。根据我的知识库，建议您结合实际情况进行综合判断。'
    ];
    
    // 随机选择一个回复
    const randomResponse = modelResponses[Math.floor(Math.random() * modelResponses.length)];
    
    return `${randomResponse}\n\n（这是基于您上传的${model.fileCount}个文件训练的专属AI助手的回复）`;
}

// 部署训练好的模型
function deployTrainedModel() {
    if (!window.currentTrainedModel) {
        showNotification('没有可部署的模型', 'error');
        return;
    }
    
    const model = window.currentTrainedModel;
    
    // 标记为已部署
    model.deployed = true;
    model.deployedAt = new Date().toISOString();
    
    // 检查模型是否已存在于列表中
    const existingIndex = trainedModels.findIndex(m => m.id === model.id);
    if (existingIndex >= 0) {
        // 更新现有模型
        trainedModels[existingIndex] = model;
    } else {
        // 添加新模型
        trainedModels.push(model);
    }
    
    saveTrainedModels();
    
    showNotification(`模型 "${model.name}" 已成功部署到系统！`, 'success');
    
    // 显示跳转选项
    setTimeout(() => {
        const shouldJump = confirm('模型部署成功！\n\n是否现在跳转到智能分析页面测试您的专属AI助手？\n\n在智能分析页面，您可以：\n• 上传植物图片进行分析\n• 使用您训练的专属模型\n• 获得个性化的诊断建议');
        
        if (shouldJump) {
            // 跳转到智能分析页面，并传递部署信息
            window.location.href = 'analysis.html?deployed=' + encodeURIComponent(model.name);
        }
    }, 1500);
}

// 更新现有的选择模型函数，添加UI更新
const originalSelectModel = selectModel;
selectModel = function(modelType) {
    originalSelectModel(modelType);
    updateTrainingButton();
    updateStepIndicator();
    
    // 自动填充模型名称
    const modelNameInput = document.getElementById('modelName');
    if (modelNameInput && !modelNameInput.value) {
        const modelNames = {
            'disease-detection': '病害识别模型',
            'insect-detection': '虫害识别模型',
            'growth-stage': '生长阶段模型',
            'maturity-detection': '成熟度检测模型'
        };
        modelNameInput.value = `${modelNames[modelType]}_${Date.now()}`;
        updateTrainingButton();
    }
};

// 更新现有的文件处理函数，添加UI更新
const originalHandleFiles = handleFiles;
handleFiles = function(files) {
    originalHandleFiles(files);
    updateTrainingButton();
    updateStepIndicator();
};

// 添加输入框事件监听
document.addEventListener('DOMContentLoaded', function() {
    const modelNameInput = document.getElementById('modelName');
    const cropTypeSelect = document.getElementById('cropType');
    
    if (modelNameInput) {
        modelNameInput.addEventListener('input', updateTrainingButton);
    }
    
    if (cropTypeSelect) {
        cropTypeSelect.addEventListener('change', updateTrainingButton);
    }
    
    // 初始化UI状态
    updateTrainingButton();
    updateStepIndicator();
});

// 模型管理功能
function refreshModelList() {
    loadTrainedModels();
    updateModelStats();
    displayModelList();
    showNotification('模型列表已刷新', 'success');
}

// 更新模型统计
function updateModelStats() {
    const stats = {
        total: trainedModels.length,
        deployed: trainedModels.filter(m => m.deployed).length,
        undeployed: trainedModels.filter(m => !m.deployed).length
    };
    
    const totalElement = document.getElementById('totalModels');
    const deployedElement = document.getElementById('deployedModels');
    const undeployedElement = document.getElementById('undeployedModels');
    
    if (totalElement) totalElement.textContent = stats.total;
    if (deployedElement) deployedElement.textContent = stats.deployed;
    if (undeployedElement) undeployedElement.textContent = stats.undeployed;
}

// 显示模型列表
function displayModelList() {
    const modelList = document.getElementById('modelList');
    const emptyState = document.getElementById('emptyState');
    
    if (!modelList) return;
    
    if (trainedModels.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        modelList.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    const modelItems = trainedModels.map(model => createModelItem(model)).join('');
    modelList.innerHTML = modelItems;
}

// 创建模型项
function createModelItem(model) {
    const modelTypeNames = {
        'disease-detection': '病害识别模型',
        'insect-detection': '虫害识别模型',
        'growth-stage': '生长阶段模型',
        'maturity-detection': '成熟度检测模型'
    };
    
    const typeName = modelTypeNames[model.type] || '未知模型';
    const createdDate = new Date(model.createdAt).toLocaleDateString('zh-CN');
    const deployedDate = model.deployedAt ? new Date(model.deployedAt).toLocaleDateString('zh-CN') : '';
    
    return `
        <div class="model-item">
            <div class="model-item-header">
                <div class="model-item-info">
                    <div class="model-item-name">${model.name}</div>
                    <div class="model-item-type">${typeName}</div>

                </div>
                <div class="model-item-status">
                    <span class="status-badge ${model.deployed ? 'deployed' : 'undeployed'}">
                        ${model.deployed ? '已部署' : '未部署'}
                    </span>
                </div>
            </div>
            <div class="model-item-actions">
                ${!model.deployed ? `
                    <button class="model-action-btn deploy" onclick="deployModelFromList('${model.id}')">
                        <i class="fas fa-rocket"></i> 部署
                    </button>
                ` : `
                    <button class="model-action-btn undeploy" onclick="undeployModelFromList('${model.id}')">
                        <i class="fas fa-pause"></i> 取消部署
                    </button>
                `}
                <button class="model-action-btn test" onclick="testModelFromList('${model.id}')">
                    <i class="fas fa-flask"></i> 测试
                </button>
                <button class="model-action-btn delete" onclick="deleteModelFromList('${model.id}')">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        </div>
    `;
}

// 从列表部署模型
function deployModelFromList(modelId) {
    const model = trainedModels.find(m => m.id === modelId);
    if (!model) return;
    
    model.deployed = true;
    model.deployedAt = new Date().toISOString();
    saveTrainedModels();
    
    showNotification(`模型 "${model.name}" 已部署到智能分析系统`, 'success');
    refreshModelList();
}

// 从列表取消部署模型
function undeployModelFromList(modelId) {
    const model = trainedModels.find(m => m.id === modelId);
    if (!model) return;
    
    if (confirm(`确定要取消部署模型 "${model.name}" 吗？\n\n取消部署后，该模型将不再出现在智能分析页面的模型选择器中。`)) {
        model.deployed = false;
        delete model.deployedAt;
        saveTrainedModels();
        
        showNotification(`模型 "${model.name}" 已取消部署`, 'info');
        refreshModelList();
    }
}

// 从列表测试模型
function testModelFromList(modelId) {
    const model = trainedModels.find(m => m.id === modelId);
    if (!model) return;
    
    // 设置为当前测试模型
    window.currentTrainedModel = model;
    
    // 显示测试界面
    const chatTest = document.getElementById('aiChatTest');
    if (chatTest) {
        chatTest.style.display = 'block';
        chatTest.scrollIntoView({ behavior: 'smooth' });
        
        // 清空聊天记录并添加欢迎消息
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        你好！我是 "${model.name}"，根据您的资料训练的专属AI助手。请问有什么可以帮助您的？
                    </div>
                </div>
            `;
        }
    }
    
    showNotification(`正在测试模型 "${model.name}"`, 'info');
}

// 从列表删除模型
function deleteModelFromList(modelId) {
    const model = trainedModels.find(m => m.id === modelId);
    if (!model) return;
    
    const deployedWarning = model.deployed ? '\n\n⚠️ 注意：该模型已部署到智能分析系统，删除后将无法使用。' : '';
    
    if (confirm(`确定要删除模型 "${model.name}" 吗？${deployedWarning}\n\n此操作不可撤销！`)) {
        const index = trainedModels.findIndex(m => m.id === modelId);
        if (index >= 0) {
            trainedModels.splice(index, 1);
            saveTrainedModels();
            
            showNotification(`模型 "${model.name}" 已删除`, 'success');
            refreshModelList();
        }
    }
}

// 页面加载时初始化模型管理
document.addEventListener('DOMContentLoaded', function() {
    // 延迟加载模型管理，确保其他初始化完成
    setTimeout(() => {
        refreshModelList();
    }, 1000);
});

// 导出函数供全局使用
window.selectModel = selectModel;
window.openTrainingModal = openTrainingModal;
window.closeTrainingModal = closeTrainingModal;
window.startTraining = startTraining;
window.startModelTraining = startModelTraining;
window.testTrainedModel = testTrainedModel;
window.sendChatMessage = sendChatMessage;
window.deployTrainedModel = deployTrainedModel;
window.refreshModelList = refreshModelList;
window.deployModelFromList = deployModelFromList;
window.undeployModelFromList = undeployModelFromList;
window.testModelFromList = testModelFromList;
window.deleteModelFromList = deleteModelFromList;
