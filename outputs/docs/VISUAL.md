# 🎨 视觉系统 (VISUAL)

本文档说明 3D 果冻立体风的渲染实现、主题系统和特效系统。

---

## 🎯 设计风格

**果冻竞技场风**（v0.4.0 起）：圆润饱满、有高光和柔和渐变，同时学习 .io 竞技成长游戏的“软管身体 + 奖励食物 + 道具反馈”体验。角色造型保持原创。

**桌面大画面调整**（v0.4.1 起）：不再为移动端压缩界面，优先让棋盘、蛇和食物在桌面屏幕上更大、更清楚。

**网格对齐修复**（v0.4.2 起）：棋盘改为 30×30，每格 40px；蛇和食物都使用 `cellCenter()` 取中心点，并把视觉外形收进当前格，避免误判路线。

**目标提示**（v0.4.3 起）：每个苹果底下绘制柔和格子高亮和中心点，帮助玩家快速判断苹果所在格。

**升级视觉**（v0.4.4 起）：2 级小蛇出现柔和身体光，4 级吃苹果特效增强，5 级头部显示星光皮肤标记。

核心视觉特征：
- **立体感**：径向渐变（左上亮 → 右下暗）+ 顶部高光 + 底部投影
- **圆润饱满**：用 ellipse 和 arc 绘制，避免硬边
- **明快配色**：饱和度适中，亮而不刺眼
- **低刺激棋盘**：果园主题使用接近色草地 + 低透明网格，避免强烈棋盘格

---

## 🐍 蛇的渲染

### 绘制流程

```
drawSnakeBody()
  1. 身体连接：粗线把所有节点连成平滑身体
     ├─ 深色描边层（lineWidth = baseRadius × 1.9）
     └─ 主色层（lineWidth = baseRadius × 1.5，露出深色描边形成轮廓）
  2. 逐节立体化（从尾到头，让头压在最上层）
     ├─ drawJellySegment(cx, cy, radius, type)
     └─ drawBodyDecoration(cx, cy, radius, type, index)
  3. 头部（最大、带朝向）
     ├─ drawJellySegment(headR × 1.1)
     └─ drawJellyHead(hcx, hcy, headR, type, direction)
```

### 一节立体蛇身（`drawJellySegment`）

四层叠加成果冻质感：

| 层 | 作用 | 实现 |
|---|---|---|
| 底部投影 | 贴地重量感 | `ellipse(cy + radius*0.85)` 半透明黑 |
| 主体渐变 | 立体球面 | `createRadialGradient` 左上亮 → 右下暗 |
| 顶部高光月牙 | 果冻反光 | `ellipse` 白色半透明，倾斜 -0.5 弧度 |
| 小亮点 | 高光点睛 | `arc` 白色不透明 |

颜色取自 `type.light / type.body / type.stroke`（CONFIG 里每种蛇定义）。

### 头部（`drawJellyHead`）

- **眼睛朝向移动方向**：瞳孔随 `direction` 偏移（`eyeOffsetX/Y`）
- **眼白 + 瞳孔 + 瞳孔高光** 三层
- **微笑嘴巴**：弧线
- **粉红信子**：朝运动方向吐出，末端分叉（用 `perp` 垂直向量算分叉）
- **头顶装饰**（`drawHeadDecoration`，按蛇种）：
  - 苹果蛇 → 小叶子（椭圆 + 描边）
  - 闪闪蛇 → 黄色闪电（多边形）
  - 星星蛇 → 五角星（`drawStar`）

### 身体节装饰（`drawBodyDecoration`，按蛇种）

| 蛇 | 身体纹理 |
|---|---|
| 苹果蛇 | 红色苹果斑（半透明圆） |
| 闪闪蛇 | 黄色电弧条纹（折线） |
| 星星蛇 | 黄色星光点 |
| 蓝莓蛇 | 蓝色露珠高光（双圆） |
| 彩虹蛇 | 流动彩虹环（颜色按 index 循环：红橙绿蓝紫） |

### 尾部渐细

身体节半径随离尾距离递减：`r = baseRadius × max(0.55, 1 - distFromTail × 0.06)`

### 桌面绘制比例（`CONFIG.visualScale`）

| 字段 | 当前值 | 作用 |
|---|---:|---|
| `snakeRadius` | `0.42` | 蛇身基础半径，保持在当前格中心附近 |
| `headScale` | `1.04` | 蛇头放大比例，表情可见但不跨格 |
| `treatRadius` | `0.43` | 食物/苹果半径，主体落在单格内 |
| `sparkleScale` | `0.85` | 食物外圈星光范围，不干扰相邻格 |

### 等级视觉奖励

| 等级 | 视觉变化 |
|---|---|
| 2 级 | `drawLevelAura()` 为蛇头和身体增加柔光 |
| 4 级 | `spawnEatEffect()` 增加粒子数量和奖励飘字 |
| 5 级 | 蛇头绘制星光皮肤标记 |

---

## 🍎 苹果的渲染（`drawApple`）

从"双圆球"升级为**立体心形**，绘制层次：

| 层 | 作用 |
|---|---|
| 目标提示 | 先由 `drawTargetHint()` 绘制格子高亮和中心点 |
| 投影 | 贴地阴影 |
| 主体渐变 | 径向渐变（左上亮 → 右下暗） |
| 心形轮廓 | 两个略扁的圆叠加（`arc(cx±0.32r)`） |
| 顶部凹陷 | 小三角阴影模拟心形凹陷 |
| 苹果柄 | 弯曲曲线（`quadraticCurveTo`） |
| 叶子 | 椭圆 + 叶脉直线 |
| 主高光 | 大椭圆白色半透明 |
| 小亮点 | 小圆白色不透明 |

