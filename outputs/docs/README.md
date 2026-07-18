# 🐍 贪吃蛇吃苹果 · 项目文档

> 一款单文件 HTML5 网页游戏，纯原生 HTML + CSS + JavaScript + Canvas 实现，**无需后端、无需构建工具、双击即玩**。

本目录是项目的规范文档库。所有文档随代码迭代保持同步更新。

---

## 📖 文档索引

| 文档 | 内容 | 给谁看 |
|---|---|---|
| **[CHANGELOG.md](./CHANGELOG.md)** | 所有版本改动记录（每个阶段做了什么） | 想了解演进历史的人 |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 代码分层、游戏循环、状态机、目录结构 | 想读懂/改代码的开发者 |
| **[GAMEPLAY.md](./GAMEPLAY.md)** | 玩法机制：蛇种、苹果、经验、控制 | 玩家 / 想了解规则的人 |
| **[STORAGE.md](./STORAGE.md)** | 多玩家存档结构、localStorage 设计、迁移逻辑 | 关心数据保存的开发者 |
| **[VISUAL.md](./VISUAL.md)** | 3D 果冻风渲染、主题系统、特效系统 | 关心视觉/想改皮肤的开发者 |
| **[ROADMAP.md](./ROADMAP.md)** | 剩余开发阶段（障碍技能/连击关卡/任务成就/商店） | 想知道未来还会做什么的人 |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | 开发指南：运行、调试、截图、回退、命名规范 | 接手开发的人 |

---

## 🚀 快速开始

```bash
# 直接双击打开（macOS）
open snake-game.html

# 或在终端
open /path/to/snake-game.html
```

无需安装任何依赖。用现代浏览器（Chrome / Safari / Edge）打开即可。

---

## 🎮 一句话介绍

经典贪吃蛇的趣味加强版：**6 种小蛇角色 + 4 种特殊苹果 + 经验升级养成 + 多玩家档案 + 果冻竞技场画面 + 局内功能栏 + 多主题切换**，面向儿童和休闲用户。

---

## 📂 项目结构

```
outputs/
├── snake-game.html              # 主程序（唯一源码文件，当前 ~2146 行）
├── snake-game-v1-backup.html    # 重构前的原始版本备份（v1，1279 行）
├── snake-style-sample.html      # 阶段1 视觉样品页（独立预览，非游戏）
├── snake-game-*.png             # 开发过程中的版本截图（25 张）
└── docs/                        # 本文档库
    ├── README.md                # 本文件（总入口）
    ├── CHANGELOG.md             # 改动历史
    ├── ARCHITECTURE.md          # 架构设计
    ├── GAMEPLAY.md              # 玩法说明
    ├── STORAGE.md               # 存档系统
    ├── VISUAL.md                # 视觉系统
    ├── ROADMAP.md               # 开发路线图
    └── DEVELOPMENT.md           # 开发指南
```

---

## 🏷️ 当前版本

**v0.4.0 · 果冻小蛇竞技场升级**（2026-07-04）

- ✅ 阶段 0 · 地基重构
- ✅ 多玩家档案系统
- ✅ 阶段 1 · 视觉重做（3D 果冻风 + 多主题）
- ✅ 竞技场视觉增强 + 局内功能栏（糖豆、磁铁、护盾、金苹果雨、慢动作）
- ⏳ 阶段 2 · 障碍物 + 主动技能（待开发）

详见 [CHANGELOG.md](./CHANGELOG.md) 和 [ROADMAP.md](./ROADMAP.md)。

---

## 📝 文档维护约定

- 每完成一个开发阶段，**必须同步更新**对应的文档
- `CHANGELOG.md` 每次有用户可见的改动都要追加一条
- 数据结构、配置项、API 变化时更新 `ARCHITECTURE.md` / `STORAGE.md` / `VISUAL.md`
- 文档里所有数字（蛇种属性、苹果分数等）以 `snake-game.html` 里 `CONFIG` 对象的实际值为准
