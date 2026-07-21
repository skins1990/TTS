---
name: Voice Studio
description: 轻松、清楚的个人语音生成工作台
colors:
  ink: "#282524"
  ink-muted: "#6D6864"
  canvas: "#F7F6F3"
  surface: "#FDFCFA"
  surface-soft: "#EFEEEA"
  border: "#DAD7D1"
  primary: "#E65F42"
  primary-hover: "#CC4D32"
  success: "#26845C"
  danger: "#C33E3E"
typography:
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sm: "5px"
  md: "8px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "11px 12px"
---

# Design System: Voice Studio

## Overview

**Creative North Star: "桌边录音稿"**

像一张整理干净的桌面，文案、音色和播放器都在顺手的位置。视觉轻松但不玩具化，以清晰的层级和克制的反馈帮助个人创作者持续工作。明确拒绝营销落地页式的大标题、企业后台式重导航，以及霓虹渐变和玻璃拟态。

**Key Characteristics:**
- 浅色、低噪声、桌面工具感
- 主编辑区优先，设置区紧邻结果
- 状态变化快速直接，无装饰动画
- 桌面与移动端拥有同等功能

## Colors

暖灰中性色构成纸张般的工作表面，珊瑚红只用于主操作与当前选择，成功与错误使用独立语义色。

### Primary
- **珊瑚动作色**：只用于生成按钮、焦点和明确选中状态。

### Neutral
- **炭灰正文**：保证长文编辑时的可读性。
- **纸张白**：承载输入与结果内容。
- **暖雾底色**：区分页面背景与工作表面。

### Named Rules

**The One Action Rule.** 每个视区最多只有一个珊瑚红主操作，颜色不承担装饰用途。

## Typography

**Display Font:** Inter（system-ui 回退）  
**Body Font:** Inter（system-ui 回退）

**Character:** 单一无衬线字体保持工具感，标题靠字重与固定字号建立层级，不使用夸张展示字体。

### Hierarchy
- **Headline**（700，1.5rem，1.25）：页面和关键结果标题。
- **Title**（650，1rem，1.4）：区块与字段组标题。
- **Body**（400，0.9375rem，1.65）：编辑文本与说明，说明文字最多 70ch。
- **Label**（600，0.8125rem，1.4）：表单标签和状态。

### Named Rules

**The Quiet Type Rule.** 标签不使用全大写或额外字距，层级通过字号和字重表达。

## Elevation

默认依靠色调和细边框分层。阴影只用于悬浮菜单或需要脱离文档流的临时表面，工作区本身保持平整。

### Named Rules

**The Flat Workspace Rule.** 固定工作区禁止装饰阴影，交互状态通过边框、背景和焦点环表达。

## Components

### Buttons
- **Shape:** 轻微圆角（8px）。
- **Primary:** 珊瑚色底与纸张白文字，内边距 12px 18px。
- **Hover / Focus:** 悬停加深；键盘焦点显示 3px 低透明度焦点环。
- **Secondary:** 透明或纸张白底、细边框，用于非主流程动作。

### Chips
- **Style:** 小号暖灰底，选中时使用淡珊瑚背景与深珊瑚文字。
- **State:** 可点击标签必须具有明确的悬停、选中和键盘焦点状态。

### Cards / Containers
- **Corner Style:** 轻微圆角（8px）。
- **Background:** 仅重复历史条目使用纸张白。
- **Shadow Strategy:** 无阴影。
- **Border:** 1px 暖灰边框。
- **Internal Padding:** 16px 至 20px。

### Inputs / Fields
- **Style:** 纸张白底、1px 暖灰边框、8px 圆角。
- **Focus:** 边框切换为珊瑚色并显示柔和焦点环。
- **Error / Disabled:** 错误同时显示图标或文本；禁用状态降低对比度但保持可读。

### Navigation
- 顶栏固定为“语音生成 / 语气控制 / 阶跃语音 / MiniMax / Seed Audio / 音色库”，同时展示各服务连接状态；移动端允许换行，不隐藏核心入口。

## Do's and Don'ts

### Do:
- **Do** 让用户打开页面后立即看到文本输入和生成操作。
- **Do** 使用 8px 以内圆角和 1px 边框保持界面清楚。
- **Do** 为加载、空记录、失败、成功和禁用提供完整状态。

### Don't:
- **Don't** 使用营销落地页式的大标题和功能宣传。
- **Don't** 使用密集的企业后台侧栏。
- **Don't** 使用霓虹渐变、玻璃拟态和过度未来感的 AI 工具视觉。
- **Don't** 在卡片内部继续嵌套卡片。
