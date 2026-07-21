# 架构设计

`snake-game.html` 是一个无构建步骤的单文件桌面网页游戏：HTML、CSS 和 JavaScript 都在同一文件中，图像资源位于 `outputs/assets/`。当前主文件约 5,300 行，代码按注释块分为配置、状态、存档、规则、渲染、UI、循环和输入。

## 分层

| 层 | 主要职责 |
|---|---|
| `CONFIG` | 26×26 棋盘、12 条蛇、20 级经验表、食物、商店、任务、主题、素材路径 |
| `state` | 唯一运行时数据源：局面、玩家、时间、道具、特效、挑战与宝箱 |
| 存档 | `loadStorage()` 与 `savePlayers()`，把当前玩家的镜像状态写入 `localStorage` |
| 规则 | 移动、碰撞、食物、蛇天赋、宝箱、任务、商店和结算 |
| Canvas 渲染 | 棋盘、食物、蛇、道具、特效与文字反馈 |
| DOM/UI | 顶部状态、蛇选择、玩家、任务、商店、弹窗与历史记录 |
| 循环/输入 | `requestAnimationFrame` 固定步长循环；键盘与点击输入 |

## 关键配置

```js
const CONFIG = {
  cells: 26,
  appleCount: 12,
  levelThresholds: [0, 100, /* ... */, 18900], // 共 20 级
  snakeTypes: [/* 12 条蛇 */],
  appleTypes: [/* 红、金、蓝、紫 */]
};
```

`CELL_SIZE = canvas.width / CONFIG.cells`。所有交互对象用 `cellCenter()` 和 `cellRect()` 定位，保证蛇、食物和网格完全对齐。

## 状态与计时

`state.phase` 只有 `menu`、`playing`、`paused`、`gameover` 四种状态。玩家或小蛇只能在非局内状态切换，避免一局中途换存档或换天赋。

局内时间使用 `state.timing.gameNow`，由 `advanceGameClock(delta)` 只在 `playing` 状态增加。浏览器页面隐藏时，`visibilitychange` 会自动调用 `pauseRound()`；暂停、礼盒选择以及后台停留都不会消耗磁铁、慢动作和生存任务时间。移动循环的 accumulator 仍会限幅，避免恢复页面后连续跳格。

## 渲染性能

每帧执行 `render()`，但不会重新生成静态棋盘：

```text
getBoardBackgroundCache()
  └─ 按主题和 Canvas 尺寸生成一次草地格、柔和纹理、网格线

render()
  ├─ 绘制缓存棋盘
  ├─ 绘制动态目标、食物、棋盘道具和奖励
  ├─ 绘制蛇
  └─ 绘制粒子和提示文字
```

主题或 Canvas 尺寸变化时缓存自动重建。顶部 HUD 也用快照比较，只在分数、糖豆、局数、蛇等级或经验真正变化时更新 DOM。

## 存档模型

`state.best`、`state.coins`、`state.roundHistory`、`state.progress` 等字段是当前玩家的运行时镜像。保存函数先回写 `players[activeId]`，再由 `savePlayers()` 一次写入 `snake-players`。完整结构见 [STORAGE.md](./STORAGE.md)。

## 自动检查

- `work/tests/check-snake-options.mjs`：检查素材、布局约束、关键函数与静态规则。
- `work/tests/game-rules.mjs`：在轻量假 DOM 中执行真实游戏脚本，验证玩家锁定、宝箱持久化、计时、自动暂停、蛇天赋等关键路径。

运行方式见 [DEVELOPMENT.md](./DEVELOPMENT.md)。
