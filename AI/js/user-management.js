/**
 * 用户管理模块
 * 实现用户管理界面的功能
 */
class UserManagement {
    constructor() {
        this.users = [
            { id: 1, username: 'admin', name: '管理员', role: 'admin', status: 'active', lastLogin: '2023-08-10 14:30' },
            { id: 2, username: 'user1', name: '张三', role: 'user', status: 'active', lastLogin: '2023-08-09 09:15' },
            { id: 3, username: 'user2', name: '李四', role: 'user', status: 'inactive', lastLogin: '2023-08-05 16:45' }
        ];
        this.roles = ['admin', 'manager', 'user', 'guest'];
        this.init();
    }

    /**
     * 初始化用户管理
     */
    init() {
        this.createModal();
        this.bindEvents();
    }

    /**
     * 创建用户管理模态框
     */
    createModal() {
        const modalHTML = `
        <div class="user-modal" id="userModal">
            <div class="user-content">
                <div class="modal-header user-header">
                    <h2 class="modal-title"><i class="fas fa-users"></i> 用户管理</h2>
                    <button class="modal-close user-close" id="closeUserModal">&times;</button>
                </div>
                <div class="modal-body user-body">
                    <div class="modal-section">
                        <h4 class="modal-section-title"><i class="fas fa-user-plus"></i> 添加用户</h4>
                        <div class="modal-form-group">
                            <label for="username">用户名</label>
                            <input type="text" id="username" placeholder="请输入用户名">
                        </div>
                        <div class="modal-form-group">
                            <label for="name">姓名</label>
                            <input type="text" id="name" placeholder="请输入姓名">
                        </div>
                        <div class="modal-form-group">
                            <label for="role">角色</label>
                            <select id="role">
                                <option value="admin">管理员</option>
                                <option value="manager">经理</option>
                                <option value="user" selected>普通用户</option>
                                <option value="guest">访客</option>
                            </select>
                        </div>
                        <div class="modal-form-group">
                            <label class="modal-checkbox-label">
                                <input type="checkbox" id="activeStatus" checked>
                                <span class="modal-checkmark"></span>
                                启用账户
                            </label>
                        </div>
                    </div>

                    <div class="modal-section">
                        <h4 class="modal-section-title"><i class="fas fa-shield-alt"></i> 权限设置</h4>
                        <div class="permission-grid">
                            <div class="permission-item">
                                <label class="modal-checkbox-label">
                                    <input type="checkbox" name="permission" value="read">
                                    <span class="modal-checkmark"></span>
                                    数据查看
                                </label>
                            </div>
                            <div class="permission-item">
                                <label class="modal-checkbox-label">
                                    <input type="checkbox" name="permission" value="write">
                                    <span class="modal-checkmark"></span>
                                    数据编辑
                                </label>
                            </div>
                            <div class="permission-item">
                                <label class="modal-checkbox-label">
                                    <input type="checkbox" name="permission" value="delete">
                                    <span class="modal-checkmark"></span>
                                    数据删除
                                </label>
                            </div>
                            <div class="permission-item">
                                <label class="modal-checkbox-label">
                                    <input type="checkbox" name="permission" value="admin">
                                    <span class="modal-checkmark"></span>
                                    系统管理
                                </label>
                            </div>
                            <div class="permission-item">
                                <label class="modal-checkbox-label">
                                    <input type="checkbox" name="permission" value="export">
                                    <span class="modal-checkmark"></span>
                                    数据导出
                                </label>
                            </div>
                            <div class="permission-item">
                                <label class="modal-checkbox-label">
                                    <input type="checkbox" name="permission" value="report">
                                    <span class="modal-checkmark"></span>
                                    报表生成
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="modal-section">
                        <h4 class="modal-section-title"><i class="fas fa-history"></i> 登录记录</h4>
                        <div class="login-history">
                            <div class="history-item">
                                <div class="history-info">
                                    <div class="history-time">2023-08-10 14:30:25</div>
                                    <div class="history-location">广州市 (192.168.1.100)</div>
                                </div>
                                <div class="history-status success">成功</div>
                            </div>
                            <div class="history-item">
                                <div class="history-info">
                                    <div class="history-time">2023-08-09 09:15:10</div>
                                    <div class="history-location">深圳市 (192.168.1.120)</div>
                                </div>
                                <div class="history-status success">成功</div>
                            </div>
                            <div class="history-item">
                                <div class="history-info">
                                    <div class="history-time">2023-08-08 16:45:33</div>
                                    <div class="history-location">未知 (192.168.1.200)</div>
                                </div>
                                <div class="history-status">失败</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer user-footer">
                    <button class="modal-btn modal-btn-secondary" id="cancelUserBtn">取消</button>
                    <button class="modal-btn modal-btn-primary" id="saveUserBtn">保存</button>
                </div>
            </div>
        </div>
        `;

        // 检查是否已存在模态框
        if (!document.getElementById('userModal')) {
            // 将模态框添加到body
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭模态框
        document.getElementById('closeUserModal')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelUserBtn')?.addEventListener('click', () => {
            this.closeModal();
        });

