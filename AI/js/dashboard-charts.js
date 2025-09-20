// 图表配置和数据
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: {
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                size: 13
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#7f8c8d',
                font: {
                    size: 12
                }
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                lineWidth: 1
            },
            ticks: {
                color: '#7f8c8d',
                font: {
                    size: 12
                }
            }
        }
    }
};

// 诊断趋势图表
function initDiagnosisChart() {
    const ctx = document.getElementById('diagnosisChart').getContext('2d');
    
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [{
            label: '诊断数量',
            data: [820, 932, 901, 934, 1290, 1330, 1320, 1450, 1200, 1100, 1247, 1380],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };

    const lineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                tooltip: {
                    ...chartConfig.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `诊断数量: ${context.parsed.y.toLocaleString()} 次`;
                        }
                    }
                }
            }
        }
    });

    // 切换图表类型
    document.querySelectorAll('[data-chart]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-chart]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const chartType = this.dataset.chart;
            lineChart.config.type = chartType;
            
            if (chartType === 'bar') {
                lineChart.data.datasets[0].backgroundColor = 'rgba(102, 126, 234, 0.8)';
                lineChart.data.datasets[0].borderColor = '#667eea';
                lineChart.data.datasets[0].borderWidth = 2;
            } else {
                lineChart.data.datasets[0].backgroundColor = 'rgba(102, 126, 234, 0.1)';
                lineChart.data.datasets[0].borderColor = '#667eea';
                lineChart.data.datasets[0].borderWidth = 3;
            }
            
            lineChart.update();
        });
    });
}

// 病虫害分布图表
function initPestChart() {
    const ctx = document.getElementById('pestChart').getContext('2d');
    
    const data = {
        labels: ['叶斑病', '蚜虫', '白粉病', '其他'],
        datasets: [{
            data: [32.5, 28.3, 21.7, 17.5],
            backgroundColor: [
                '#FF6B6B',
                '#4ECDC4', 
                '#45B7D1',
                '#96CEB4'
            ],
            borderWidth: 0,
            hoverBorderWidth: 3,
            hoverBorderColor: '#fff'
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
}

// 作物类型统计图表
function initCropChart() {
    const ctx = document.getElementById('cropChart').getContext('2d');
    
    const data = {
        labels: ['水稻', '小麦', '玉米', '大豆', '棉花', '其他'],
        datasets: [{
            label: '作物占比',
            data: [35.2, 28.7, 22.1, 8.5, 3.2, 2.3],
            backgroundColor: [
                '#52C41A',
                '#1890FF',
                '#FAAD14',
                '#722ED1',
                '#EB2F96',
                '#13C2C2'
            ],
            borderRadius: 4,
            borderSkipped: false
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                tooltip: {
                    ...chartConfig.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                ...chartConfig.scales,
                y: {
                    ...chartConfig.scales.y,
                    beginAtZero: true,
                    max: 40,
                    ticks: {
                        ...chartConfig.scales.y.ticks,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    // 作物筛选功能
    document.getElementById('cropFilter').addEventListener('change', function() {
        // 这里可以添加筛选逻辑
        console.log('筛选条件:', this.value);
    });
}

// 准确率分析图表
function initAccuracyChart() {
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    
    const data = {
        labels: ['优秀', '良好', '一般', '待改进'],
        datasets: [{
            data: [56.5, 32.2, 8.3, 2.9],
            backgroundColor: [
                '#27AE60',
                '#3498DB',
                '#F1C40F',
                '#E74C3C'
            ],
            borderWidth: 0,
            hoverBorderWidth: 3,
            hoverBorderColor: '#fff'
        }]
    };

    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
}

// 初始化所有图表
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化图表，确保DOM完全加载
    setTimeout(() => {
        initDiagnosisChart();
        initPestChart();
        initCropChart();
        initAccuracyChart();
    }, 100);

    // 添加数据刷新功能
    setInterval(() => {
        // 模拟数据更新
        updateChartData();
    }, 30000); // 每30秒更新一次数据
});

// 数据更新函数
function updateChartData() {
    // 这里可以添加实时数据更新逻辑
    console.log('数据已更新');
}

// 导出功能
function exportChart(chartId) {
    const canvas = document.getElementById(chartId);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${chartId}_chart.png`;
    link.href = url;
    link.click();
}

// 全屏显示功能
function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        element.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}