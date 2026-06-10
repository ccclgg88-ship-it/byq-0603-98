# 组件说明与评分规则

## 一、组件说明

### 1. FigureAppraisalForm

手办品相鉴定评分表单主组件。

**文件路径**: [src/components/FigureAppraisalForm.tsx](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/components/FigureAppraisalForm.tsx)

**功能**:
- 手办品类切换（景品/比例手办/可动模型）
- 动态渲染品类对应的评分维度
- 维度分数输入（滑块 + 数字框双模式）
- 字段级实时校验（必填、范围）
- 草稿自动保存与恢复
- 表单提交与重置

**子组件**:
- `CategorySelector` - 品类选择器
- `DimensionSlider` - 单维度评分滑块
- `DraftStatusBar` - 草稿状态栏

---

### 2. DimensionRadar

多维度得分雷达图可视化组件。

**文件路径**: [src/components/DimensionRadar.tsx](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/components/DimensionRadar.tsx)

**功能**:
- 基于 Recharts 渲染雷达图
- 实时响应评分变化
- 渐变填充色 + 发光数据点
- Hover 显示具体分数 Tooltip
- 自适应容器尺寸

**依赖**: `recharts` 库

---

### 3. GradeBadge

鉴定等级徽章展示组件。

**文件路径**: [src/components/GradeBadge.tsx](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/components/GradeBadge.tsx)

**功能**:
- 实时计算加权总分
- 映射展示三档等级（神作/良品/一般）
- 等级对应的发光颜色效果
- 切换动画（pop-in）
- 显示等级阈值说明

---

### 4. CategorySelector

手办品类 Tab 切换组件。

**文件路径**: [src/components/CategorySelector.tsx](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/components/CategorySelector.tsx)

**Props**:
| 属性 | 类型 | 说明 |
|------|------|------|
| `value` | `FigureCategory` | 当前选中品类 |
| `onChange` | `(category) => void` | 品类切换回调 |

---

### 5. DimensionSlider

单维度评分滑块组件。

**文件路径**: [src/components/DimensionSlider.tsx](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/components/DimensionSlider.tsx)

**Props**:
| 属性 | 类型 | 说明 |
|------|------|------|
| `dimension` | `Dimension` | 维度配置 |
| `value` | `number \| null` | 当前分数 |
| `error?` | `string` | 错误提示 |
| `onChange` | `(value) => void` | 分数变更回调 |
| `onBlur` | `() => void` | 失焦校验回调 |
| `tabIndex?` | `number` | Tab 索引 |

---

### 6. DraftStatusBar

草稿保存状态提示组件。

**文件路径**: [src/components/DraftStatusBar.tsx](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/components/DraftStatusBar.tsx)

**Props**:
| 属性 | 类型 | 说明 |
|------|------|------|
| `savedAt` | `number \| null` | 保存时间戳 |
| `onClear` | `() => void` | 清除草稿回调 |

---

### 7. AppraisalPage

鉴定评分主页面。

**文件路径**: [src/pages/AppraisalPage.tsx](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/pages/AppraisalPage.tsx)

**布局**:
- 桌面端 (≥1024px): 左侧表单区 (3/5) + 右侧可视化面板 (2/5)
- 移动端 (<1024px): 上下堆叠单列布局

---

## 二、评分规则

### 2.1 评分维度配置

配置文件: [src/config/scoring.config.json](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/config/scoring.config.json)

#### 品类定义

| 品类 Key | 名称 | 说明 |
|----------|------|------|
| `prize` | 景品 | 夹娃娃机、抽奖类低价位手办 |
| `scale` | 比例手办 | 1/7、1/8 等固定比例收藏手办 |
| `action` | 可动模型 | figma、SHF 等可动关节模型 |

#### 维度定义与权重

