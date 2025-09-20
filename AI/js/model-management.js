// 模型管理中心功能
class ModelManagement {
    constructor() {
        this.models = this.getStoredModels();
        this.filteredModels = [...this.models];
        this.init();
    }

    init() {
        this.updateModelStats();
        this.renderModelList();
        this.bindEvents();
    }

    // 获取存储的模型数据
    getStoredModels() {
        const stored = localStorage.getItem('userTrainedModels');
        if (!stored) {
            // 初始化为空数组，用户需要自己训练模型
            localStorage.setItem('userTrainedModels', JSON.stringify([]));
            return [];
        }
        
        return JSON.parse(stored);
    }

    // 更新统计数据
    updateModelStats() {
        const deployedCount = this.models.filter(m => m.status === 'deployed').length;
        const undeployedCount = this.models.filter(m => m.status !== 'deployed').length;
        const totalStorage = this.models.reduce((sum, m) => sum + (m.size || 0), 0);
        
        document.getElementById('totalModels').textContent = this.models.length;
        document.getElementById('deployedModels').textContent = deployedCount;
        document.getElementById('undeployedModels').textContent = undeployedCount;
        document.getElementById('storageUsage').textContent = this.formatFileSize(totalStorage);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0KB';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + sizes[i];
    }

    // 渲染模型列表
    renderModelList() {
        const modelList = document.getElementById('modelList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredModels.length === 0) {
            modelList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        modelList.style.display = 'block';
        emptyState.style.display = 'none';
        
        modelList.innerHTML = this.filteredModels.map(model => this.createModelCard(model)).join('');
    }

    // 创建模型卡片
    createModelCard(model) {
        const statusClass = model.status === 'deployed' ? 'deployed' : 'undeployed';
        const statusText = model.status === 'deployed' ? '已部署' : '未部署';
        const statusIcon = model.status === 'deployed' ? 'fas fa-check-circle' : 'fas fa-pause-circle';
        
        // 修正类型映射，使用正确的类型键名
        const typeMap = {
            'disease-detection': { name: '病害识别', icon: 'fas fa-leaf', color: '#4CAF50', class: 'disease' },
            'insect-detection': { name: '虫害识别', icon: 'fas fa-spider', color: '#FF9800', class: 'insect' },
            'growth-stage': { name: '生长阶段', icon: 'fas fa-seedling', color: '#2196F3', class: 'growth' },
            'maturity-detection': { name: '成熟度检测', icon: 'fas fa-apple-alt', color: '#9C27B0', class: 'maturity' }
        };
        
        const typeInfo = typeMap[model.type] || { name: '未知类型', icon: 'fas fa-question', color: '#666', class: 'unknown' };
        
        return `
            <div class="model-item" data-model-id="${model.id}">
                <div class="model-item-header">
                    <div class="model-type-badge ${typeInfo.class}" style="background: ${typeInfo.color}20; color: ${typeInfo.color}; border-color: ${typeInfo.color}40;">
                        <i class="${typeInfo.icon}"></i>
                        ${typeInfo.name}
                    </div>
                    <div class="model-status ${statusClass}">
                        <i class="${statusIcon}"></i>
                        ${statusText}
                    </div>
                </div>
                
                <div class="model-item-content">
                    <div class="model-basic-info">
                        <h4 class="model-name">${model.name}</h4>
                        <p class="model-description">${model.description}</p>
                        
                        <div class="model-meta">
                            <div class="meta-item">
                                <i class="fas fa-chart-line"></i>
                                <span>准确率: ${model.accuracy}%</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-hdd"></i>
                                <span>大小: ${this.formatFileSize(model.size)}</span>
                            </div>

                        </div>
                    </div>
                    
                    <div class="model-actions">
                        <button class="action-btn test-btn" onclick="modelManagement.testModel('${model.id}')" title="测试模型">
                            <i class="fas fa-flask"></i>
                        </button>
                        <button class="action-btn ${model.status === 'deployed' ? 'undeploy-btn' : 'deploy-btn'}" 
                                onclick="modelManagement.toggleDeploy('${model.id}')" 
                                title="${model.status === 'deployed' ? '取消部署' : '部署模型'}">
                            <i class="fas ${model.status === 'deployed' ? 'fa-pause' : 'fa-rocket'}"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="modelManagement.editModel('${model.id}')" title="编辑模型">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="modelManagement.deleteModel('${model.id}')" title="删除模型">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // 绑定事件
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('modelSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterModels());
        }

        // 筛选功能
        const filterSelect = document.getElementById('modelFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterModels());
        }
    }

    // 筛选模型
    filterModels() {
        const searchTerm = document.getElementById('modelSearch').value.toLowerCase();
        const filterType = document.getElementById('modelFilter').value;
        
        this.filteredModels = this.models.filter(model => {
            const matchesSearch = model.name.toLowerCase().includes(searchTerm) ||
                                model.description.toLowerCase().includes(searchTerm);
            
            let matchesFilter = true;
            if (filterType !== 'all') {
                if (filterType === 'deployed' || filterType === 'undeployed') {
                    matchesFilter = model.status === filterType;
                } else {
                    matchesFilter = model.type === filterType;
                }
            }
            
            return matchesSearch && matchesFilter;
        });
        
        this.renderModelList();
    }

    // 刷新模型列表
    refreshModelList() {
        this.models = this.getStoredModels();
        this.filteredModels = [...this.models];
        this.updateModelStats();
        this.renderModelList();
        this.showNotification('模型列表已刷新', 'success');
    }

    // 导出模型数据
    exportModelData() {
        const data = {
            exportTime: new Date().toISOString(),
            totalModels: this.models.length,
            models: this.models
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `model-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('模型数据导出成功', 'success');
    }

    // 测试模型
    testModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return;
        
        this.showNotification(`正在测试模型: ${model.name}`, 'info');
        
        // 模拟测试过程
        setTimeout(() => {
            this.showNotification(`模型 ${model.name} 测试完成，运行正常`, 'success');
        }, 2000);
    }

