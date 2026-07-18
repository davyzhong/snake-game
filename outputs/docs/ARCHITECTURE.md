# 🏗️ 架构设计 (ARCHITECTURE)

本文档说明 `snake-game.html` 的代码架构。整个游戏是**单文件**应用（HTML + CSS + 内嵌 JS），约 2146 行，无外部依赖、无构建工具。

---

## 📐 整体分层

代码按职责分为 **7 层**，从上到下依次为：

```
┌─────────────────────────────────────────────┐
│  HTML 结构（DOM 节点）                       │  <body> 里的元素
├─────────────────────────────────────────────┤
│  CSS 样式                                    │  <style> 里的样式
├─────────────────────────────────────────────┤
│  CONFIG    静态配置（蛇种/苹果/主题/阈值）    │
│  STATE     单一运行时状态对象                 │
│  DOM       节点缓存（els 对象）               │
│  LOGIC     纯游戏逻辑（移动/碰撞/苹果/存档）  │
│  RENDER    纯绘制（背景/蛇/苹果/特效）        │
│  INPUT     键盘 + 触控事件                    │
│  LOOP      requestAnimationFrame 固定步长循环 │
│  INIT      初始化入口                        │
└─────────────────────────────────────────────┘
```

各层用 `/* ===== 层名 ===== */` 注释块分隔，便于定位。

---

## 🔧 CONFIG 层 · 静态配置

集中所有"不变量"，便于后续阶段扩展。**修改游戏数值改这里**。

```javascript
const CONFIG = {
  cells: 30,                    // 棋盘格数（30×30）
  appleCount: 12,               // 同屏苹果数量
  levelThresholds: [0, 100, 250, 500, 900],  // 各等级经验阈值（共5级）
  appleTypes: [...],            // 4 种苹果配置（见下）
  snakeTypes: [...],            // 6 种蛇配置（见下）
  themes: [...],                // 3 个主题配置（见 VISUAL.md）
  storageKeys: { legacyBest, legacyHistory, legacyProgress, players },
  players: { maxCount: 4, defaultAvatars: ["🦊","🐰","🐯","🐼","🐸","🦁","🐨","🐵"] }
};
```

### 派生常量

依赖 `canvas` 元素，故放在 DOM 缓存之后：

```javascript
const CELL_SIZE = els.canvas.width / CONFIG.cells;   // 每格像素尺寸
const APPLE_TYPE_BY_ID = Object.fromEntries(...);     // id → 苹果配置
const SNAKE_TYPE_BY_ID = Object.fromEntries(...);     // id → 蛇配置
const DIR_VECTORS = { up, down, left, right };        // 方向向量
```

> ⚠️ **注意 JS 提升顺序**：派生常量依赖 `canvas`，必须放在 `els` 缓存之后，否则 `const` 不提升会报 `ReferenceError`。这是 v0.2.0 修复过的 bug。

---

## 🎯 STATE 层 · 单一状态对象

**所有运行时状态集中在一个 `state` 对象**，替代原来 14 个散落的 `let` 变量。

```javascript
const state = {
  phase: "menu",              // 游戏阶段：menu | playing | paused | gameover

  snake: {
    body: [...],              // [{x,y}...]，body[0] 是头
    direction: {x, y},        // 当前实际方向
    nextDirection: {x, y}     // 缓冲方向（下个 tick 生效，防反向自杀）
  },
  apples: [...],              // [{x, y, type}]
  obstacles: [],              // 阶段2 用，目前为空
  score: 0,
  best: 0,                    // 当前激活玩家的最高分（镜像）
  coins: 0,                   // 当前激活玩家的糖豆（镜像）

  // 多玩家
  players: {},                // 全部玩家档案 { id: playerObj }
  activePlayerId: null,       // 当前激活玩家 id
  roundHistory: [...],        // 当前玩家历史（镜像）
  progress: {},               // 当前玩家各蛇经验（镜像）
  themeId: "orchard",         // 当前主题 id

  selectedSnakeType: null,    // 当前选中的蛇种对象

  timing: {
    tickMs,                   // 当前步长（受蓝苹果减速影响）
    accumulator,              // 固定步长累加器
    lastFrameAt,              // 上一帧时间戳
    speedEffectUntil,         // 减速效果到期时间戳（0=无效果）
    pauseStartedAt            // 暂停开始时间，用于冻结限时功能
  },

  combo: { count, expireAt },           // 阶段3 用
  skill: { cooldownUntil, activeUntil }, // 阶段2 用
  powerups: { magnetUntil, shieldCharges }, // 棋盘下方功能栏购买的局内效果
  effects: []                           // 阶段1 粒子/飘字特效队列
};
```

**设计原则**：`state` 是唯一数据源。`best/roundHistory/progress` 始终是"当前激活玩家"的运行时镜像，落盘时写回对应玩家字段（见 [STORAGE.md](./STORAGE.md)）。

---

## 🖥️ DOM 层 · 节点缓存

所有 DOM 引用集中在 `els` 对象，避免反复 `querySelector`。

```javascript
const els = {
  canvas, ctx,
  score, best, roundCount,
  currentSnakeHud, currentLevelHud, currentXpHud,
  recordToggle, historyPanel, historyList, historyEmpty,
  boardShopList,
  message, messageTitle, messageText, startButton, restartButton,
  controls, snakeOptionButtons,
  playerBar, playerAdd, playerModal, playerModalTitle,
  playerNameInput, avatarPicker, playerSaveBtn, playerCancelBtn, playerDeleteBtn,
  themeSwitcher
};
```

---

## ⚙️ LOGIC 层 · 游戏逻辑

纯逻辑函数，尽量不碰 DOM。核心函数：

