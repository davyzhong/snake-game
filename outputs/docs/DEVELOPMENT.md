# 🛠️ 开发指南 (DEVELOPMENT)

本文档说明如何运行、调试、截图、回退，以及代码规范。

---

## 🚀 运行项目

### 方式一：双击打开（最简单）
直接双击 `snake-game.html`，用默认浏览器打开。

### 方式二：命令行
```bash
open snake-game.html          # macOS
# 或
xdg-open snake-game.html      # Linux
```

**无需安装任何依赖**。纯原生 HTML + CSS + JS，无 Node、无构建工具、无包管理器。

### 浏览器要求
- Chrome / Edge / Safari / Firefox 任意现代浏览器
- 需要支持 `localStorage`、`Canvas 2D`、`requestAnimationFrame`（所有现代浏览器都支持）

---

## 🔍 调试

### 打开开发者工具
- macOS：`Cmd + Option + I`
- Windows/Linux：`F12` 或 `Ctrl + Shift + I`

### 查看/修改存档
在 Console 里：
```javascript
// 查看全部存档
JSON.parse(localStorage.getItem("snake-players"))

// 查看当前 state
state

// 切换主题测试
switchTheme("moonlit")

// 切换玩家测试
switchPlayer("p2")

// 清空所有存档（慎用，会丢失进度）
localStorage.clear()
```

### 常见问题排查

| 问题 | 排查方向 |
|---|---|
| 页面空白 | Console 看是否有 JS 报错 |
| 数据丢失 | 检查是否清理了浏览器数据 / 换了浏览器 |
| 画面卡顿 | 检查 `state.effects` 是否积压过多 |
| 蛇不动 | 检查 `state.phase` 是否为 `playing` |

---

## 📸 截图留档

每个开发阶段完成时截图留档，命名规范：

```
snake-game-{阶段或特性名}-{desktop|mobile}.png
```

示例：
- `snake-game-stage0-desktop.png`
- `snake-game-visual-desktop.png`
- `snake-game-theme-switch-mobile.png`

**截图方法**：
- macOS：`Cmd + Shift + 4` 框选，或 `Cmd + Shift + 5` 全屏/窗口
- 浏览器开发者工具的设备模拟器可截移动端

---

## ↩️ 回退

### 文件级回退

| 文件 | 作用 |
|---|---|
| `snake-game.html` | 当前最新版 |
| `snake-game-v1-backup.html` | v0.1.0 原始版（重构前，1279 行） |

回退到原始版：
```bash
cp snake-game-v1-backup.html snake-game.html
```

### 存档级回退

如果新代码导致存档出问题，旧版 3 个 key 还在（兜底）：
```javascript
// 在 Console 里删掉新版存档，强制走迁移逻辑重建
localStorage.removeItem("snake-players")
// 然后刷新页面，会从旧 key 迁移回来
```

---

## 📝 代码规范

### 命名
- **函数**：`camelCase`，动词开头（`drawSnake`, `placeApples`, `getSnakeLevel`）
- **变量**：`camelCase`（`tickMs`, `headRadius`）
- **常量**：`UPPER_SNAKE_CASE`（`CELL_SIZE`, `DIR_VECTORS`）
- **配置项**：集中在 `CONFIG` 对象里
- **DOM 节点**：集中在 `els` 对象里

### 分层约定
- **LOGIC 层不碰 DOM**：纯逻辑函数只读写 `state`
- **RENDER 层只画**：绘制函数只读 `state`，不修改它
- **DOM 更新走 syncHud**：HUD 文本由 `loop` 每帧投影，不散落在逻辑里

### 注释
- 每个层用 `/* ===== 层名 ===== */` 大注释块分隔
- 复杂逻辑加行内注释说明"为什么"
- 数据结构加字段说明

### 新增功能在哪里加

| 要加的 | 改哪里 |
|---|---|
| 新蛇种 | `CONFIG.snakeTypes` + `drawBodyDecoration` / `drawHeadDecoration` 加分支 |
| 新苹果 | `CONFIG.appleTypes` + `drawApple` 加特效标识分支 |
| 新主题 | `CONFIG.themes` 加对象（自动出现） |
| 新商店功能 | `CONFIG.shopItems` 加对象 + `applyShopItem` 加分支 |
| 新特效 | `spawnXxx()` + `drawEffects()` 加 kind 分支 |
| 障碍物 | `state.obstacles` + `drawObstacles`（`isCellBlocked` 已预留） |
| 存档字段 | `newDefaultPlayer` 加字段 + `applyPlayerToState` 读取 |

---

## 🧪 测试

### 语法检查
```bash
node --check <(sed -n '/<script>/,/<\/script>/p' snake-game.html | sed '1d;$d')
```

### 逻辑断言
用 Node 模拟核心逻辑路径，写 `console.assert` 断言。已验证过的路径：
- 等级计算（各经验值 → 正确等级）
- 分数倍率（含等级加成）
- 撞墙结束
- 吃苹果加分 + 生长
- 多玩家隔离（p2 玩一局不影响 p1）
- 老存档迁移
- 上限 4 个拒绝第 5 个
- 删除当前玩家自动切换
- 持久化（关页面重开）

### 人工验收清单
每次改动后检查：
- [ ] 选蛇 → 开始 → 移动 → 吃苹果 → 撞死 → 结算 → 再玩，整圈顺畅
- [ ] 暂停/继续正常
- [ ] 切换玩家数据隔离
- [ ] 切换主题生效
- [ ] 历史记录、最高分、经验正常

---

## 🔄 文档维护约定

每完成一个开发阶段，**必须同步更新**：
1. `CHANGELOG.md` 追加新版本条目
2. `README.md` 更新"当前版本"段
3. 涉及的专题文档（ARCHITECTURE/GAMEPLAY/STORAGE/VISUAL）更新对应章节
4. `ROADMAP.md` 把完成项从"待开发"移到"已完成"

**数据准确性**：文档里所有数字（蛇种属性、苹果分数、阈值等）以 `snake-game.html` 里 `CONFIG` 对象的实际值为准。如果改了 CONFIG，同步改文档。

---

## 📂 完整目录结构

```
outputs/
├── snake-game.html              # 主程序（唯一源码）
├── snake-game-v1-backup.html    # v0.1.0 原始版备份
├── snake-style-sample.html      # 阶段1 视觉样品页
├── snake-game-*.png             # 开发截图（25 张）
└── docs/
    ├── README.md                # 总入口
    ├── CHANGELOG.md             # 改动历史
    ├── ARCHITECTURE.md          # 架构设计
    ├── GAMEPLAY.md              # 玩法说明
    ├── STORAGE.md               # 存档系统
    ├── VISUAL.md                # 视觉系统
    ├── ROADMAP.md               # 路线图
    └── DEVELOPMENT.md           # 本文件
```
