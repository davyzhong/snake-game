# 存档系统

游戏使用浏览器 `localStorage` 保存数据。主键是 `snake-players`；旧版 `snake-best-score`、`snake-round-history`、`snake-progress` 只用于迁移，迁移后仍保留作兜底。

## 主存档

```js
{
  version: 1,
  activeId: "p1",
  players: {
    p1: {
      id: "p1",
      name: "玩家1",
      avatar: "🦊",
      best: 250,
      coins: 120,
      roundHistory: [],
      progress: { sprout: 250 },
      tasks: { completed: {}, progress: {} },
      daily: { date: "", progress: {}, completed: {} },
      collection: {},
      pendingShopItems: {},
      pendingChest: { id: 7, candy: 42, score: 100, claimed: false },
      lastSnakeId: "sprout",
      themeId: "orchard",
      createdAt: 1720080000000
    }
  }
}
```

## 重要字段

| 字段 | 说明 |
|---|---|
| `best` / `coins` | 最高分和糖豆余额 |
| `roundHistory` | 最近 8 局记录 |
| `progress` | 以蛇 id 为键的经验值 |
| `tasks` / `daily` / `collection` | 常规任务、每日任务和收藏册进度 |
| `pendingShopItems` | 下一局生效的已购买准备道具 |
| `pendingChest` | 上局尚未领取的结算宝箱；奖励金额创建时锁定，不会重复叠加天赋 |
| `lastSnakeId` / `themeId` | 当前玩家上次选择的小蛇与主题 |

## 读写约定

`applyPlayerToState(id)` 会把指定玩家字段灌入运行时 `state`。`saveBest()`、`saveCoins()`、`saveProgress()`、`saveTasks()`、`saveAdventure()`、`savePendingShopItems()`、`savePendingChest()` 与 `saveLastSnake()` 会先写回当前玩家，再调用 `savePlayers()` 整体落盘。

游戏进行中或暂停中，不能切换、创建、编辑或删除玩家，也不能更换小蛇。这避免一局内把奖励记到错误档案或让天赋中途改变。

## 安全边界

- 关闭页面、浏览器或电脑不会清除存档。
- 清除浏览器站点数据、换浏览器或换电脑会失去这份本地存档。
- `loadStorage()` 会补齐旧档缺少的 `coins`、任务、收藏、待购买道具和待领取宝箱字段。
- 损坏的主存档会回退到旧存档迁移或新的默认玩家。
