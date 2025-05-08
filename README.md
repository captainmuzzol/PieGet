# 图表生成器

一个基于Web的图表生成工具，允许用户创建饼状图、柱状图和折线图，并可以自定义样式和导出为图片。

## 功能特点

- 创建饼状图、柱状图和折线图
- 自定义数据项和数值
- 调整字体颜色和大小
- 导出图表为PNG图片
- 响应式设计，适配不同设备

## 技术栈

- 后端：Python Flask
- 前端：HTML, CSS, JavaScript
- 图表库：Chart.js
- 图片导出：html2canvas

## 安装与运行

1. 克隆仓库

```bash
git clone <仓库地址>
cd PieGet
```

2. 安装依赖

```bash
pip install -r requirements.txt
```

3. 运行应用

```bash
python app.py
```

4. 在浏览器中访问 http://127.0.0.1:5000

## 使用说明

1. 在主页面输入图表标题
2. 添加数据项，包括名称、数值和单位
3. 选择图表类型（饼状图、柱状图或折线图）
4. 点击"生成图表"按钮
5. 使用控制面板调整字体颜色和大小
6. 点击"导出为图片"按钮保存图表

## 项目结构

```
PieGet/
├── app.py                 # Flask应用入口
├── requirements.txt       # 项目依赖
├── static/                # 静态资源
│   ├── css/
│   │   └── style.css      # 样式表
│   └── js/
│       └── script.js      # JavaScript脚本
└── templates/
    └── index.html         # 主页面模板
```

## 技术支持

PieGet 图表生成器 | 版权所有 © 2023