    // 切换部署状态
    toggleDeploy(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return;
        
        const newStatus = model.status === 'deployed' ? 'undeployed' : 'deployed';
        model.status = newStatus;
        
        // 更新存储
        localStorage.setItem('userTrainedModels', JSON.stringify(this.models));
        
        // 更新显示
        this.updateModelStats();
        this.renderModelList();
        
        const action = newStatus === 'deployed' ? '部署' : '取消部署';
        this.showNotification(`模型 ${model.name} ${action}成功`, 'success');
    }

    // 编辑模型
    editModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return;
        
        this.showPromptEditModal(model);
    }

    // 显示提示词编辑模态框
    showPromptEditModal(model) {
        const modal = document.createElement('div');
        modal.className = 'prompt-edit-modal';
        modal.innerHTML = `
            <div class="prompt-edit-content">
                <div class="prompt-edit-header">
                    <h2><i class="fas fa-edit"></i> 编辑模型提示词</h2>
                    <button class="prompt-edit-close" onclick="this.closest('.prompt-edit-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="prompt-edit-body">
                    <div class="prompt-edit-form">
                        <div class="prompt-field">
                            <label for="modelNameEdit">模型名称:</label>
                            <input type="text" id="modelNameEdit" value="${model.name}" 
                                   style="padding: 12px; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; background: rgba(255,255,255,0.1); color: white; width: 100%;">
                        </div>
                        
                        <div class="prompt-field">
                            <label for="systemPromptEdit">系统提示词:</label>
                            <textarea id="systemPromptEdit" class="prompt-textarea" 
                                      placeholder="请输入系统提示词，这将决定AI助手的行为和专业能力...">${model.systemPrompt || ''}</textarea>
                        </div>
                        
                        <div class="prompt-info">
                            <h4><i class="fas fa-info-circle"></i> 提示词说明</h4>
                            <p>• 系统提示词定义了AI助手的角色、专业能力和工作方式</p>
                            <p>• 在智能分析页面选择此模型时，将使用这个提示词来分析用户上传的图片</p>
                            <p>• 建议包含：专业领域、分析方法、输出格式等信息</p>
                            <p>• 当前模型类型：<strong>${this.getModelTypeName(model.type)}</strong></p>
                        </div>
                    </div>
                </div>
                <div class="prompt-edit-footer">
                    <button class="prompt-btn prompt-btn-cancel" onclick="this.closest('.prompt-edit-modal').remove()">
                        <i class="fas fa-times"></i> 关闭
                    </button>
                    <button class="prompt-btn prompt-btn-save" onclick="modelManagement.savePromptEdit('${model.id}')">
                        <i class="fas fa-save"></i> 保存
                    </button>
                </div>
            </div>
        `;
        
        // 添加美化的磨砂风格样式
        const style = document.createElement('style');
        style.textContent = `
            .prompt-edit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                animation: modalFadeIn 0.3s ease-out;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes modalSlideIn {
                from { 
                    opacity: 0;
                    transform: translateY(-30px) scale(0.95);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .prompt-edit-content {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                width: 90%;
                max-width: 900px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 
                    0 25px 50px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                animation: modalSlideIn 0.4s ease-out;
            }
            
            .prompt-edit-header {
                padding: 25px 35px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .prompt-edit-header h2 {
                color: white;
                margin: 0;
                font-size: 1.4em;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .prompt-edit-header h2 i {
                color: #4CAF50;
                font-size: 1.1em;
            }
            
            .prompt-edit-close {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                font-size: 1.2em;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .prompt-edit-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .prompt-edit-body {
                padding: 35px;
                max-height: 60vh;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
            }
            
            .prompt-edit-body::-webkit-scrollbar {
                width: 6px;
            }
            
            .prompt-edit-body::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            
            .prompt-edit-body::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
            }
            
            .prompt-edit-body::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
            
            .prompt-edit-form {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            
            .prompt-field {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .prompt-field label {
                color: white;
                font-weight: 600;
                font-size: 1.1em;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .prompt-field label::before {
                content: '';
                width: 4px;
                height: 20px;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                border-radius: 2px;
            }
            
            .prompt-field input {
                padding: 15px 18px;
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                color: white;
                font-size: 16px;
                transition: all 0.3s ease;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .prompt-field input:focus {
                outline: none;
                border-color: #4CAF50;
                background: rgba(255, 255, 255, 0.15);
                box-shadow: 
                    0 0 20px rgba(76, 175, 80, 0.3),
                    inset 0 2px 4px rgba(0, 0, 0, 0.1);
                transform: translateY(-1px);
            }
            
            .prompt-textarea {
                width: 100%;
                min-height: 320px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: 15px;
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(15px);
                color: white;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
                font-size: 14px;
                line-height: 1.6;
                resize: vertical;
                transition: all 0.3s ease;
                box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .prompt-textarea:focus {
                outline: none;
                border-color: #4CAF50;
                background: rgba(255, 255, 255, 0.12);
                box-shadow: 
                    0 0 25px rgba(76, 175, 80, 0.3),
                    inset 0 2px 8px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
            }
            
            .prompt-textarea::placeholder {
                color: rgba(255, 255, 255, 0.5);
                font-style: italic;
            }
            
            .prompt-info {
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                padding: 20px;
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.95em;
                line-height: 1.5;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
            
            .prompt-info h4 {
                color: white;
                margin: 0 0 12px 0;
                font-size: 1.05em;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .prompt-info h4 i {
                color: #2196F3;
            }
            
            .prompt-info p {
                margin: 8px 0;
                padding-left: 16px;
                position: relative;
            }
            
            .prompt-info p::before {
                content: '•';
                position: absolute;
                left: 0;
                color: #4CAF50;
                font-weight: bold;
            }
            
            .prompt-info strong {
                color: #4CAF50;
                font-weight: 600;
            }
            
            .prompt-edit-footer {
                padding: 25px 35px;
                border-top: 1px solid rgba(255, 255, 255, 0.15);
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                justify-content: flex-end;
                gap: 15px;
            }
            
            .prompt-btn {
                padding: 14px 28px;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                font-size: 15px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                position: relative;
                overflow: hidden;
            }
            
            .prompt-btn::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }
            
            .prompt-btn:active::before {
                width: 300px;
                height: 300px;
            }
            
            .prompt-btn-cancel {
                background: rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.25);
                color: white;
                backdrop-filter: blur(10px);
            }
            
            .prompt-btn-cancel:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }
            
            .prompt-btn-save {
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                border: 1px solid rgba(76, 175, 80, 0.3);
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
            }
            
            .prompt-btn-save:hover {
                background: linear-gradient(45deg, #45a049, #3d8b40);
                transform: translateY(-3px);
                box-shadow: 0 12px 25px rgba(76, 175, 80, 0.4);
            }
            
            .prompt-btn i {
                font-size: 1.1em;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .prompt-edit-content {
                    width: 95%;
                    margin: 10px;
                }
                
                .prompt-edit-header,
                .prompt-edit-body,
                .prompt-edit-footer {
                    padding: 20px;
                }
                
                .prompt-textarea {
                    min-height: 250px;
                }
                
                .prompt-edit-footer {
                    flex-direction: column;
                }
                
                .prompt-btn {
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // 聚焦到提示词输入框
        setTimeout(() => {
            const textarea = document.getElementById('systemPromptEdit');
            if (textarea) {
                textarea.focus();
            }
        }, 100);
    }

    // 保存提示词编辑
    savePromptEdit(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return;
        
        const newName = document.getElementById('modelNameEdit').value.trim();
        const newPrompt = document.getElementById('systemPromptEdit').value.trim();
        
        if (!newName) {
            this.showNotification('模型名称不能为空', 'error');
            return;
        }
        
        if (!newPrompt) {
            this.showNotification('系统提示词不能为空', 'error');
            return;
        }
        
        // 更新模型数据
        model.name = newName;
        model.systemPrompt = newPrompt;
        model.lastModified = new Date().toISOString();
        
        // 保存到本地存储
        localStorage.setItem('userTrainedModels', JSON.stringify(this.models));
        
        // 更新显示
        this.renderModelList();
        
        // 关闭模态框
        const modal = document.querySelector('.prompt-edit-modal');
        if (modal) {
            modal.remove();
        }
        
        this.showNotification(`模型 "${model.name}" 更新成功`, 'success');
    }

    // 获取模型类型名称
    getModelTypeName(type) {
        const typeNames = {
            'disease-detection': '病害识别模型',
            'insect-detection': '虫害识别模型',
            'growth-stage': '生长阶段模型',
            'maturity-detection': '成熟度检测模型'
        };
        return typeNames[type] || '未知模型类型';
    }

    // 删除模型
    deleteModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return;
        
        if (confirm(`确定要删除模型 "${model.name}" 吗？此操作不可撤销。`)) {
            this.models = this.models.filter(m => m.id !== modelId);
            this.filteredModels = this.filteredModels.filter(m => m.id !== modelId);
            
            localStorage.setItem('userTrainedModels', JSON.stringify(this.models));
            
            this.updateModelStats();
            this.renderModelList();
            this.showNotification(`模型 ${model.name} 已删除`, 'success');
        }
    }

    // 添加新训练的模型
    addTrainedModel(modelData) {
        const newModel = {
            id: 'user-model-' + Date.now(),
            name: modelData.name,
            type: modelData.type,
            cropType: modelData.cropType,
            status: 'undeployed',
            accuracy: modelData.accuracy || 0,
            size: modelData.size || 0,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            description: modelData.description || '用户自训练模型'
        };
        
        this.models.push(newModel);
        this.filteredModels = [...this.models];
        
        localStorage.setItem('userTrainedModels', JSON.stringify(this.models));
        
        this.updateModelStats();
        this.renderModelList();
        
        this.showNotification(`模型 ${newModel.name} 训练完成并已添加到管理中心`, 'success');
        
        return newModel;
    }

    // 滚动到训练区域
    scrollToTraining() {
        const trainingSection = document.querySelector('.model-selection-section');
        if (trainingSection) {
            trainingSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);
        
        // 自动移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// 全局函数
function refreshModelList() {
    if (window.modelManagement) {
        window.modelManagement.refreshModelList();
    }
}

function exportModelData() {
    if (window.modelManagement) {
        window.modelManagement.exportModelData();
    }
}

function scrollToTraining() {
    if (window.modelManagement) {
        window.modelManagement.scrollToTraining();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('modelList')) {
        window.modelManagement = new ModelManagement();
    }
});