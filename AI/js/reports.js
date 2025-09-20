/**
 * 统计报告页面功能模块 - 轻量化版本
 */
class ReportsManager {
    constructor() {
        this.charts = {};
        this.data = {};
        this.chartInstances = [];
        this.init();
    }

    init() {
        // 延迟加载数据和图表，提高初始加载速度
        this.bindEvents();
        
        // 使用requestIdleCallback在浏览器空闲时初始化数据
        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
                this.loadData();
                this.updateMetrics();
                this.initCharts();
            });
        } else {
            // 降级处理：使用setTimeout延迟加载
            setTimeout(() => {
                this.loadData();
                this.updateMetrics();
                this.initCharts();
            }, 100);
        }
    }

    bindEvents() {
        // 使用事件委托减少事件监听器数量
        document.addEventListener('click', (e) => {
            // 刷新按钮
            if (e.target.closest('#refreshBtn')) {
                this.refreshData();
            }
            
            // 导出报告按钮
            if (e.target.closest('#exportReportBtn')) {
                this.exportReport();
            }
            
            // 导出表格按钮
            if (e.target.closest('#exportTableBtn')) {
                this.exportTable();
            }
            
            // 刷新图表按钮
            if (e.target.closest('#refreshChartsBtn')) {
                this.refreshCharts();
            }
            
            // 导出图表按钮
            if (e.target.closest('#exportChartsBtn')) {
                this.exportCharts();
            }
            
            // 图表控制按钮
            if (e.target.classList.contains('chart-btn')) {
                const chartType = e.target.dataset.chart;
                const container = e.target.closest('.enhanced-chart-card');
                this.switchChartType(container, chartType);
            }
        });
        
        // 病虫害周期选择
        const pestPeriodSelect = document.getElementById('pestPeriodSelect');
        if (pestPeriodSelect) {
            pestPeriodSelect.addEventListener('change', (e) => {
                this.updatePestPeriod(e.target.value);
            });
        }
        
        // 作物筛选
        const cropFilterSelect = document.getElementById('cropFilterSelect');
        if (cropFilterSelect) {
            cropFilterSelect.addEventListener('change', (e) => {
                this.updateCropFilter(e.target.value);
            });
        }
        
        // 时间范围选择 - 必须单独绑定
        const timeRange = document.getElementById('timeRange');
        const customDate = document.getElementById('customDate');
        
        if (timeRange) {
            timeRange.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customDate.style.display = 'flex';
                } else {
                    customDate.style.display = 'none';
                    this.updateTimeRange(e.target.value);
                }
            });
        }

        // 自定义日期 - 必须单独绑定
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate && endDate) {
            const updateRange = this.debounce(this.updateCustomRange.bind(this), 300);
            startDate.addEventListener('change', updateRange);
            endDate.addEventListener('change', updateRange);
        }
        
        // 表格搜索 - 必须单独绑定
        const tableSearch = document.getElementById('tableSearch');
        if (tableSearch) {
            const filterTableDebounced = this.debounce(this.filterTable.bind(this), 200);
            tableSearch.addEventListener('input', filterTableDebounced);
        }
    }
    
    // 防抖函数，避免频繁触发事件
    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    loadData() {
        // 从localStorage加载数据或生成模拟数据
        const savedData = localStorage.getItem('analysisHistory');
        if (savedData) {
            try {
                this.data.records = JSON.parse(savedData);
            } catch (e) {
                console.error('解析保存的数据时出错:', e);
                this.data.records = this.generateSampleData(30); // 出错时生成较少的样本数据
            }
        } else {
            this.data.records = this.generateSampleData(30); // 减少样本数据量，提高性能
        }
        
        this.processData();
    }

    generateSampleData(count = 120) {
        // 更合理的农业数据模拟
        const diseases = [
            '稻瘟病', '纹枯病', '白叶枯病', '褐飞虱', '二化螟',
            '玉米螟', '玉米大斑病', '小麦条纹花叶病', '小麦赤霉病',
            '蚜虫', '红蜘蛛', '白粉病', '锈病', '炭疽病'
        ];
        const crops = ['水稻', '小麦', '玉米', '大豆', '棉花', '油菜'];
        const types = ['病害', '虫害', '营养缺乏', '环境问题'];
        
        // 模拟真实的农业季节性数据分布
        const cropSeasons = {
            '水稻': [0.4, 0.3, 0.2, 0.1], // 春夏秋冬的比例
            '小麦': [0.1, 0.2, 0.4, 0.3],
            '玉米': [0.2, 0.4, 0.3, 0.1],
            '大豆': [0.3, 0.3, 0.3, 0.1],
            '棉花': [0.1, 0.4, 0.4, 0.1],
            '油菜': [0.2, 0.1, 0.3, 0.4]
        };
        
        const records = [];
        for (let i = 0; i < count; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // 最近3个月数据
            
            const crop = crops[Math.floor(Math.random() * crops.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            
            // 根据作物类型选择相应的病害
            let disease;
            if (crop === '水稻') {
                disease = ['稻瘟病', '纹枯病', '白叶枯病', '褐飞虱', '二化螟'][Math.floor(Math.random() * 5)];
            } else if (crop === '玉米') {
                disease = ['玉米螟', '玉米大斑病', '蚜虫'][Math.floor(Math.random() * 3)];
            } else if (crop === '小麦') {
                disease = ['小麦条纹花叶病', '小麦赤霉病', '蚜虫', '白粉病', '锈病'][Math.floor(Math.random() * 5)];
            } else {
                disease = diseases[Math.floor(Math.random() * diseases.length)];
            }
            
            // 更真实的置信度分布
            let confidence;
            if (Math.random() < 0.6) {
                confidence = 0.85 + Math.random() * 0.15; // 60%的数据在85-100%
            } else if (Math.random() < 0.8) {
                confidence = 0.75 + Math.random() * 0.1; // 20%的数据在75-85%
            } else {
                confidence = 0.6 + Math.random() * 0.15; // 20%的数据在60-75%
            }
            
            // 更真实的成功率（95%左右）
            const status = Math.random() < 0.95 ? '已完成' : '失败';
            
            // 响应时间基于复杂度
            const responseTime = type === '病害' ? 1.5 + Math.random() * 2 : 
                               type === '虫害' ? 1.2 + Math.random() * 1.5 :
                               0.8 + Math.random() * 1.2;
            
            records.push({
                id: i + 1,
                timestamp: date.toISOString(),
                crop: crop,
                disease: disease,
                type: type,
                confidence: Math.round(confidence * 1000) / 1000,
                status: status,
                responseTime: Math.round(responseTime * 10) / 10
            });
        }
        return records;
    }

    processData() {
        // 优化数据处理逻辑，减少重复计算
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // 筛选最近一个月的数据
        this.data.monthlyRecords = this.data.records.filter(record => 
            new Date(record.timestamp) >= oneMonthAgo
        );

        // 一次遍历完成所有统计，避免多次遍历
        const dailyStats = {};
        const typeStats = {};
        const cropStats = {};
        const accuracyRanges = [
            { min: 0.9, max: 1.0, label: '90-100%', count: 0 },
            { min: 0.8, max: 0.9, label: '80-90%', count: 0 },
            { min: 0.7, max: 0.8, label: '70-80%', count: 0 },
            { min: 0.0, max: 0.7, label: '70%以下', count: 0 }
        ];
        
        this.data.monthlyRecords.forEach(record => {
            // 日期统计
            const date = new Date(record.timestamp).toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { count: 0, success: 0, totalConfidence: 0 };
            }
            dailyStats[date].count++;
            if (record.status === '已完成') dailyStats[date].success++;
            dailyStats[date].totalConfidence += record.confidence;
            
            // 类型统计
            typeStats[record.type] = (typeStats[record.type] || 0) + 1;
            
            // 作物统计
            cropStats[record.crop] = (cropStats[record.crop] || 0) + 1;
            
            // 准确率统计
            for (const range of accuracyRanges) {
                if (record.confidence >= range.min && record.confidence < range.max) {
                    range.count++;
                    break;
                }
            }
        });
        
        // 转换日期统计为数组并排序
        this.data.dailyStats = Object.entries(dailyStats)
            .map(([date, stats]) => ({
                date,
                count: stats.count,
                successRate: stats.success / stats.count,
                avgConfidence: stats.totalConfidence / stats.count
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // 保存其他统计结果
        this.data.typeStats = typeStats;
        this.data.cropStats = cropStats;
        
        // 转换准确率统计为对象
        this.data.accuracyStats = {};
        accuracyRanges.forEach(range => {
            this.data.accuracyStats[range.label] = range.count;
        });
    }

    // 删除不再需要的方法，已合并到processData中

    updateMetrics() {
        // 优化指标更新，减少DOM操作
        if (!this.data.monthlyRecords) return;
        
        const totalDiagnosis = this.data.monthlyRecords.length;
        if (totalDiagnosis === 0) return;
        
        const successCount = this.data.monthlyRecords.filter(r => r.status === '已完成').length;
        const successRate = successCount / totalDiagnosis;
        
        let totalResponseTime = 0;
        for (let i = 0; i < totalDiagnosis; i++) {
            totalResponseTime += this.data.monthlyRecords[i].responseTime;
        }
        const avgResponseTime = totalResponseTime / totalDiagnosis;
        
        const activeUsers = Math.floor(totalDiagnosis * 0.7); // 模拟活跃用户数

        // 固定变化率（避免重复计算）
        const changes = {
            diagnosis: '+12.5%',
            success: '+2.1%',
            response: '-0.5s',
            users: '+8.3%'
        };

        // 批量更新DOM，减少重排重绘
        const updates = [
            {
                selector: '.metric-card:nth-child(1) .metric-value',
                value: totalDiagnosis.toLocaleString()
            },
            {
                selector: '.metric-card:nth-child(1) .metric-change',
                value: `<i class="fas fa-arrow-up"></i> ${changes.diagnosis}`
            },
            {
                selector: '.metric-card:nth-child(2) .metric-value',
                value: (successRate * 100).toFixed(1) + '%'
            },
            {
                selector: '.metric-card:nth-child(2) .metric-change',
                value: `<i class="fas fa-arrow-up"></i> ${changes.success}`
            },
            {
                selector: '.metric-card:nth-child(3) .metric-value',
                value: avgResponseTime.toFixed(1) + 's'
            },
            {
                selector: '.metric-card:nth-child(3) .metric-change',
                value: `<i class="fas fa-arrow-down"></i> ${changes.response}`
            },
            {
                selector: '.metric-card:nth-child(4) .metric-value',
                value: activeUsers.toLocaleString()
            },
            {
                selector: '.metric-card:nth-child(4) .metric-change',
                value: `<i class="fas fa-arrow-up"></i> ${changes.users}`
            }
        ];
        
        // 使用requestAnimationFrame优化DOM更新
        requestAnimationFrame(() => {
            updates.forEach(update => {
                const element = document.querySelector(update.selector);
                if (element) element.innerHTML = update.value;
            });
        });
    }

    initCharts() {
        // 使用懒加载方式初始化图表
        this.initTrendChart();
        
        // 延迟加载其他图表，提高初始渲染速度
        setTimeout(() => {
            this.initDistributionChart();
            
            setTimeout(() => {
                this.initCropChart();
                
                setTimeout(() => {
                    this.initAccuracyChart();
                }, 100);
            }, 100);
        }, 100);
    }

    initTrendChart() {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 生成最近30天的数据
        const labels = [];
        const data = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
            
            // 模拟真实的诊断数据波动（工作日多，周末少）
            const dayOfWeek = date.getDay();
            let baseCount = 35;
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                baseCount = 15; // 周末数据较少
            }
            
            // 添加随机波动和趋势
            const trendFactor = 1 + (i / 100); // 轻微上升趋势
            const randomFactor = 0.7 + Math.random() * 0.6;
            data.push(Math.round(baseCount * trendFactor * randomFactor));
        }

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '诊断次数',
                    data: data,
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.2)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 4,
                    pointBackgroundColor: '#00e5ff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#64b5f6',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#b0bec5',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#b0bec5',
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
        
        this.chartInstances.push(this.charts.trend);
    }

    initDistributionChart() {
        const canvas = document.getElementById('distributionChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 更真实的病虫害分布数据
        const labels = ['叶斑病', '蚜虫', '白粉病', '锈病', '螟虫', '其他'];
        const data = [28.5, 22.3, 18.7, 12.8, 9.2, 8.5];
        const colors = [
            '#ff4757', // 鲜红色 - 叶斑病
            '#00d2d3', // 鲜青色 - 蚜虫  
            '#3742fa', // 鲜蓝色 - 白粉病
            '#ffa502', // 鲜橙色 - 锈病
            '#e056fd', // 鲜紫色 - 螟虫
            '#7bed9f'  // 鲜绿色 - 其他
        ];

        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                animation: {
                    duration: 1200,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
        
        this.chartInstances.push(this.charts.distribution);
    }

    initCropChart() {
        const canvas = document.getElementById('cropChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 更真实的作物分布数据
        const labels = ['水稻', '小麦', '玉米', '大豆', '棉花', '油菜'];
        const data = [35.2, 28.7, 22.1, 8.5, 3.2, 2.3];
        
        // 使用超亮纯色，确保可见
        const colors = [
            '#00FF41', // 亮绿色 - 水稻
            '#00D4FF', // 亮蓝色 - 小麦  
            '#FFB347', // 亮橙色 - 玉米
            '#FF69B4', // 亮粉色 - 大豆
            '#FF6347', // 番茄红 - 棉花
            '#DA70D6'  // 兰花紫 - 油菜
        ];

        this.charts.crop = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '作物占比 (%)',
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 3,
                    borderRadius: 12,
                    borderSkipped: false,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(20, 30, 50, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00e5ff',
                        borderWidth: 2,
                        cornerRadius: 12,
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 13,
                                weight: 'bold'
                            },
                            padding: 8
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 40,
                        grid: {
                            color: 'rgba(100, 181, 246, 0.2)',
                            lineWidth: 1,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        
        this.chartInstances.push(this.charts.crop);
    }

    initAccuracyChart() {
        const canvas = document.getElementById('accuracyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 更真实的准确率分布数据
        const labels = ['优秀 (≥95%)', '良好 (85-94%)', '一般 (75-84%)', '待改进 (<75%)'];
        const data = [56.5, 32.2, 8.3, 2.9];
        const colors = [
            '#00e676', // 鲜绿色 - 优秀
            '#00bcd4', // 鲜青色 - 良好
            '#ffeb3b', // 鲜黄色 - 一般
            '#ff5722'  // 鲜红色 - 待改进
        ];

        this.charts.accuracy = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
        
        this.chartInstances.push(this.charts.accuracy);
    }

    switchChartType(container, chartType) {
        // 更新按钮状态
        container.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        container.querySelector(`[data-chart="${chartType}"]`).classList.add('active');

        // 切换图表类型（仅对趋势图有效）
        if (container.querySelector('#trendChart') && this.charts.trend) {
            this.charts.trend.config.type = chartType;
            this.charts.trend.update();
        }
    }

    updateTimeRange(range) {
        // 根据时间范围重新处理数据
        const now = new Date();
        let startDate;

        switch (range) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        this.data.monthlyRecords = this.data.records.filter(record => 
            new Date(record.timestamp) >= startDate
        );

        this.processData();
        this.updateMetrics();
        this.updateCharts();
    }

    updateCustomRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (startDate && endDate) {
            this.data.monthlyRecords = this.data.records.filter(record => {
                const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
                return recordDate >= startDate && recordDate <= endDate;
            });

            this.processData();
            this.updateMetrics();
            this.updateCharts();
        }
    }

    updateCharts() {
        // 使用requestAnimationFrame优化图表更新
        requestAnimationFrame(() => {
            // 更新趋势图
            if (this.charts.trend) {
                // 减少数据点，提高渲染性能
                let labels = this.data.dailyStats.map(stat => stat.date);
                let data = this.data.dailyStats.map(stat => stat.count);
                
                // 如果数据点过多，进行抽样
                if (labels.length > 15) {
                    const step = Math.ceil(labels.length / 15);
                    labels = labels.filter((_, i) => i % step === 0);
                    data = data.filter((_, i) => i % step === 0);
                }
                
                this.charts.trend.data.labels = labels;
                this.charts.trend.data.datasets[0].data = data;
                this.charts.trend.update('none'); // 使用'none'模式减少动画开销
            }
        });
        
        // 延迟更新其他图表，避免同时渲染造成卡顿
        setTimeout(() => {
            // 更新分布图
            if (this.charts.distribution) {
                const labels = Object.keys(this.data.typeStats);
                const data = Object.values(this.data.typeStats);
                
                this.charts.distribution.data.labels = labels;
                this.charts.distribution.data.datasets[0].data = data;
                this.charts.distribution.update('none');
            }
            
            setTimeout(() => {
                // 更新作物图
                if (this.charts.crop) {
                    const labels = Object.keys(this.data.cropStats);
                    const data = Object.values(this.data.cropStats);
                    
                    this.charts.crop.data.labels = labels;
                    this.charts.crop.data.datasets[0].data = data;
                    this.charts.crop.update('none');
                }
                
                setTimeout(() => {
                    // 更新准确率图
                    if (this.charts.accuracy) {
                        const labels = Object.keys(this.data.accuracyStats);
                        const data = Object.values(this.data.accuracyStats);
                        
                        this.charts.accuracy.data.labels = labels;
                        this.charts.accuracy.data.datasets[0].data = data;
                        this.charts.accuracy.update('none');
                    }
                }, 50);
            }, 50);
        }, 50);
    }

    refreshData() {
        // 显示加载指示器
        this.showNotification('正在刷新数据...', 'info');
        
        // 使用setTimeout延迟加载，避免UI阻塞
        setTimeout(() => {
            this.loadData();
            this.updateMetrics();
            this.updateCharts();
            this.showNotification('数据已刷新', 'success');
        }, 10);
    }

    filterTable() {
        // 使用requestAnimationFrame优化DOM操作
        requestAnimationFrame(() => {
            const searchTerm = document.getElementById('tableSearch').value.toLowerCase();
            const rows = document.querySelectorAll('#dataTable tbody tr');
            
            // 批量处理DOM操作，减少重排重绘
            const updates = [];
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const display = text.includes(searchTerm) ? '' : 'none';
                if (row.style.display !== display) {
                    updates.push({ row, display });
                }
            });
            
            // 一次性应用所有更改
            updates.forEach(update => {
                update.row.style.display = update.display;
            });
        });
    }

    exportTable() {
        // 显示加载指示器
        this.showNotification('正在准备导出...', 'info');
        
        // 使用setTimeout延迟处理，避免UI阻塞
        setTimeout(() => {
            const table = document.getElementById('dataTable');
            if (!table) {
                this.showNotification('找不到表格数据', 'error');
                return;
            }
            
            const rows = Array.from(table.querySelectorAll('tr'));
            if (rows.length === 0) {
                this.showNotification('表格没有数据可导出', 'warning');
                return;
            }
            
            try {
                // 优化CSV生成
                let csvContent = '';
                for (let i = 0; i < rows.length; i++) {
                    const cells = Array.from(rows[i].querySelectorAll('th, td'));
                    if (cells.length === 0) continue;
                    
                    const rowContent = cells.map(cell => `"${cell.textContent.trim()}"`).join(',');
                    csvContent += rowContent + '\n';
                }
                
                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `统计数据_${new Date().toISOString().slice(0, 10)}.csv`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('表格已导出', 'success');
            } catch (e) {
                console.error('导出表格时出错:', e);
                this.showNotification('导出失败，请重试', 'error');
            }
        }, 10);
    }

    exportReport() {
        // 显示加载指示器
        this.showNotification('正在生成报告...', 'info');
        
        // 使用setTimeout延迟处理，避免UI阻塞
        setTimeout(() => {
            try {
                const reportContent = this.generateReportContent();
                const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `统计报告_${new Date().toISOString().slice(0, 10)}.txt`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('报告已导出', 'success');
            } catch (e) {
                console.error('导出报告时出错:', e);
                this.showNotification('导出失败，请重试', 'error');
            }
        }, 10);
    }

    generateReportContent() {
        const totalDiagnosis = this.data.monthlyRecords.length;
        if (totalDiagnosis === 0) {
            return '穗安巡视官 - 统计报告\n' + 
                   '='.repeat(50) + '\n\n' +
                   `报告生成时间: ${new Date().toLocaleString()}\n\n` +
                   '当前没有可用的诊断数据。';
        }
        
        // 优化计算，减少遍历次数
        let successCount = 0;
        let totalResponseTime = 0;
        
        for (let i = 0; i < totalDiagnosis; i++) {
            const record = this.data.monthlyRecords[i];
            if (record.status === '已完成') successCount++;
            totalResponseTime += record.responseTime;
        }
        
        const successRate = successCount / totalDiagnosis;
        const avgResponseTime = totalResponseTime / totalDiagnosis;

        // 使用字符串拼接而不是多次+=操作，提高性能
        let report = [
            '穗安巡视官 - 统计报告',
            '='.repeat(50),
            '',
            `报告生成时间: ${new Date().toLocaleString()}`,
            '',
            '关键指标:',
            '-'.repeat(20),
            `总诊断次数: ${totalDiagnosis}`,
            `成功率: ${(successRate * 100).toFixed(1)}%`,
            `平均响应时间: ${avgResponseTime.toFixed(1)}秒`,
            '',
            '病虫害类型分布:',
            '-'.repeat(20)
        ].join('\n');
        
        // 使用数组收集结果，最后一次性join，减少字符串拼接操作
        const typeLines = [];
        Object.entries(this.data.typeStats).forEach(([type, count]) => {
            const percentage = (count / totalDiagnosis * 100).toFixed(1);
            typeLines.push(`${type}: ${count}次 (${percentage}%)`);
        });
        report += '\n' + typeLines.join('\n');
        
        const cropLines = [];
        report += '\n\n作物类型分布:\n' + '-'.repeat(20) + '\n';
        Object.entries(this.data.cropStats).forEach(([crop, count]) => {
            const percentage = (count / totalDiagnosis * 100).toFixed(1);
            cropLines.push(`${crop}: ${count}次 (${percentage}%)`);
        });
        report += cropLines.join('\n');
        
        const accuracyLines = [];
        report += '\n\n准确率分布:\n' + '-'.repeat(20) + '\n';
        Object.entries(this.data.accuracyStats).forEach(([range, count]) => {
            const percentage = (count / totalDiagnosis * 100).toFixed(1);
            accuracyLines.push(`${range}: ${count}次 (${percentage}%)`);
        });
        report += accuracyLines.join('\n');

        return report;
    }

    refreshCharts() {
        this.showNotification('正在刷新图表...', 'info');
        
        setTimeout(() => {
            this.updateCharts();
            this.showNotification('图表已刷新', 'success');
        }, 500);
    }
    
    exportCharts() {
        this.showNotification('正在导出图表...', 'info');
        
        setTimeout(() => {
            try {
                // 导出所有图表为图片
                const charts = ['trendChart', 'distributionChart', 'cropChart', 'accuracyChart'];
                const zip = new JSZip();
                
                charts.forEach(chartId => {
                    const canvas = document.getElementById(chartId);
                    if (canvas) {
                        const dataURL = canvas.toDataURL('image/png');
                        const base64Data = dataURL.split(',')[1];
                        zip.file(`${chartId}.png`, base64Data, {base64: true});
                    }
                });
                
                zip.generateAsync({type: 'blob'}).then(content => {
                    const url = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `图表导出_${new Date().toISOString().slice(0, 10)}.zip`;
                    a.click();
                    URL.revokeObjectURL(url);
                    this.showNotification('图表已导出', 'success');
                });
            } catch (e) {
                // 简化版导出：单独导出每个图表
                const canvas = document.getElementById('trendChart');
                if (canvas) {
                    const url = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `诊断趋势图_${new Date().toISOString().slice(0, 10)}.png`;
                    a.click();
                    this.showNotification('趋势图已导出', 'success');
                } else {
                    this.showNotification('导出失败，请重试', 'error');
                }
            }
        }, 100);
    }
    
    updatePestPeriod(period) {
        this.showNotification(`切换到${period === 'month' ? '本月' : period === 'quarter' ? '本季度' : '本年度'}数据`, 'info');
        
        // 这里可以根据周期重新计算数据
        setTimeout(() => {
            if (this.charts.distribution) {
                // 模拟不同周期的数据变化
                const periodData = {
                    month: [32.5, 28.3, 21.7, 17.5],
                    quarter: [35.1, 25.8, 23.2, 15.9],
                    year: [38.2, 24.1, 20.5, 17.2]
                };
                
                this.charts.distribution.data.datasets[0].data = periodData[period] || periodData.month;
                this.charts.distribution.update();
                
                // 更新图例百分比
                const legendItems = document.querySelectorAll('.enhanced-legend .legend-percent');
                const newData = periodData[period] || periodData.month;
                legendItems.forEach((item, index) => {
                    if (newData[index]) {
                        item.textContent = newData[index] + '%';
                    }
                });
            }
        }, 200);
    }
    
    updateCropFilter(filter) {
        this.showNotification(`筛选${filter === 'all' ? '全部作物' : filter === 'grain' ? '粮食作物' : filter === 'vegetable' ? '蔬菜作物' : '果树作物'}`, 'info');
        
        // 这里可以根据筛选条件重新计算数据
        setTimeout(() => {
            if (this.charts.crop) {
                // 模拟不同筛选条件的数据
                const filterData = {
                    all: { labels: ['水稻', '小麦', '玉米', '大豆'], data: [35.2, 28.7, 22.1, 14.0] },
                    grain: { labels: ['水稻', '小麦', '玉米'], data: [42.1, 34.3, 23.6] },
                    vegetable: { labels: ['白菜', '萝卜', '茄子'], data: [38.5, 31.2, 30.3] },
                    fruit: { labels: ['苹果', '梨', '桃'], data: [45.2, 28.8, 26.0] }
                };
                
                const newData = filterData[filter] || filterData.all;
                this.charts.crop.data.labels = newData.labels;
                this.charts.crop.data.datasets[0].data = newData.data;
                this.charts.crop.update();
                
                // 更新进度条
                const progressItems = document.querySelectorAll('.crop-progress-item');
                progressItems.forEach((item, index) => {
                    if (newData.labels[index]) {
                        const nameElement = item.querySelector('.crop-name');
                        const percentElement = item.querySelector('.crop-percentage');
                        const fillElement = item.querySelector('.progress-fill');
                        
                        if (nameElement) nameElement.textContent = newData.labels[index];
                        if (percentElement) percentElement.textContent = newData.data[index] + '%';
                        if (fillElement) fillElement.style.width = newData.data[index] + '%';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        }, 200);
    }

    showNotification(message, type = 'info') {
        // 检查是否已存在通知，避免重复显示
        const existingNotifications = document.querySelectorAll('.notification');
        for (let i = 0; i < existingNotifications.length; i++) {
            const notification = existingNotifications[i];
            if (notification.textContent.trim() === message) {
                return; // 已存在相同内容的通知，不再显示
            }
        }
        
        // 限制通知数量，避免堆积
        if (existingNotifications.length >= 3) {
            document.body.removeChild(existingNotifications[0]);
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // 使用简化的图标类名
        const iconType = type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'exclamation-circle' : 
                         type === 'warning' ? 'exclamation-triangle' : 
                         'info-circle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${iconType}"></i>
                ${message}
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 使用事件委托绑定关闭按钮事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        document.body.appendChild(notification);
        
        // 自动关闭通知
        setTimeout(() => {
            if (notification.parentNode) {
                // 添加淡出效果
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 3000);
    }
}

// 初始化报告管理器
const reportsManager = new ReportsManager();