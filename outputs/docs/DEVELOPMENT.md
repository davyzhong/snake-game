# 开发指南

## 运行

```bash
open outputs/snake-game.html
```

这是纯静态文件，不需要安装依赖或启动开发服务器。使用 Chrome、Safari、Edge 或 Firefox 的现代版本即可。

## 自动检查

从项目根目录运行：

```bash
sed -n '/<script>/,/<\/script>/p' outputs/snake-game.html | sed '1d;$d' | node --check
node work/tests/check-snake-options.mjs
node work/tests/game-rules.mjs
node work/tools/audit-runtime-assets.mjs
```

前两个测试分别检查静态结构和真实游戏脚本的关键规则。规则测试覆盖玩家/选蛇局内锁定、待领取宝箱、糖果蛇奖励、局内计时、自动暂停和海浪蛇穿墙。

## 手工验收

1. 选择小蛇后开局，确认方向键、空格暂停和继续正常。
2. 切走浏览器标签再回来，确认游戏自动暂停、磁铁和慢动作没有倒计时跳过。
3. 吃食物、道具、礼盒和首领，确认提示文字清楚且图标描述一致。
4. 结束一局、关闭页面、重新打开，确认糖豆、经验和待领取宝箱仍在。
5. 检查每条侧栏小蛇完整、不变形，且棋盘中的互动对象严格落在对应网格。

## 维护原则

- 配置数值只在 `CONFIG` 修改，并同步更新 `GAMEPLAY.md`。
- 新玩家存档字段必须同时处理默认值、旧档迁移、读取和保存。
- 新图像先放入 `outputs/assets/`，再用素材审计脚本确认引用和体积。
- 提交前运行全部自动检查和 `git diff --check`。
