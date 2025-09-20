// 模型管理器 - 用于管理训练好的模型
class ModelManager {
    constructor() {
        this.models = [];
        this.loadModels();
    }

    // 加载模型
    loadModels() {
        try {
            const saved = localStorage.getItem('trained_models');
            if (saved) {
                this.models = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载模型失败:', error);
            this.models = [];
        }
    }

    // 保存模型
    saveModels() {
        try {
            localStorage.setItem('trained_models', JSON.stringify(this.models));
        } catch (error) {
            console.error('保存模型失败:', error);
        }
    }

    // 获取所有模型
    getAllModels() {
        return this.models;
    }

    // 获取已部署的模型
    getDeployedModels() {
        return this.models.filter(model => model.deployed);
    }

    // 添加模型
    addModel(model) {
        const existingIndex = this.models.findIndex(m => m.id === model.id);
        if (existingIndex >= 0) {
            this.models[existingIndex] = model;
        } else {
            this.models.push(model);
        }
        this.saveModels();
    }

    // 删除模型
    deleteModel(modelId) {
        const index = this.models.findIndex(m => m.id === modelId);
        if (index >= 0) {
            const deletedModel = this.models.splice(index, 1)[0];
            this.saveModels();
            return deletedModel;
        }
        return null;
    }

    // 部署模型
    deployModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            model.deployed = true;
            model.deployedAt = new Date().toISOString();
            this.saveModels();
            return model;
        }
        return null;
    }

    // 取消部署模型
    undeployModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            model.deployed = false;
            delete model.deployedAt;
            this.saveModels();
            return model;
        }
        return null;
    }

    // 获取模型统计信息
    getStats() {
        const total = this.models.length;
        const deployed = this.models.filter(m => m.deployed).length;
        const byType = {};
        
        this.models.forEach(model => {
            byType[model.type] = (byType[model.type] || 0) + 1;
        });

        return {
            total,
            deployed,
            undeployed: total - deployed,
            byType
        };
    }
}

// 创建全局模型管理器实例
window.modelManager = new ModelManager();