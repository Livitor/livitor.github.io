/**
 * 图片上传模块
 * 支持拖拽上传、图片预览和格式验证
 */
class ImageUpload {
    constructor() {
        this.currentImage = null;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.init();
    }

    /**
     * 初始化上传功能
     */
    init() {
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const removeImageBtn = document.getElementById('removeImage');

        // 点击上传区域触发文件选择
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                imageInput.click();
            });
        }

        // 文件选择事件
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0]);
            });
        }

        // 拖拽事件
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.handleDragOver(e);
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                this.handleDragLeave(e);
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleDrop(e);
            });
        }

        // 移除图片事件
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                this.removeImage();
            });
        }
    }

    /**
     * 处理文件选择
     */
    handleFileSelect(file) {
        if (file) {
            this.processFile(file);
        }
    }

    /**
     * 处理拖拽悬停
     */
    handleDragOver(e) {
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.classList.add('dragover');
        }
    }

    /**
     * 处理拖拽离开
     */
    handleDragLeave(e) {
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.classList.remove('dragover');
        }
    }

    /**
     * 处理文件拖拽
     */
    handleDrop(e) {
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.classList.remove('dragover');
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * 处理文件
     */
    processFile(file) {
        // 验证文件类型
        if (!this.validateFileType(file)) {
            this.showError('不支持的文件格式，请上传 JPG、PNG、GIF 或 WebP 格式的图片');
            return;
        }

        // 验证文件大小
        if (!this.validateFileSize(file)) {
            this.showError(`文件大小不能超过 ${this.formatFileSize(this.maxFileSize)}`);
            return;
        }

        // 预览图片
        this.previewImage(file);
    }

    /**
     * 验证文件类型
     */
    validateFileType(file) {
        return this.supportedFormats.includes(file.type);
    }

    /**
     * 验证文件大小
     */
    validateFileSize(file) {
        return file.size <= this.maxFileSize;
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 预览图片
     */
    previewImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.displayPreview(imageData, file.name);
            this.currentImage = {
                file: file,
                data: imageData,
                name: file.name
            };
        };

        reader.onerror = () => {
            this.showError('读取图片文件失败');
        };

        reader.readAsDataURL(file);
    }

    /**
     * 显示图片预览
     */
    displayPreview(imageData, fileName) {
        const uploadArea = document.getElementById('uploadArea');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');

        if (uploadArea && imagePreview && previewImage) {
            // 隐藏上传区域
            uploadArea.style.display = 'none';
            
            // 显示预览区域
            imagePreview.style.display = 'block';
            previewImage.src = imageData;
            previewImage.alt = fileName;

            // 添加文件名显示
            this.addFileNameDisplay(fileName);
        }
    }

    /**
     * 添加文件名显示
     */
    addFileNameDisplay(fileName) {
        const imagePreview = document.getElementById('imagePreview');
        if (!imagePreview) return;

        // 移除已存在的文件名显示
        const existingFileName = imagePreview.querySelector('.file-name');
        if (existingFileName) {
            existingFileName.remove();
        }

        // 创建文件名显示元素
        const fileNameDiv = document.createElement('div');
        fileNameDiv.className = 'file-name';
        fileNameDiv.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        fileNameDiv.textContent = fileName;
        
        imagePreview.appendChild(fileNameDiv);
    }

    /**
     * 移除图片
     */
    removeImage() {
        const uploadArea = document.getElementById('uploadArea');
        const imagePreview = document.getElementById('imagePreview');

        if (uploadArea && imagePreview) {
            // 显示上传区域
            uploadArea.style.display = 'block';
            
            // 隐藏预览区域
            imagePreview.style.display = 'none';
            
            // 清除文件输入
            const imageInput = document.getElementById('imageInput');
            if (imageInput) {
                imageInput.value = '';
            }
        }

        this.currentImage = null;
    }

    /**
     * 获取当前图片
     */
    getCurrentImage() {
        return this.currentImage;
    }

    /**
     * 检查是否有图片
     */
    hasImage() {
        return this.currentImage !== null;
    }

    /**
     * 获取图片的Base64数据
     */
    getImageBase64() {
        return this.currentImage ? this.currentImage.data : null;
    }

    /**
     * 获取图片文件
     */
    getImageFile() {
        return this.currentImage ? this.currentImage.file : null;
    }

    /**
     * 压缩图片
     */
    compressImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // 计算新的尺寸
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                // 设置画布尺寸
                canvas.width = width;
                canvas.height = height;

                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);

                // 转换为Blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('图片压缩失败'));
                    }
                }, 'image/jpeg', quality);
            };

            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        // 创建错误提示元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        // 插入到上传区域
        const uploadSection = document.querySelector('.upload-section');
        if (uploadSection) {
            uploadSection.appendChild(errorDiv);

            // 3秒后自动移除
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 3000);
        }
    }

    /**
     * 显示成功信息
     */
    showSuccess(message) {
        // 创建成功提示元素
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;

        // 插入到上传区域
        const uploadSection = document.querySelector('.upload-section');
        if (uploadSection) {
            uploadSection.appendChild(successDiv);

            // 3秒后自动移除
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);
        }
    }

    /**
     * 获取支持的文件格式
     */
    getSupportedFormats() {
        return this.supportedFormats;
    }

    /**
     * 获取最大文件大小
     */
    getMaxFileSize() {
        return this.maxFileSize;
    }

    /**
     * 设置最大文件大小
     */
    setMaxFileSize(size) {
        this.maxFileSize = size;
    }

    /**
     * 清理资源
     */
    destroy() {
        this.currentImage = null;
    }
}

// 创建全局图片上传实例
const imageUpload = new ImageUpload(); 