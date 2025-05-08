document.addEventListener('DOMContentLoaded', function () {
    // 注册Chart.js数据标签插件
    if (typeof Chart === 'undefined') {
        console.error('Chart.js 未正确加载');
        return;
    }
    
    // 确保ChartDataLabels插件存在
    if (typeof ChartDataLabels === 'undefined') {
        console.error('Chart.js DataLabels 插件未正确加载');
        return;
    }

    // 注册插件
    try {
        Chart.register(ChartDataLabels);
    } catch (error) {
        console.error('注册Chart.js插件失败:', error);
        return;
    }

    // 全局变量
    let chartInstance = null;
    let currentChartType = 'pie';
    let chartData = [];
    let useColorful = false; // 默认使用蓝色系
    let showDataLabels = true; // 默认显示数据标签

    // DOM 元素
    const addEntryBtn = document.getElementById('add-entry');
    const dataEntriesContainer = document.getElementById('data-entries');
    const generateChartBtn = document.getElementById('generate-chart');
    const chartCanvas = document.getElementById('chart-canvas');
    const chartControls = document.querySelector('.chart-controls');
    const exportChartBtn = document.getElementById('export-chart');
    const fontColorInput = document.getElementById('font-color');
    const titleFontSizeInput = document.getElementById('title-font-size');
    const titleFontSizeValue = document.getElementById('title-font-size-value');
    const itemFontSizeInput = document.getElementById('item-font-size');
    const itemFontSizeValue = document.getElementById('item-font-size-value');
    const chartOptions = document.querySelectorAll('.chart-option');
    const toggleDataLabelsBtn = document.getElementById('toggle-data-labels');
    const applyChangesBtn = document.getElementById('apply-changes');
    const colorToggleBtn = document.getElementById('color-toggle');

    // 检查必要的DOM元素是否存在
    if (!addEntryBtn || !dataEntriesContainer || !generateChartBtn || !chartCanvas) {
        console.error('必要的DOM元素未找到');
        return;
    }

    // 初始化 - 确保至少有一个数据项
    if (dataEntriesContainer.children.length === 0) {
        addDataEntry();
    }

    // 显示图表控制面板
    function showChartControls() {
        if (chartControls) {
            chartControls.style.display = 'block';
        }
    }

    // 添加数据项
    addEntryBtn.addEventListener('click', addDataEntry);

    // 删除数据项事件委托
    dataEntriesContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-entry')) {
            // 确保至少保留一个数据项
            if (dataEntriesContainer.children.length > 1) {
                e.target.closest('.data-entry').remove();
            } else {
                alert('至少需要保留一个数据项');
            }
        }
    });

    // 选择图表类型
    chartOptions.forEach(option => {
        option.addEventListener('click', function () {
            chartOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentChartType = this.dataset.type;

            // 如果已经生成了图表，则实时更新图表类型
            if (chartInstance) {
                generateChart();
            }
        });
    });

    // 默认选中饼图
    const defaultChartOption = document.querySelector('.chart-option[data-type="pie"]');
    if (defaultChartOption) {
        defaultChartOption.classList.add('active');
    }

    // 生成图表
    generateChartBtn.addEventListener('click', generateChart);

    // 字体颜色变更
    if (fontColorInput) {
        fontColorInput.addEventListener('input', updateChartStyles);
    }

    // 标题字体大小变更
    if (titleFontSizeInput && titleFontSizeValue) {
        titleFontSizeInput.addEventListener('input', function () {
            titleFontSizeValue.textContent = this.value + 'px';
            updateChartStyles();
        });
    }

    // 项目字体大小变更
    if (itemFontSizeInput && itemFontSizeValue) {
        itemFontSizeInput.addEventListener('input', function () {
            itemFontSizeValue.textContent = this.value + 'px';
            updateChartStyles();
        });
    }

    // 配色切换
    if (colorToggleBtn) {
        colorToggleBtn.addEventListener('click', function () {
            useColorful = !useColorful;
            this.textContent = useColorful ? '使用蓝色系' : '使用彩色系';
            if (chartInstance) {
                generateChart();
            }
        });
    }

    // 数据标签显示切换
    if (toggleDataLabelsBtn) {
        toggleDataLabelsBtn.addEventListener('click', function () {
            showDataLabels = !showDataLabels;
            this.textContent = showDataLabels ? '隐藏数据项' : '显示数据项';
            if (chartInstance) {
                chartInstance.options.plugins.datalabels.display = showDataLabels;
                chartInstance.update();
            }
        });
    }

    // 应用样式改动
    if (applyChangesBtn) {
        applyChangesBtn.addEventListener('click', function () {
            if (chartInstance) {
                updateChartStyles();
                generateChart();
            }
        });
    }

    // 导出图表为图片
    if (exportChartBtn) {
        exportChartBtn.addEventListener('click', exportChart);
    }

    // 添加数据项函数
    function addDataEntry() {
        const entry = document.createElement('div');
        entry.className = 'data-entry';
        entry.innerHTML = `
            <input type="text" class="item-name" placeholder="项目名称">
            <input type="number" class="item-value" placeholder="数值">
            <input type="text" class="item-unit" placeholder="单位 (如 %)">
            <button class="remove-entry">删除</button>
        `;
        dataEntriesContainer.appendChild(entry);
    }

    // 收集表单数据
    function collectFormData() {
        const title = document.getElementById('chart-title').value || '未命名图表';
        const entries = document.querySelectorAll('.data-entry');
        const data = [];

        entries.forEach(entry => {
            const name = entry.querySelector('.item-name').value;
            const value = parseFloat(entry.querySelector('.item-value').value);
            const unit = entry.querySelector('.item-unit').value;

            if (name && !isNaN(value)) {
                data.push({
                    name: name,
                    value: value,
                    unit: unit
                });
            }
        });

        return {
            title: title,
            data: data
        };
    }

    // 生成图表
    function generateChart() {
        const formData = collectFormData();

        if (formData.data.length === 0) {
            alert('请至少输入一个有效的数据项');
            return;
        }

        chartData = formData.data;

        // 准备图表数据
        const labels = chartData.map(item => item.name);
        const values = chartData.map(item => item.value);
        const units = chartData.map(item => item.unit);

        // 销毁现有图表
        if (chartInstance) {
            chartInstance.destroy();
        }

        // 创建新图表
        const ctx = chartCanvas.getContext('2d');

        // 图表配置
        const config = {
            type: currentChartType,
            data: {
                labels: labels,
                datasets: [{
                    label: formData.title,
                    data: values,
                    backgroundColor: useColorful ? [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#8AC249', '#EA526F', '#46BFBD', '#F7464A',
                        '#97BBCD', '#F06613', '#FDB45C', '#949FB1', '#57A773'
                    ] : [
                        '#003366', '#004c99', '#0066cc', '#0080ff', '#3399ff',
                        '#66b2ff', '#99ccff', '#cce5ff', '#b3d9ff', '#e6f2ff'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: formData.title,
                        font: {
                            size: parseInt(titleFontSizeInput.value),
                            color: fontColorInput.value
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const value = context.raw;
                                const unit = units[index] || '';
                                return `${labels[index]}: ${value}${unit}`;
                            }
                        }
                    },
                    // 添加数据标签显示
                    datalabels: {
                        display: showDataLabels,
                        color: fontColorInput.value,
                        font: {
                            size: parseInt(itemFontSizeInput.value)
                        },
                        formatter: function (value, context) {
                            const index = context.dataIndex;
                            const unit = units[index] || '';
                            // 根据图表类型显示不同的数据标签内容
                            if (currentChartType === 'pie') {
                                return `${value}${unit}`;
                            } else {
                                return `${value}${unit}`;
                            }
                        },
                        anchor: 'center',
                        align: 'center'
                    }
                }
            }
        };

        // 为不同图表类型设置不同的数据标签位置
        if (currentChartType === 'pie') {
            config.options.plugins.datalabels.anchor = 'center';
            config.options.plugins.datalabels.align = 'center';
        } else if (currentChartType === 'bar') {
            config.options.plugins.datalabels.anchor = 'end';
            config.options.plugins.datalabels.align = 'top';
        } else if (currentChartType === 'line') {
            config.options.plugins.datalabels.anchor = 'end';
            config.options.plugins.datalabels.align = 'top';
        }

        // 为折线图和柱状图添加特定配置
        if (currentChartType === 'line') {
            config.data.datasets[0].fill = false;
            config.data.datasets[0].tension = 0.1;
            // 确保折线图正确显示线条
            config.data.datasets[0].borderColor = config.data.datasets[0].backgroundColor[0];
            config.data.datasets[0].pointBackgroundColor = config.data.datasets[0].backgroundColor;
            config.data.datasets[0].pointBorderColor = '#fff';
            config.data.datasets[0].pointRadius = 5;
            config.data.datasets[0].pointHoverRadius = 7;
        }

        // 创建图表
        chartInstance = new Chart(ctx, config);

        // 显示图表控制区域
        showChartControls();
    }

    // 更新图表样式
    function updateChartStyles() {
        if (!chartInstance) return;

        const titleFontSize = parseInt(titleFontSizeInput.value);
        const itemFontSize = parseInt(itemFontSizeInput.value);
        const fontColor = fontColorInput.value;

        chartInstance.options.plugins.title.font.size = titleFontSize;
        chartInstance.options.plugins.title.color = fontColor;
        chartInstance.options.plugins.legend.labels.font.size = itemFontSize;
        chartInstance.options.plugins.legend.labels.color = fontColor;

        // 更新数据标签样式
        if (chartInstance.options.plugins.datalabels) {
            chartInstance.options.plugins.datalabels.color = fontColor;
            chartInstance.options.plugins.datalabels.font.size = itemFontSize;
        }

        chartInstance.update();
    }

    // 导出图表为图片
    function exportChart() {
        if (!chartInstance) {
            alert('请先生成图表');
            return;
        }

        // 临时增加图表容器大小以确保文字完整显示
        const chartContainer = document.querySelector('.chart-container');
        const originalStyle = chartContainer.getAttribute('style') || '';
        chartContainer.style.minHeight = '400px';
        chartContainer.style.width = '100%';
        chartContainer.style.padding = '20px';

        // 使用html2canvas捕获图表区域
        html2canvas(chartContainer, { scale: 2 }).then(canvas => {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = '图表.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            // 恢复原始样式
            chartContainer.setAttribute('style', originalStyle);
        });
    }
});