### 特效标识

| 苹果 | 特效渲染 |
|---|---|
| 蓝苹果 | 白色 ❄ 字符 |
| 紫苹果 | 白色 ▽ 字符 |
| 金苹果 | 外圈金色发光环（`arc(r×1.15)`） |

---

## 🌈 主题系统

### 主题配置（`CONFIG.themes`）

```javascript
themes: [
  {
    id: "orchard", name: "果园",
    boardLight: "#d9f4ad",    // 柔和草地浅色
    boardDark: "#d3efa6",     // 柔和草地暗色
    boardBorder: "#176c25",   // 边框深色
    boardInner: "#55b929",    // 内边框
    grid: "rgba(112, 158, 70, 0.055)",  // 低对比网格线
    wood: "#8b5a2b",          // 木栅栏主色
    woodDark: "#6c3611"       // 木栅栏深色
  },
  { id: "moonlit", name: "月夜", ... },  // 深蓝紫
  { id: "snow", name: "雪地", ... }      // 冷白蓝
]
```

### 主题切换

- `state.themeId` 持有当前主题 id
- `currentTheme()` 按 id 取主题对象
- `drawBackground()` 先铺主题底色，再用 `drawSoftArenaTexture()` 加柔和草地块，最后画低透明网格
- 切换走 `switchTheme(themeId)`：改 state → 写回玩家档案 → 刷新按钮高亮
- **主题跟随玩家持久化**：每个玩家记住自己的主题

### 添加新主题

只需在 `CONFIG.themes` 数组加一个对象，会自动出现在底部切换器里（`renderThemeSwitcher` 遍历 `CONFIG.themes`）。

---

## ✨ 特效系统

### 数据结构

`state.effects` 是一个特效队列，每个特效对象：

```javascript
{
  kind: "particle" | "floatText",
  x, y,                    // 起始位置
  bornAt: timestamp,       // 创建时间
  life: ms,                // 存活时长
  // particle 专属：
  vx, vy,                  // 速度向量
  size,                    // 粒子大小
  color: "rgba(R,G,B,ALPHA)",  // ALPHA 是占位符，渲染时替换
  // floatText 专属：
  text: "+10"
}
```

### 渲染（`drawEffects`）

每帧执行：
1. 用 `performance.now()` 过滤掉过期特效（`now - bornAt >= life`）
2. 遍历渲染：
   - **粒子**：位置随时间移动（`vx × age × 40`）+ 重力下坠（`age² × 30`）+ 透明度递减 + 大小递减
   - **飘字**：向上飘（`-age × 50`）+ 透明度递减 + 白描边

### 触发（`spawnEatEffect`）

吃苹果时调用，生成：
- 10 个粒子（颜色取自苹果的 fill/light/白，向外飞溅）
- 1 个 `+分数` 飘字

### 添加新特效

```javascript
// 在触发处调用
state.effects.push({
  kind: "yourKind",
  x, y, bornAt: performance.now(), life: 1000,
  /* 你的数据 */
});

// 在 drawEffects() 加分支
else if (e.kind === "yourKind") { /* 渲染逻辑 */ }
```

---

## 🎨 配色规范

### 蛇种配色（`CONFIG.snakeTypes`）

每种蛇有 4 个颜色字段：

| 字段 | 用途 |
|---|---|
| `light` | 渐变最亮色（径向渐变起点） |
| `head` | 头部高亮色（也是渐变中段） |
| `body` | 身体主色（渐变中段 + 连接线） |
| `stroke` | 描边深色（渐变终点 + 轮廓） |

### 苹果配色（`CONFIG.appleTypes`）

| 字段 | 用途 |
|---|---|
| `light` | 渐变最亮色 |
| `fill` | 主色 |
| `stroke` | 描边深色 |
| `sparkle` | 高光色（目前未用，保留） |

---

## 🛠️ 工具函数

| 函数 | 作用 |
|---|---|
| `currentTheme()` | 取当前主题对象 |
| `strokeBodyPath(ctx, body)` | 用线段连接蛇身所有节点 |
| `drawStar(cx, cy, r, fill, stroke)` | 画五角星 |
| `hexToRgb(hex)` | "#ff0000" → "255,0,0"（用于粒子颜色 alpha 替换） |
| `spawnEatEffect(cx, cy, appleType)` | 触发吃苹果特效 |

---

## 📐 关键尺寸

| 项 | 值 |
|---|---|
| 棋盘 | 30 × 30 格 |
| Canvas | 1200 × 1200 px（`CELL_SIZE = 40`） |
| 蛇身节半径 | `CELL_SIZE × 0.38` |
| 蛇头半径 | `CELL_SIZE × 0.38 × 1.1` |
| 苹果半径 | `CELL_SIZE × 0.3` |

---

## 🔄 视觉迭代历史

| 版本 | 视觉状态 |
|---|---|
| v0.1.0 | 圆球串蛇身 + 双圆球苹果（原始简陋版） |
| v0.3.0 | 3D 果冻立体风 |
| v0.4.0 | **果冻小蛇竞技场风**（当前）：软管身体、大表情头、发光食物、功能商店 |

样品页 `snake-style-sample.html` 是 v0.3.0 开发时的独立预览，展示了各蛇种和苹果的静态造型，可作为视觉参考。