| 维度 Key | 名称 | 权重 | 必填 | 适用品类 | 说明 |
|----------|------|------|------|----------|------|
| `painting` | 涂装 | 25% | ✅ | 全部 | 漆面均匀度、色彩还原、溢色情况 |
| `craftsmanship` | 做工 | 25% | ✅ | 全部 | 模具精度、分模线、接缝处理 |
| `box` | 盒损 | 15% | ✅ | 全部 | 外盒破损、压痕、磨损程度 |
| `accessories` | 配件完整度 | 15% | ✅ | 全部 | 替换件、底座、说明书等是否齐全 |
| `articulation` | 可动关节 | 20% | ❌ | `action` | 关节灵活度、把持力、松紧度 |
| `sculpt` | 原型雕刻 | 20% | ❌ | `scale` | 造型还原度、细节表现力 |

> **注意**: 同品类下所有适用维度的权重之和 = 1

#### 等级阈值

| 等级 | 阈值 | 颜色 |
|------|------|------|
| 神作 (masterpiece) | ≥ 85 分 | 金色 `#FFD700` |
| 良品 (good) | 70 – 84 分 | 青绿 `#4ADE80` |
| 一般 (normal) | < 70 分 | 灰色 `#9CA3AF` |

---

### 2.2 加权总分算法

```
加权总分 = Σ(维度分 × 权重) × 10
```

其中:
- `维度分` 范围: 0 – 10
- `权重` 范围: 0 – 1（同品类下总和 = 1）
- 最终总分: 0 – 100，保留 1 位小数

**示例计算（比例手办）**:
- 涂装: 9 分 × 0.25 = 2.25
- 做工: 8.5 分 × 0.25 = 2.125
- 盒损: 10 分 × 0.15 = 1.5
- 配件完整度: 8 分 × 0.15 = 1.2
- 原型雕刻: 9 分 × 0.20 = 1.8

加权总分 = (2.25 + 2.125 + 1.5 + 1.2 + 1.8) × 10 = **88.8 分 → 神作**

---

### 2.3 品类切换规则

1. 切换品类时，自动获取新品类的适用维度列表
2. 清除不属于新品类的维度分数和错误信息
3. 保留跨品类共有的维度分数（如涂装、做工等）

**示例**: 比例手办 → 景品
- `sculpt`（原型雕刻）分数被清除
- `painting`、`craftsmanship` 等共有维度分数保留

---

### 2.4 校验规则

| 校验项 | 规则 | 错误提示 |
|--------|------|----------|
| 必填校验 | `required: true` 的维度不能为空 | `{维度名}为必填项` |
| 范围校验 | 分数必须在 0 – 10 之间 | `分数需在 0–10 之间` |
| 格式校验 | 必须为有效数字 | `请输入有效数字` |

---

### 2.5 草稿存储规则

- **存储位置**: `localStorage`，Key 为 `figure_appraisal_draft`
- **过期时间**: 7 天（自动清除）
- **保存时机**: 任何分数变更后自动保存
- **恢复时机**: 页面加载时，若草稿存在且未过期则自动恢复
- **清除方式**:
  - 点击草稿栏的「清除」按钮
  - 点击「重置」按钮
  - 草稿超过 7 天自动过期

存储结构:
```json
{
  "state": {
    "category": "scale",
    "scores": { "painting": 9, "craftsmanship": 8.5 },
    "errors": {},
    "draftSavedAt": 1718000000000
  },
  "savedAt": 1718000000000,
  "expiresAt": 1718604800000
}
```

---

## 三、使用指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run check

# 构建生产版本
npm run build
```

### Docker 部署

```bash
# 构建并启动
docker-compose up -d --build

# 访问
open http://localhost:8080

# 停止
docker-compose down
```

### 自定义评分规则

编辑 [src/config/scoring.config.json](file:///Users/Mac/Desktop/06/0603/项目/byq-0603-98/src/config/scoring.config.json) 修改维度、权重或阈值，无需修改代码。

**添加新维度示例**:
```json
{
  "key": "base",
  "label": "底座",
  "description": "底座稳定性、材质、造型",
  "weight": 0.10,
  "required": false,
  "categories": ["scale", "action"]
}
```

> 修改权重后请确保同品类下所有权重之和等于 1
