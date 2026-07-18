# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

贪吃蛇吃苹果 —— 一款单文件 HTML5 网页游戏。纯原生 HTML + CSS + JavaScript + Canvas，**无后端、无构建工具、无依赖、双击即玩**。当前版本 v0.3.0（阶段 1 视觉重做完成）。

## 常用命令

```bash
# 运行
open snake-game.html                    # macOS，直接双击也行

# JS 语法检查（从 HTML 里抽出 <script> 内容过 node --check）
node --check <(sed -n '/<script>/,/<\/script>/p' snake-game.html | sed '1d;$d')

# 在浏览器 Console 里调试
state                                  # 查看运行时状态
switchTheme("moonlit")                 # 切主题
switchPlayer("p2")                     # 切玩家
JSON.parse(localStorage.getItem("snake-players"))  # 查存档
```

无 Node、无包管理器、无构建步骤。测试靠浏览器里跑 + `console.assert` 断言核心逻辑路径。

## 架构

**整个游戏在一个文件 `snake-game.html`（约 2146 行）里**。代码用 `/* ====...==== */` + `/* ---- 层名：描述 ---- */` 两行注释块分隔为 7 层，自上而下：

**定位层**：`grep -n "---- " snake-game.html` 跳到大块，或 `grep -n "函数名" snake-game.html` 定位具体函数。

| 层 | 职责 | 关键对象 |
|---|---|---|
| HTML | `<body>` DOM 结构 | — |
| CSS | `<style>` 样式 | — |
| CONFIG | 静态配置（蛇种/苹果/主题/阈值） | `CONFIG` 对象 |
| STATE | 单一运行时状态 | `state` 对象 |
| DOM | 节点缓存 | `els` 对象 |
| LOGIC | 纯游戏逻辑（不碰 DOM） | `step`, `newGame`, `endGame`, `placeApples` |
| RENDER | 纯绘制（只读 state，不改） | `drawSnakeBody`, `drawApple`, `drawEffects` |
| INPUT | 键盘 + 触控 | — |
| LOOP | `requestAnimationFrame` 固定步长 | `loop()` |
| INIT | 初始化入口 | — |

### 关键设计约束

- **`state` 是唯一数据源**。`best / roundHistory / progress` 是当前激活玩家的运行时镜像，落盘时写回对应玩家字段。
- **LOGIC 层不碰 DOM，RENDER 层不改 state**。HUD 文本由 `loop` 每帧投影，不散落在逻辑里。
- **派生常量**（`CELL_SIZE`, `APPLE_TYPE_BY_ID`, `SNAKE_TYPE_BY_ID`, `DIR_VECTORS`）依赖 `canvas`，**必须放在 `els` 缓存之后**，否则 `const` 不提升会报 `ReferenceError`（v0.2.0 修过的 bug）。
- **游戏循环是固定步长**：`requestAnimationFrame` + `accumulator`，`tickMs` 受蓝苹果减速效果影响。
- **阶段状态机**：`state.phase` 取值 `menu | playing | paused | gameover`。

### 多玩家存档

`localStorage["snake-players"]` 存一棵玩家树（最多 4 个），结构见 `docs/STORAGE.md`。旧版 3 个 key（`snake-best-score`, `snake-round-history`, `snake-progress`）保留作迁移兜底，不删除。

## 在哪里加新功能

| 要加 | 改哪里 |
|---|---|
| 新蛇种 | `CONFIG.snakeTypes` + `drawBodyDecoration` / `drawHeadDecoration` 加分支 |
| 新苹果 | `CONFIG.appleTypes` + `drawApple` 加特效标识分支 |
| 新主题 | `CONFIG.themes` 加对象（UI 自动出现） |
| 新特效 | `spawnXxx()` + `drawEffects()` 加 kind 分支 |
| 障碍物 | `state.obstacles` + `drawObstacles`（`isCellBlocked` 已预留） |
| 存档字段 | `newDefaultPlayer` 加字段 + `applyPlayerToState` 读取 |
| 主动技能 | `CONFIG.skills` + `activateSkill()` + `drawSkillButton()` + Q 键 |

## 开发纪律

**每次改代码的四步闭环**：
1. **大改前备份**：`cp snake-game.html snake-game-vX-backup.html`（已有 v1 备份）
2. **改码**：在 `snake-game.html` 对应层里改，先用 grep 定位到层
3. **浏览器验收**：`open snake-game.html`，跑人工验收清单（见下）
4. **同步文档**：改 `CONFIG` 数值必须同步改 `docs/` 里引用该数值的文档；新增特性写 `CHANGELOG.md`

**硬规则**：
- 不能让游戏跑不起来就提交——卡住时回退到最近能跑的备份
- 不要为了绕过报错注释掉代码，找根本原因
- 2146 行单文件：**先 grep 定位层，再 Edit**，不要盲改

## 开发阶段与路线图

严格按阶段走，每个阶段验收完再推下一个。当前进度：

- ✅ 阶段 0 · 地基重构（v0.2.0）
- ✅ 多玩家档案系统（v0.2.1）
- ✅ 阶段 1 · 视觉重做（v0.3.0）
- ⏳ **阶段 2 · 障碍物 + 主动技能**（下一个，详见 `docs/ROADMAP.md`）
- ⏳ 阶段 3 · 连击 Combo + 关卡递进
- ⏳ 阶段 4 · 任务成就 + 商店

## 文档维护约定

每完成一个开发阶段，**必须同步更新**：
1. `docs/CHANGELOG.md` 追加新版本条目
2. `docs/README.md` 更新"当前版本"段
3. 涉及的专题文档（ARCHITECTURE / GAMEPLAY / STORAGE / VISUAL）
4. `docs/ROADMAP.md` 把完成项移到"已完成"

**数据准确性**：文档里所有数字（蛇种属性、苹果分数、阈值等）以 `snake-game.html` 里 `CONFIG` 对象的实际值为准。改 CONFIG 必须同步改文档。

## 命名规范

- 函数 `camelCase` 动词开头（`drawSnake`, `placeApples`）
- 变量 `camelCase`（`tickMs`, `headRadius`）
- 常量 `UPPER_SNAKE_CASE`（`CELL_SIZE`, `DIR_VECTORS`）
- 配置集中放 `CONFIG`，DOM 引用集中放 `els`
- 截图命名：`snake-game-{阶段或特性名}-{desktop|mobile}.png`

## 文件说明

```
outputs/
├── snake-game.html              # 主程序（唯一源码）
├── snake-game-v1-backup.html    # v0.1.0 原始版备份（回退用）
├── snake-style-sample.html      # 阶段1 视觉样品页（独立预览）
├── snake-game-*.png             # 开发截图
└── docs/                        # 规范文档库（README/ARCH/GAMEPLAY/STORAGE/VISUAL/ROADMAP/DEV/CHANGELOG）
```

## 人工验收清单

每次改动后检查：
- 选蛇 → 开始 → 移动 → 吃苹果 → 撞死 → 结算 → 再玩，整圈顺畅
- 暂停/继续正常
- 切换玩家数据隔离
- 切换主题生效
- 历史记录、最高分、经验正常
