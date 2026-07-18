# 💾 存档系统 (STORAGE)

本文档说明数据如何保存、读取、隔离和迁移。

---

## 🔑 localStorage Key 一览

游戏使用浏览器的 `localStorage` 持久化数据，共涉及 4 个 key：

| Key | 用途 | 版本 | 当前是否使用 |
|---|---|---|---|
| `snake-players` | **多玩家总存档**（新版主存档） | v0.2.1+ | ✅ 主用 |
| `snake-best-score` | 最高分（旧版单份） | v0.1.0 | ⚠️ 仅迁移用，保留兜底 |
| `snake-round-history` | 历史记录（旧版单份） | v0.1.0 | ⚠️ 仅迁移用，保留兜底 |
| `snake-progress` | 各蛇经验（旧版单份） | v0.1.0 | ⚠️ 仅迁移用，保留兜底 |

> **设计决策**：旧版 3 个 key 迁移后**不删除**，作为兜底——万一新逻辑有 bug，旧数据还在，可手动恢复。

---

## 📦 主存档结构（`snake-players`）

一棵完整的 JSON 树，包含所有玩家的所有数据：

```javascript
{
  "version": 1,
  "activeId": "p1",              // 当前激活玩家 id
  "players": {
    "p1": {
      "id": "p1",
      "name": "玩家1",            // 显示名（最多 8 字）
      "avatar": "🦊",             // emoji 头像
      "best": 250,                // 最高分
      "coins": 120,               // 糖豆，可在局内功能栏购买道具
      "roundHistory": [           // 最近 8 局记录
        { "snake": "稳稳蛇", "score": 250, "time": "10:00" }
      ],
      "progress": {               // 各蛇经验 { snakeId: xp }
        "sprout": 250,
        "coin": 80
      },
      "lastSnakeId": "sprout",    // 上次选的蛇 id
      "themeId": "orchard",       // 主题选择
      "createdAt": 1720080000000  // 创建时间戳
    },
    "p2": { ... }
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `version` | number | 存档结构版本号（当前 1），便于未来结构升级时迁移 |
| `activeId` | string | 当前激活玩家 id，重新打开时恢复到此玩家 |
| `players[id].id` | string | 玩家唯一 id（`p1`, `p2`, ... 自动生成） |
| `players[id].name` | string | 显示名，新建/编辑时输入，最多 8 字 |
| `players[id].avatar` | string | emoji 头像，从 8 个预设里选 |
| `players[id].best` | number | 最高分 |
| `players[id].coins` | number | 糖豆余额，每局结束后按分数增加，可在局内功能栏购买功能 |
| `players[id].roundHistory` | array | 最近 8 局，每条含 snake/score/time |
| `players[id].progress` | object | 各蛇经验，key 是蛇 id，value 是经验值 |
| `players[id].lastSnakeId` | string | 上次选的蛇 id，下次进入默认选中 |
| `players[id].themeId` | string | 主题 id（orchard/moonlit/snow） |
| `players[id].createdAt` | number | 创建时间戳（毫秒） |

---

## 🔄 读写流程

### 加载时（`loadStorage`）

```
1. 读 localStorage["snake-players"]
   ├─ 有且有效 → 直接用
   └─ 无或损坏 → 检查旧版 key
        ├─ 有旧版数据 → migrateLegacyPlayers() 迁移成 p1
        └─ 全新用户 → 创建默认玩家 p1
