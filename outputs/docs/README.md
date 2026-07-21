# 贪吃蛇吃苹果

单文件 HTML5 桌面游戏。直接打开 `../snake-game.html` 就可以游玩，不需要安装依赖或启动服务。

## 当前版本

**v0.5.0**：12 条带天赋的小蛇、20 级成长、局内道具与任务、随机奖励、玩家档案、宝箱持久化，以及果园竞技场视觉系统。

- 26×26 大格棋盘，12 个食物同时出现。
- 12 条小蛇各有速度、倍率和被动天赋。
- 空格暂停；切出页面会自动暂停，限时道具不会被后台时间消耗。
- 每位玩家独立保存等级、糖豆、历史、任务、收藏、选蛇、主题和待领取宝箱。

## 文档

| 文档 | 内容 |
|---|---|
| [GAMEPLAY.md](./GAMEPLAY.md) | 操作、蛇、食物、成长、道具和任务 |
| [STORAGE.md](./STORAGE.md) | 玩家存档和数据边界 |
| [VISUAL.md](./VISUAL.md) | 棋盘对齐、素材、渲染和视觉规范 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 状态、规则、渲染和性能结构 |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 运行、检查和维护方式 |
| [ROADMAP.md](./ROADMAP.md) | 已实现内容和后续方向 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本记录 |

## 目录

```text
outputs/
  snake-game.html       主程序
  assets/               PNG 素材
  docs/                 项目文档
work/tests/             Node 自动检查
```
