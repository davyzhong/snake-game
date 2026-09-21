/**
 * snake-game 截图自动化脚本
 *
 * 用 Playwright 启动 Chromium，加载 outputs/snake-game.html，
 * 自动模拟用户操作，截取 v0.5.0 各场景真实截图，覆盖 README 截图矩阵。
 *
 * 使用方法：
 *   1. npm install
 *   2. npx playwright install chromium
 *   3. node scripts/screenshot.js
 *
 * 或通过 GitHub Action 自动跑：
 *   .github/workflows/screenshot.yml
 *
 * 输出：覆盖 outputs/*.png 截图（保留用户手动提供的 hero 图）
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'outputs');
const HTML_URL = `file://${path.join(OUTPUT_DIR, 'snake-game.html')}`;

// 截图配置：每张图 = { name, viewport, actions: async (page) => { ... } }
const SCREENSHOT_CONFIG = [
  {
    name: 'snake-game-snake-select-latest.png',
    viewport: { width: 1280, height: 800 },
    description: 'v0.5.0 选蛇界面（hero）：左右各 6 条蛇卡片 + 中央对话框 + HUD',
    actions: async (page) => {
      // 默认状态就是选蛇界面，等渲染
      await page.waitForTimeout(800);
    },
  },
  {
    name: 'snake-game-mobile-select.png',
    viewport: { width: 390, height: 844 }, // iPhone 14 视口
    description: 'v0.5.0 选蛇界面（移动端响应式）',
    actions: async (page) => {
      await page.waitForTimeout(800);
    },
  },
  {
    name: 'snake-game-playing.png',
    viewport: { width: 1280, height: 800 },
    description: 'v0.5.0 游戏中（开局几秒后真实对局）',
    actions: async (page) => {
      // 点击"开始游戏"按钮（位置在中央卡片）
      // 实际游戏可能用 canvas / 按钮触发，先尝试 click 文字
      const startBtn = page.locator('button:has-text("开始游戏"), button:has-text("开始"), .start-btn, [data-action="start"]');
      if (await startBtn.count() > 0) {
        await startBtn.first().click({ timeout: 3000 });
      }
      // 等几秒让蛇动起来
      await page.waitForTimeout(2500);
    },
  },
  {
    name: 'snake-game-paused.png',
    viewport: { width: 1280, height: 800 },
    description: 'v0.5.0 暂停界面（按空格触发）',
    actions: async (page) => {
      const startBtn = page.locator('button:has-text("开始游戏"), button:has-text("开始")');
      if (await startBtn.count() > 0) {
        await startBtn.first().click({ timeout: 3000 }).catch(() => {});
      }
      await page.waitForTimeout(1500);
      // 按空格暂停
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
    },
  },
  {
    name: 'snake-game-task-detail.png',
    viewport: { width: 1280, height: 800 },
    description: 'v0.5.0 任务详情界面（点击任务面板触发）',
    actions: async (page) => {
      // 点击"任务"按钮（HUD 顶部右侧）
      const taskBtn = page.locator('button:has-text("任务"), [data-action="task"]');
      if (await taskBtn.count() > 0) {
        await taskBtn.first().click({ timeout: 3000 }).catch(() => {});
      }
      await page.waitForTimeout(800);
    },
  },
  {
    name: 'snake-game-records.png',
    viewport: { width: 1280, height: 800 },
    description: 'v0.5.0 记录界面（点击记录面板触发）',
    actions: async (page) => {
      const recordBtn = page.locator('button:has-text("记录"), [data-action="record"]');
      if (await recordBtn.count() > 0) {
        await recordBtn.first().click({ timeout: 3000 }).catch(() => {});
      }
      await page.waitForTimeout(800);
    },
  },
];

async function main() {
  console.log(`📸 snake-game 截图自动化（Playwright）`);
  console.log(`📂 项目根：${PROJECT_ROOT}`);
  console.log(`🎮 加载：${HTML_URL}\n`);

  if (!fs.existsSync(HTML_URL.replace('file://', ''))) {
    console.error(`❌ 找不到 HTML 文件：${HTML_URL}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  let success = 0;
  let failed = 0;

  for (const config of SCREENSHOT_CONFIG) {
    const page = await context.newPage();
    try {
      console.log(`▶ ${config.name}  (${config.viewport.width}x${config.viewport.height})`);
      console.log(`  ${config.description}`);

      await page.setViewportSize(config.viewport);
      await page.goto(HTML_URL, { waitUntil: 'networkidle' });
      await config.actions(page);

      const outputPath = path.join(OUTPUT_DIR, config.name);
      await page.screenshot({ path: outputPath, fullPage: false });
      const size = fs.statSync(outputPath).size;
      console.log(`  ✓ 写入 ${outputPath} (${(size / 1024).toFixed(1)} KB)\n`);
      success++;
    } catch (err) {
      console.error(`  ✗ 失败：${err.message}\n`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log(`\n📊 总结：成功 ${success} / 失败 ${failed} / 总共 ${SCREENSHOT_CONFIG.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});