2. applyPlayerToState(activeId) 把激活玩家数据灌进 state 运行时字段
```

### 运行时（`state` 是镜像）

`state.best / roundHistory / progress` 始终是**当前激活玩家**的运行时镜像：

```
玩家操作 → 改 state.xxx → saveXxx() 同时写回 players[activeId].xxx → savePlayers() 整体落盘
```

### 切换玩家（`switchPlayer`）

```
1. applyPlayerToState(newId)     把新玩家数据灌进 state
2. savePlayers()                 activeId 更新并落盘
3. renderPlayerSwitcher()        刷新头像高亮
4. renderThemeSwitcher()         刷新主题按钮
5. renderHistory() / renderSnakeCards() / syncHud()  全量刷新 UI
```

---

## 🔁 老存档迁移（`migrateLegacyPlayers`）

**触发条件**：`snake-players` 不存在，但旧的 3 个 key 中有任意一个存在。

**迁移逻辑**：
```
旧 snake-best-score    ─┐
旧 snake-round-history ─┤→ 合并成 → players.p1（name="玩家1", avatar="🦊"）
旧 snake-progress      ─┘
```

迁移后：
- 新 `snake-players` 写入
- 旧 3 个 key **保留不删**（兜底）
- `activeId = "p1"`

**为什么这样设计**：保证老用户升级到新版后，原有进度（最高分、历史、经验）一个不丢。

---

## 🛠️ 核心 API

| 函数 | 作用 |
|---|---|
| `loadPlayers()` | 读 `snake-players`，返回解析对象或 null |
| `migrateLegacyPlayers()` | 把旧版单份存档迁移成新版多玩家结构 |
| `newDefaultPlayer(id, name, avatar)` | 创建一个干净的默认玩家对象 |
| `savePlayers()` | 把 `state.players` 整体写入 `snake-players` |
| `applyPlayerToState(playerId)` | 把指定玩家数据灌进 `state` 运行时字段 |
| `loadStorage()` | 总入口：读或迁移，并灌进 state |
| `saveBest()` / `saveHistory()` / `saveProgress()` | 单字段保存：改 state → 写回玩家 → 落盘 |
| `saveCoins()` / `addCandyPoints()` | 保存糖豆，结算时把本局分数转成糖豆 |
| `saveLastSnake()` | 保存当前选蛇到玩家档案 |
| `nextPlayerId()` | 生成下一个不冲突的玩家 id（p1, p2, ...） |
| `createPlayer(name, avatar)` | 新建玩家（达上限返回 null） |
| `switchPlayer(id)` | 切换激活玩家并刷新 UI |
| `deletePlayer(id)` | 删除玩家（删当前会自动切到剩余第一个；全删光会重建默认） |
| `renamePlayer(id, name, avatar)` | 改名/换头像 |

---

## ⚠️ 数据保存的边界

`localStorage` 的真实行为（重要！务必告知用户）：

| 场景 | 数据会丢吗 |
|---|---|
| **关电脑 / 重启** | ❌ 不会丢（已存硬盘） |
| 关浏览器、关页面再打开 | ❌ 不会丢 |
| **清理浏览器数据/缓存** | ⚠️ 会丢 |
| **换浏览器**（Chrome → Safari） | ⚠️ 会丢（每个浏览器各存一份） |
| **换电脑** | ⚠️ 会丢 |
| **卸载浏览器** | ⚠️ 会丢 |
| 文件移动到别的文件夹 | ⚠️ 视浏览器而定，可能丢 |

**当前未实现导出/导入**：用户在方案选择时接受了"不做导出文件"。如果未来需要，数据结构已经是一棵完整 JSON 树，加导出/导入很容易——读 `localStorage["snake-players"]` 即可下载成 `.json` 文件。

---

## 🧪 数据安全设计

- **删除二次确认**：`window.confirm` 弹窗，避免误删
- **删当前玩家自动切换**：不会卡在无效状态
- **全删光自动重建**：至少保留一个默认玩家，不会崩
- **存档损坏兜底**：`loadPlayers` 解析失败会走迁移/新建分支
- **旧 key 保留**：迁移后不删旧 key，万一新逻辑有 bug 可手动恢复

---

## 🔍 手动查看/调试存档

在浏览器开发者工具 Console 里：

```javascript
// 查看全部存档
JSON.parse(localStorage.getItem("snake-players"))

// 查看某个玩家
JSON.parse(localStorage.getItem("snake-players")).players.p1

// 清空所有存档（慎用）
localStorage.clear()

// 只删新版存档（保留旧版兜底）
localStorage.removeItem("snake-players")
```