### 游戏循环逻辑
- `step(now)` —— 单步推进：移动、碰撞检测、吃苹果、触发效果
- `newGame()` —— 开始新局：重置蛇/苹果/分数
- `endGame()` —— 结束：记录历史、加经验、显示结算
- `togglePause()` / `setPhase(phase)` —— 阶段切换

### 苹果逻辑
- `placeApples()` —— 补满苹果到 `appleCount`，避开蛇身/苹果/障碍
- `chooseAppleType()` —— 按概率随机选苹果种类
- `applyAppleEffect(type, now)` —— 蓝（减速）/紫（变短）效果
- `setTemporarySpeed(tickMs, durationMs, now)` —— 临时变速
- `shrinkSnake(amount)` —— 缩短蛇身

### 等级/经验
- `getSnakeLevel(xp)` —— 经验→等级
- `getSnakeProgress(snakeId)` —— 查某蛇进度
- `getEffectiveScoreMultiplier(type)` —— 实际得分倍率（含等级加成）
- `addSnakeExperience(points)` —— 加经验并返回升级信息

### 玩家存档（见 [STORAGE.md](./STORAGE.md)）
- `loadStorage()` / `saveBest()` / `saveHistory()` / `saveProgress()` / `saveLastSnake()` / `savePlayers()`
- `createPlayer` / `switchPlayer` / `deletePlayer` / `renamePlayer`

### 方向控制
- `setDirection(name)` —— 设置方向，禁止 180° 反向

---

## 🎨 RENDER 层 · 绘制

纯绘制函数，每帧由 `loop` 调用 `render()`。**改画面改这里**（详见 [VISUAL.md](./VISUAL.md)）。

```
render()
  ├─ drawBackground()          双色草地格 + 网格细线（主题驱动）
  ├─ apples.forEach(drawApple) 立体心形苹果
  ├─ drawSnakeBody()           平滑身体连接 + 逐节立体化 + 头部
  └─ drawEffects()             粒子爆裂 + 飘字
```

绘制顺序：背景 → 苹果 → 蛇 → 特效（特效在最上层）。

---

## 🎮 INPUT 层 · 输入处理

- **键盘**：方向键移动、空格暂停/开始、Escape 关闭弹窗、Enter 保存玩家
- **触控**：屏幕方向按钮、玩家头像点击/双击、主题按钮、弹窗按钮
- 点击页面空白处关闭历史面板

输入只改 `state`，不改 DOM（DOM 由 `loop` 的 `syncHud` 投影）。

---

## 🔁 LOOP 层 · 固定步长游戏循环

**核心改进**（v0.2.0）：从 `setInterval` 改为 `requestAnimationFrame + accumulator`。

```javascript
function loop(now) {
  const delta = now - state.timing.lastFrameAt;
  state.timing.lastFrameAt = now;

  // 1. 减速效果到期检查
  if (speedEffectUntil > 0 && now >= speedEffectUntil) 恢复原速;

  // 2. 固定步长推进逻辑
  if (phase === "playing") {
    accumulator += delta;
    // 防切后台积压过久导致一次性大跳
    if (accumulator > tickMs * 5) accumulator = tickMs;
    while (accumulator >= tickMs) {
      step(now);
      accumulator -= tickMs;
      if (phase !== "playing") break;  // step 内可能 endGame
    }
  }

  // 3. 每帧渲染 + HUD 同步
  render();
  syncHud();
  requestAnimationFrame(loop);
}
```

**为什么这样设计**：
- 固定 tick 步长保证逻辑稳定（不受帧率波动影响）
- 渲染每帧执行，支持粒子/飘字等连续动画
- accumulator 限幅防止切后台后回来一次性跳很多步

---

## 🎯 阶段状态机

`state.phase` 显式驱动 UI：

| phase | 含义 | UI 表现 |
|---|---|---|
| `menu` | 菜单（选蛇/选玩家） | 显示遮罩"先选一条小蛇" |
| `playing` | 游戏中 | 隐藏遮罩，跑循环 |
| `paused` | 暂停 | 显示"暂停中"遮罩 |
| `gameover` | 结算 | 显示"游戏结束"+ 得分经验 |

切换走 `setPhase(phase)`，替代原来零散的 `running/paused/message.hidden` 组合判断。后续阶段加新界面（技能键、Combo 提示、任务弹窗）都挂到 `phase` 上。

---

## 📁 文件组织

```
snake-game.html  内部结构:
  <head>
    <style>          全部 CSS（含响应式 @media）
  <body>
    <main class="game">
      <section class="topbar">      标题 + 玩家切换器 + 分数栏 + 记录/重启按钮 + 历史面板
      <section class="play-layout"> 左右蛇选择栏 + 中央棋盘 canvas + 遮罩
      <section class="quick-help">  苹果说明 + 主题切换器 + 方向按钮
      <div class="modal">           玩家新建/编辑弹窗
    <script>                        7 层 JS 代码
```

---

## 🧩 扩展指引

后续阶段在哪里加代码：

| 要加的功能 | 改哪里 |
|---|---|
| 新蛇种 | `CONFIG.snakeTypes` + `drawBodyDecoration` / `drawHeadDecoration` |
| 新苹果 | `CONFIG.appleTypes` + `drawApple` |
| 新主题 | `CONFIG.themes`（自动出现在切换器） |
| 新商店功能 | `CONFIG.shopItems` + `applyShopItem` |
| 障碍物 | `state.obstacles` + `drawObstacles` + `isCellBlocked` 已预留 |
| 主动技能 | `state.skill` 已预留 + 新增触发键 + 渲染冷却条 |
| 连击系统 | `state.combo` 已预留 + `step` 里连吃检测 |
| 新特效 | `spawnXxxEffect()` + `drawEffects()` 加分支 |