        // 保存用户
        document.getElementById('saveUserBtn')?.addEventListener('click', () => {
            this.saveUser();
        });

        // 点击模态框外部关闭
        document.getElementById('userModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'userModal') {
                this.closeModal();
            }
        });

        // 角色变化时更新权限
        document.getElementById('role')?.addEventListener('change', (e) => {
            this.updatePermissionsByRole(e.target.value);
        });
    }

    /**
     * 打开用户管理模态框
     */
    openModal() {
        const modal = document.getElementById('userModal');
        if (!modal) {
            this.createModal();
            this.bindEvents();
            setTimeout(() => this.openModal(), 100);
            return;
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // 重置表单
        this.resetForm();
    }

    /**
     * 关闭用户管理模态框
     */
    closeModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * 重置表单
     */
    resetForm() {
        const usernameInput = document.getElementById('username');
        const nameInput = document.getElementById('name');
        const roleSelect = document.getElementById('role');
        const activeStatus = document.getElementById('activeStatus');
        
        if (usernameInput) usernameInput.value = '';
        if (nameInput) nameInput.value = '';
        if (roleSelect) roleSelect.value = 'user';
        if (activeStatus) activeStatus.checked = true;
        
        // 重置权限
        this.updatePermissionsByRole('user');
    }

    /**
     * 根据角色更新权限
     */
    updatePermissionsByRole(role) {
        const permissions = document.querySelectorAll('input[name="permission"]');
        
        // 重置所有权限
        permissions.forEach(perm => {
            perm.checked = false;
        });
        
        // 根据角色设置权限
        switch (role) {
            case 'admin':
                permissions.forEach(perm => {
                    perm.checked = true;
                });
                break;
            case 'manager':
                permissions.forEach(perm => {
                    if (['read', 'write', 'export', 'report'].includes(perm.value)) {
                        perm.checked = true;
                    }
                });
                break;
            case 'user':
                permissions.forEach(perm => {
                    if (['read', 'export'].includes(perm.value)) {
                        perm.checked = true;
                    }
                });
                break;
            case 'guest':
                permissions.forEach(perm => {
                    if (['read'].includes(perm.value)) {
                        perm.checked = true;
                    }
                });
                break;
        }
    }

    /**
     * 保存用户
     */
    saveUser() {
        const username = document.getElementById('username')?.value;
        const name = document.getElementById('name')?.value;
        const role = document.getElementById('role')?.value;
        const status = document.getElementById('activeStatus')?.checked ? 'active' : 'inactive';
        
        // 验证表单
        if (!username || !name) {
            this.showNotification('请填写完整的用户信息', 'error');
            return;
        }
        
        // 获取选中的权限
        const selectedPermissions = [];
        document.querySelectorAll('input[name="permission"]:checked').forEach(perm => {
            selectedPermissions.push(perm.value);
        });
        
        // 创建新用户
        const newUser = {
            id: this.users.length + 1,
            username,
            name,
            role,
            status,
            lastLogin: '未登录',
            permissions: selectedPermissions
        };
        
        // 添加到用户列表
        this.users.push(newUser);
        
        // 显示成功通知
        this.showNotification('用户添加成功');
        
        // 关闭模态框
        this.closeModal();
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#f44336' : '#4CAF50',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 3秒后自动移除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 初始化用户管理
document.addEventListener('DOMContentLoaded', () => {
    window.userManagement = new UserManagement();
    
    // 绑定侧边栏用户管理按钮
    const sidebarUserBtn = document.getElementById('sidebarUserBtn');
    if (sidebarUserBtn) {
        sidebarUserBtn.addEventListener('click', () => {
            if (window.userManagement) {
                window.userManagement.openModal();
            }
        });
    }
});