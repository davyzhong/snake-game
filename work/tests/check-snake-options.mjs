import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../../outputs/snake-game.html", import.meta.url), "utf8");
const outputRoot = new URL("../../outputs/", import.meta.url);

assert.match(html, /const CONFIG = \{/, "game should keep configuration in CONFIG");
assert.match(html, /snakePortraitsCrisp: "assets\/snake-portraits-royal-v3-crisp\.png"/, "canvas should register the same portrait atlas used by the snake cards");
assert.ok(existsSync(new URL("assets/snake-portraits-royal-v3-crisp.png", outputRoot)), "the card portrait atlas should be available to the canvas");
assert.match(html, /snakeSidePortraitsV7Contained: "assets\/snake-side-portraits-v7-contained\.png"/, "side rails should register a proportion-preserving portrait atlas");
assert.ok(existsSync(new URL("assets/snake-side-portraits-v7-contained.png", outputRoot)), "proportion-preserving side portrait atlas should be available");
assert.match(html, /orchardBoardDecorV1: "assets\/orchard-board-decor-v1-alpha\.png"/, "game should register the original orchard board decoration atlas");
assert.ok(existsSync(new URL("assets/orchard-board-decor-v1-alpha.png", outputRoot)), "original orchard board decoration atlas should be available");
assert.match(html, /boardSnakeNecksV1: "assets\/board-snake-necks-v1-alpha\.png"/, "canvas should register headless character neck art");
assert.ok(existsSync(new URL("assets/board-snake-necks-v1-alpha.png", outputRoot)), "headless character neck atlas should be available to the canvas");
assert.match(html, /function cellRect\(cell\)/, "board visuals should share a cell rectangle helper");
assert.match(html, /function drawAlignedOrchardGrid\(\)/, "orchard should draw its logical grid from game cells");
assert.doesNotMatch(html, /drawAlignedOrchardGrid\(\);\s*drawOrchardDecorations\(\);/, "board should not place decorative art over interactive cells");
assert.equal((html.match(/class="board-corner/g) || []).length, 4, "board frame should use four anchored corner gems instead of floating board blockers");
assert.match(html, /function drawCardPortraitHead\(/, "canvas should render the selected card portrait as its head");
assert.match(html, /function drawCharacterNeck\(/, "canvas should attach a headless character neck behind the portrait");
assert.match(html, /function drawCharacterSnakeSegments\(/, "body should use cell-snapped segments");
assert.doesNotMatch(html, /drawCharacterSnakeFrontBody\(hcx, hcy/, "snake head should not stack an entire mascot thumbnail behind the portrait");
assert.match(html, /snakeMascotsDemoV4: "assets\/snake-mascots-demo-v4-alpha\.png"/, "game should register the independent full-body mascot atlas");
assert.ok(existsSync(new URL("assets/snake-mascots-demo-v4-alpha.png", outputRoot)), "the full-body mascot atlas should be available to the game");
assert.match(html, /snakeMascotsMenuV5: "assets\/snake-mascots-menu-v5-alpha\.png"/, "menu should register the transparent premium mascot atlas");
assert.ok(existsSync(new URL("assets/snake-mascots-menu-v5-alpha.png", outputRoot)), "the transparent premium mascot atlas should be available to the menu");
assert.match(html, /hudIconsDemoV5Contained: "assets\/hud-icons-demo-v5-contained\.png"/, "game should register the proportion-preserving HUD icon strip");
assert.match(html, /class="stat-art stat-art-trophy"/, "score HUD should include a trophy image slot");
assert.match(html, /class="stat-art stat-art-crown"/, "best score HUD should include a crown image slot");
assert.match(html, /class="stat-art stat-art-candy"/, "candy HUD should include a candy image slot");
assert.match(html, /class="stat-art stat-art-snake"/, "selected snake HUD should include a snake image slot");
assert.match(html, /currentSnakeArt: document\.querySelector\("\.stat-art-snake"\)/, "HUD should cache the selected snake portrait slot");
assert.match(html, /els\.currentSnakeArt\.style\.backgroundImage/, "HUD should update the portrait to the selected snake");
assert.match(html, /class="stat-art stat-art-star"/, "level HUD should include a star image slot");
assert.match(html, /\.snake-detail-art\s*\{[\s\S]*snake-mascots-menu-v5-alpha\.png/, "menu detail should render the transparent premium mascot atlas");
assert.match(html, /--ref-width:\s*1680px;/, "desktop UI should use the demo reference width token");
assert.match(html, /--ref-height:\s*945px;/, "desktop UI should use the demo reference height token");
assert.match(html, /--hud-height:\s*92px;/, "desktop UI should reserve the demo HUD height");
assert.match(html, /--side-rail-width:\s*264px;/, "desktop UI should reserve the demo side rail width");
assert.match(html, /--bottom-rail-height:\s*150px;/, "desktop UI should reserve the demo bottom rail height");
assert.match(html, /cells: 26,/, "game should use a larger-cell 26 by 26 desktop arena");
assert.match(html, /appleCount: 12,/, "arena should keep many foods visible");
assert.match(html, /snakeTypes: \[/, "game should define selectable snake types");
assert.match(html, /appleTypes: \[/, "game should define multiple food/apple types");
assert.match(html, /themes: \[/, "game should define selectable themes");
assert.match(html, /assetPaths: \{[\s\S]*arenaBackground: "assets\/orchard-royal-bg-v3\.png"[\s\S]*rewardChests: "assets\/reward-chests-transparent\.png"[\s\S]*powerupIcons: "assets\/powerup-icons-transparent\.png"[\s\S]*rewardUi: "assets\/reward-ui-kit-transparent\.png"/, "game should register the premium orchard and treasure art assets");
assert.match(html, /treatSprites: \{[\s\S]*normal: \{ col: 0, row: 3 \}[\s\S]*gold: \{ col: 2, row: 0 \}[\s\S]*slow: \{ col: 3, row: 0 \}[\s\S]*shrink: \{ col: 2, row: 1 \}/, "food should map to generated image sprites");
for (const asset of [
  "assets/orchard-royal-bg-v3.png",
  "assets/reward-chests-transparent.png",
  "assets/powerup-icons-transparent.png",
  "assets/reward-ui-kit-transparent.png"
]) {
  assert.ok(existsSync(new URL(asset, outputRoot)), `${asset} should be copied into outputs`);
}
assert.match(html, /requestAnimationFrame\(loop\)/, "game should use animation-frame loop");
assert.match(html, /phase: "menu"/, "game should use explicit phase state");

const allSnakeIds = ["sprout", "apple", "spark", "berry", "coin", "rainbow", "flower", "cloud", "gem", "candy", "ocean", "fire"];
for (const snake of allSnakeIds) {
  assert.match(html, new RegExp(`data-snake="${snake}"`), `${snake} snake option should exist`);
}
assert.equal((html.match(/data-snake="/g) || []).length, 12, "game should offer 12 selectable snakes");
const leftSnakeColumn = html.match(/<div class="snake-column snake-column-left"[\s\S]*?<\/div>\s*\n\s*<div class="board-stack">/)?.[0] || "";
const rightSnakeColumn = html.match(/<div class="snake-column snake-column-right"[\s\S]*?<\/div>\s*\n\s*<\/section>/)?.[0] || "";
for (const snake of ["sprout", "apple", "spark", "berry", "coin", "rainbow"]) {
  assert.match(leftSnakeColumn, new RegExp(`data-snake="${snake}"`), `${snake} should move to the left column`);
}
for (const snake of ["flower", "cloud", "gem", "candy", "ocean", "fire"]) {
  assert.match(rightSnakeColumn, new RegExp(`data-snake="${snake}"`), `${snake} should be one of the six new right-column snakes`);
}
assert.match(html, /\.snake-column\s*\{[\s\S]*grid-template-rows: repeat\(6, auto\);/, "desktop snake columns should fit six snake choices per side");
assert.match(html, /\.snake-avatar\s*\{[\s\S]*width: 60px;[\s\S]*height: 60px;/, "desktop snake portraits should stay large while fitting all six cards in a column");
assert.match(html, /\.snake-option\s*\{[\s\S]*padding: 3px 5px;/, "larger portraits should preserve room for the final card label");

for (const apple of ["normal", "gold", "slow", "shrink"]) {
  assert.match(html, new RegExp(`id: "${apple}"`), `${apple} food type should exist`);
}

assert.match(html, /snake-players/, "multi-player save key should exist");
assert.match(html, /function loadStorage/, "game should load player storage");
assert.match(html, /function migrateLegacyPlayers/, "game should migrate old storage");
assert.match(html, /function savePlayers/, "game should save all player data");
assert.match(html, /function switchPlayer/, "game should support player switching");
assert.match(html, /function renderPlayerSwitcher/, "game should render player switcher");
assert.match(html, /tasks: \{\s*completed: \{\}/, "player profiles should persist task completion state");
assert.match(html, /id="playerEdit"/, "player bar should include an obvious edit button for the current player");
assert.match(html, /playerEdit: document\.querySelector\("#playerEdit"\)/, "player edit button should be cached");
assert.match(html, /els\.playerEdit\.addEventListener\("click", \(\) => openPlayerModal\(state\.activePlayerId\)\)/, "player edit button should open the current player editor");
assert.match(html, /if \(id === state\.activePlayerId\) \{\s*openPlayerModal\(id\);/, "clicking the current avatar should edit that player");
assert.match(html, /function renamePlayer\(id, name, avatar\)[\s\S]*state\.players\[id\]\.name = cleanName;[\s\S]*state\.players\[id\]\.avatar = avatar;/, "saving edit should persist both player name and avatar");

assert.match(html, /function togglePause/, "game should support toggling pause");
assert.match(html, /event\.code === "Space"/, "space key should toggle pause/start");
assert.match(html, /showMessage\("暂停中"/, "pause should show a pause message");

assert.match(html, /function currentTheme/, "theme lookup should exist");
assert.match(html, /function switchTheme/, "theme switching should exist");
assert.match(html, /\.theme-switcher[\s\S]*pointer-events: auto;/, "theme buttons should be clickable inside the helper strip");

assert.match(html, /shopItems: \[/, "game should define purchasable shop items");
assert.match(html, /shopItems: \[[\s\S]*id: "magnet", cost: 60[\s\S]*id: "shield", cost: 80[\s\S]*id: "feast", cost: 100[\s\S]*id: "slowTime", cost: 50/, "shop should reference the four canonical usable power-ups");
assert.match(html, /const type = BOARD_POWERUP_BY_ID\[item\.id\];[\s\S]*name\.textContent = type\.shopName \|\| type\.name;/, "shop skill names should come from the same data as board pickups");
assert.match(html, /id="featureToggle"[\s\S]*>任务<\/button>/, "top HUD should show a task button instead of a generic feature button");
assert.match(html, /id="featurePanel"/, "task button should open the task panel");
assert.match(html, /class="board-shop"[\s\S]*id="boardShopList"/, "purchasable features should sit in a board-bottom action bar");
assert.match(html, /\.board-shop-list\s*\{[\s\S]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/, "board-bottom shop should lay all starter features in one row");
assert.match(html, /function getShopAffordableCount\(item\)/, "shop should calculate how many times each feature can still be bought");
assert.match(html, /余额可买 \$\{getShopAffordableCount\(item\)\} 次/, "shop buttons should show the accurate affordable count");
assert.match(html, /className = "shop-art";[\s\S]*backgroundPosition = shopShowcaseSpritePosition\(item\.id\);/, "shop cards should use the large four-item showcase art instead of text-only icons");
assert.match(html, /\.shop-art\s*\{[\s\S]*background-image: url\("assets\/powerup-icons-v2\.png"\)/, "shop item art should come from the dedicated six-powerup sprite sheet");
assert.match(html, /\.quick-help\s*\{[\s\S]*display: none;/, "desktop helper strip should not overlap the board-bottom shop");
assert.match(html, /id="coinHud"/, "HUD should show saved candy points");
assert.match(html, /coins: 0,/, "runtime state should track current player's candy points");
assert.match(html, /players\[state\.activePlayerId\]\.coins/, "player save should persist candy points");
assert.match(html, /function buyShopItem/, "shop should support buying items");
assert.match(html, /function applyShopItem/, "shop purchase should apply item effects");
assert.match(html, /pendingShopItems: \{\}/, "legacy queued shop items should remain loadable");
assert.match(html, /function queueShopItemForNextGame\(itemId\)/, "legacy pre-game purchases should still have a migration path");
assert.match(html, /function applyPendingShopItems\(\)/, "new rounds should still activate any already-saved queued purchases");
assert.match(html, /if \(!\["playing", "paused"\]\.includes\(state\.phase\)\) return false;/, "shop purchases before a round should be blocked instead of starting or queueing timers");
assert.match(html, /const canUseNow = \["playing", "paused"\]\.includes\(state\.phase\);/, "shop UI should only enable feature purchases while a round is active or paused");
assert.match(html, /if \(state\.phase === "playing"\) \{\s*\/\/ 减速效果到期检查/, "timed shop effects should not expire while the game is paused");
assert.match(html, /applyPendingShopItems\(\);[\s\S]*renderPowerStatus\(\);/, "queued items should activate at game start and update status");
assert.match(html, /function addCandyPoints/, "round score should become spendable candy points");
assert.match(html, /addCandyPoints\(state\.score\)/, "game over should add score to candy points");
assert.match(html, /pendingChest: null/, "runtime state should track a pending game-over chest reward");
assert.match(html, /chestRewards: \{[\s\S]*baseCandy: 20[\s\S]*scoreDivisor: 10/, "game-over chest should have a candy reward formula");
assert.match(html, /function createRoundChestReward\(score\)/, "game over should create a claimable chest reward");
assert.match(html, /function claimRoundChest\(\)/, "player should be able to claim the game-over chest");
assert.match(html, /state\.pendingChest = createRoundChestReward\(state\.score\);[\s\S]*showMessage\("游戏结束"[\s\S]*"领取宝箱"\);/, "game over should show a claim chest action instead of only replay");
assert.match(html, /if \(state\.phase === "gameover" && state\.pendingChest\) \{[\s\S]*claimRoundChest\(\);[\s\S]*return;/, "start button should claim the chest before starting another game");
assert.match(html, /宝箱奖励已准备好/, "reward preview should explain that the chest is available after each round");
assert.doesNotMatch(html, /下一阶段加入/, "chest copy should not say the reward is delayed to a future stage");
assert.match(html, /boardPowerupTypes: \[[\s\S]*id: "candy"[\s\S]*id: "magnet"[\s\S]*id: "jelly"[\s\S]*id: "shield"[\s\S]*id: "feast"[\s\S]*id: "slowTime"/, "board should define candy, magnet, jelly, shield, feast, and slow-time pickups");
assert.match(html, /id: "candy", name: "糖果"[\s\S]*action: "candy"[\s\S]*amount: 20[\s\S]*artCol: 1, artRow: 1/, "candy pickup should use the candy icon and award candy points");
assert.match(html, /id: "magnet", name: "糖果磁铁"[\s\S]*action: "magnet"[\s\S]*bonusScore: 5[\s\S]*artCol: 0, artRow: 0/, "magnet pickup should use the magnet icon and trigger magnet");
assert.match(html, /id: "jelly", name: "果冻"[\s\S]*action: "jelly"[\s\S]*bonusScore: 10[\s\S]*artCol: 0, artRow: 1/, "jelly pickup should use the jelly icon and shorten the snake");
assert.match(html, /id: "shield", name: "护盾"[\s\S]*action: "shield"[\s\S]*bonusScore: 5[\s\S]*artCol: 1, artRow: 0/, "shield pickup should use the shield icon and add a shield charge");
assert.match(html, /id: "feast", name: "金苹果雨"[\s\S]*action: "feast"[\s\S]*bonusScore: 10[\s\S]*artCol: 2, artRow: 0/, "gold apple rain pickup should use the gold apple icon and spawn gold apples");
assert.match(html, /id: "slowTime", name: "慢动作"[\s\S]*action: "slowTime"[\s\S]*bonusScore: 5[\s\S]*artCol: 2, artRow: 1/, "slow-time pickup should use the stopwatch icon and slow the snake");
assert.match(html, /id: "magnet", name: "糖果磁铁"[\s\S]*shopName: "磁铁"/, "shop should use a concise label for the magnet without changing its full skill name");
assert.match(html, /id: "feast", name: "金苹果雨"[\s\S]*shopName: "苹果雨"/, "shop should use a concise label for gold apple rain without changing its full skill name");
assert.match(html, /boardPowerups: \[\]/, "runtime state should track board power-up pickups");
assert.match(html, /function placeBoardPowerups\(\)/, "game should spawn board power-ups");
assert.match(html, /function applyBoardPowerup\(powerup\)/, "eaten board power-ups should apply effects");
assert.match(html, /function awardSkillPoints\(type\)/, "eaten board skills should award their configured skill points");
assert.match(html, /function shopShowcaseSpritePosition\(itemId\)/, "shop icons should use their dedicated showcase sprite coordinates");
assert.match(html, /name\.textContent = type\.shopName \|\| type\.name;/, "shop cards should render concise labels from their canonical power-up data");
assert.match(html, /const powerupIndex = state\.boardPowerups\.findIndex\(item => item\.x === newHead\.x && item\.y === newHead\.y\);/, "snake movement should detect board power-up pickups");
assert.match(html, /state\.boardPowerups\.forEach\(drawBoardPowerupHint\);[\s\S]*state\.boardPowerups\.forEach\(drawBoardPowerup\);[\s\S]*drawSnakeBody\(\);/, "board power-ups should render on the grid before the snake");
assert.match(html, /powerupIconsV2: "assets\/powerup-icons-v2\.png"/, "the game should load the dedicated six-powerup art sheet");
assert.match(html, /function powerupSpritePosition\(type\)/, "shop icon placement should use the canonical board power-up data");
assert.match(html, /icon\.style\.backgroundPosition = shopShowcaseSpritePosition\(item\.id\);/, "shop should map its large visual icons by the same shop item id that triggers the feature");
assert.match(html, /function drawPowerupLabel\(powerup\)/, "every board power-up should show a readable name ribbon");
for (const [id, name, action, col, row] of [
  ["candy", "糖果", "candy", 1, 1],
  ["magnet", "糖果磁铁", "magnet", 0, 0],
  ["jelly", "果冻", "jelly", 0, 1],
  ["shield", "护盾", "shield", 1, 0],
  ["feast", "金苹果雨", "feast", 2, 0],
  ["slowTime", "慢动作", "slowTime", 2, 1]
]) {
  assert.match(html, new RegExp(`id: "${id}", name: "${name}"[\\s\\S]*action: "${action}"[\\s\\S]*artCol: ${col}, artRow: ${row}`), `${name} should have one explicit visual and behavior identity`);
}

for (const item of ["magnet", "shield", "feast", "slowTime"]) {
  assert.match(html, new RegExp(`id: "${item}"`), `${item} shop item should exist`);
}

assert.match(html, /magnetUntil/, "magnet power-up state should exist");
assert.match(html, /shopDurations: \{[\s\S]*magnet: 20000,/, "magnet should last long enough to matter");
assert.match(html, /state\.powerups\.magnetUntil = Math\.max\(state\.powerups\.magnetUntil, now\) \+ CONFIG\.shopDurations\.magnet;/, "magnet duration should come from config");
assert.match(html, /function collectAppleAt\(appleIndex, now, options = \{\}\)/, "apple collection should be shared by snake movement and magnet pickup");
assert.match(html, /if \(distance <= 1\) \{\s*collectAppleAt\(index, now, \{ magnet: true \}\);[\s\S]*return;/, "magnet should directly collect apples pulled next to the snake");
assert.match(html, /const appleIndex = state\.apples\.findIndex\(a => a\.x === newHead\.x && a\.y === newHead\.y\);[\s\S]*collectAppleAt\(appleIndex, now\);/, "normal snake movement should use the shared apple collection path");
assert.match(html, /shieldCharges/, "shield power-up state should exist");
assert.match(html, /function applyMagnetPull/, "magnet should affect nearby food");
assert.match(html, /function useShieldSave/, "shield should save the snake from a collision");
assert.match(html, /function addAppleOfType/, "feast item should be able to spawn bonus food");
assert.match(html, /function renderPowerStatus/, "HUD should show active power-up status");

assert.match(html, /levelRewards: \[/, "game should define explicit level rewards");
assert.match(html, /levelThresholds: \[0, 100, 250, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400, 6500, 7700, 9000, 10400, 11900, 13500, 15200, 17000, 18900\]/, "snakes should be able to level up to level 20");
for (const reward of ["身体更亮", "开局糖豆", "奖励特效", "专属皮肤"]) {
  assert.match(html, new RegExp(reward), `level reward should include ${reward}`);
}
assert.match(html, /function getLevelReward\(level\)/, "level reward lookup should exist");
assert.match(html, /function getSnakePerks\(snakeId\)/, "snake perk calculation should exist");
assert.match(html, /function applyLevelStartBonus\(\)/, "level 3 start candy bonus should exist");
assert.match(html, /applyLevelStartBonus\(\);[\s\S]*placeApples\(\);/, "new games should apply level start bonus before play begins");
assert.match(html, /function drawLevelAura\(cx, cy, radius, perks, type\)/, "level 2 visual aura should exist");
assert.match(html, /if \(perks\.bonusEffect\)/, "level 4 should improve eat effects");
assert.match(html, /if \(perks\.skinUnlocked\)/, "level 5 should unlock a visible skin treatment");

assert.match(html, /tasks: \[[\s\S]*id: "eat5"[\s\S]*id: "score100"[\s\S]*id: "survive30"/, "game should define the three starter tasks");
assert.match(html, /id="taskList"/, "feature panel should include a task list");
assert.match(html, /function resetRoundStats\(\)/, "round task stats should reset on new game");
assert.match(html, /function updateTaskProgress\(\)/, "task progress updater should exist");
assert.match(html, /function completeTask\(taskId\)/, "task completion should award rewards");
assert.match(html, /function renderTasks\(\)/, "task UI renderer should exist");
assert.match(html, /state\.roundStats\.applesEaten \+= 1;/, "eating apples should count toward tasks");
assert.match(html, /updateTaskProgress\(\);[\s\S]*syncHud\(\);/, "loop should refresh task progress during play");
assert.match(html, /renderTasks\(\);[\s\S]*renderShop\(\);/, "opening feature panel should refresh tasks with the shop");

assert.match(html, /id="snakeDetail"/, "start overlay should include a selected snake detail card");
assert.match(html, /class="reward-preview"[\s\S]*class="reward-chest-art"/, "start overlay should include generated reward preview art");
assert.match(html, /\.reward-preview\s*\{[\s\S]*background:[\s\S]*url\("assets\/reward-ui-kit-transparent\.png"\)/, "reward preview should use the generated reward UI kit");
assert.match(html, /\.reward-chest-art\s*\{[\s\S]*background-image: url\("assets\/reward-chests-transparent\.png"\)/, "reward preview should use the generated chest sheet");
assert.match(html, /function renderSnakeDetail\(\)/, "selected snake detail renderer should exist");
assert.match(html, /renderSnakeDetail\(\);[\s\S]*if \(state\.phase === "menu"/, "choosing a snake should refresh the detail card before menu text");
assert.match(html, /data-detail-role="reward"/, "detail card should show current level reward");
assert.match(html, /class="snake-detail-art sprout"/, "start overlay should show a large visual portrait for the selected snake");
assert.match(html, /detailArt\.className = `snake-detail-art \$\{type\.id\}`;/, "selected snake detail art should update when the player picks a different snake");
assert.match(html, /\.snake-detail-art\s*\{[\s\S]*width: 82px;[\s\S]*height: 82px;/, "start overlay snake art should be visually prominent");
assert.match(html, /\.stats\s*\{[\s\S]*gap: 6px;[\s\S]*padding: 4px 6px;/, "top status HUD should use larger, more deliberate tiles");
assert.match(html, /\.value\s*\{[\s\S]*font-size: 24px;/, "top status values should be large and easily readable");
assert.match(html, /\.shop-art\s*\{[\s\S]*width: 52px;[\s\S]*height: 52px;/, "power-up art should be large enough to lead the shop cards");
assert.match(html, /\.shop-name\s*\{[\s\S]*font-size: 14px;/, "power-up labels should be larger and clearer");
assert.match(html, /snakePortraitsV2: "assets\/snake-portraits-v2\.png"/, "the game should load the dedicated twelve-snake portrait sheet");
assert.match(html, /\.snake-avatar\s*\{[\s\S]*background-image: url\("assets\/snake-portraits-royal-v3-alpha\.png"\)[\s\S]*background-size: 400% 300%/, "snake cards should use the premium twelve-snake portrait sheet");
assert.ok(existsSync(new URL("assets/snake-portraits-royal-v3-alpha.png", outputRoot)), "the premium snake portrait sheet should be copied into outputs");
assert.match(html, /\.snake-avatar\.sprout\s*\{[\s\S]*background-position: 0% 0%/, "the first snake portrait should map to the first atlas cell");
assert.match(html, /\.snake-avatar\.fire\s*\{[\s\S]*background-position: 100% 100%/, "the fire snake portrait should map to the final atlas cell");
assert.match(html, /\.snake-avatar\s*\{[\s\S]*position: absolute;[\s\S]*left: 42px;[\s\S]*width: 162px;[\s\S]*height: 108px;[\s\S]*background-size: 400% 300%;/, "snake card portraits should lead the card with a large proportion-preserving portrait");
assert.doesNotMatch(html, /background-position-y: 0%;/, "wide snake card portraits should preserve their atlas row positions");
assert.match(html, /background-image: url\("assets\/snake-side-portraits-v7-contained\.png"\)/, "desktop snake cards should use full-width transparent portraits instead of nested tiles");

assert.match(html, /function drawSnakeBody/, "snake renderer should exist");
assert.match(html, /function drawCharacterSnakeSegments/, "new snake body should use aligned character segments");
assert.match(html, /function drawExpressiveHead/, "new snake head should be expressive");
assert.match(html, /function drawGlossyTreat/, "food renderer should be upgraded");
assert.match(html, /function drawGeneratedTreatSprite\(apple, appleType, cx, cy, radius\)/, "food drawing should use generated image sprites when ready");
assert.match(html, /if \(drawGeneratedTreatSprite\(apple, appleType, cx, cy, radius\)\) return;/, "generated food sprite should be the primary treat renderer");
assert.match(html, /function drawSparkleBurst/, "food should include sparkle details");
assert.match(html, /function getFloatTextTheme\(text\)/, "reward messages should use readable visual themes");
assert.match(html, /Every reward message gets its own opaque plaque/, "reward text should render on a high-contrast plaque");
assert.match(html, /ctx\.roundRect\(left, top, width, height, 18\)/, "reward plaque should have a stable rounded shape");
assert.match(html, /targetHint: \{[\s\S]*fill: "rgba\(255, 255, 255, 0\.48\)"[\s\S]*stroke: "rgba\(31, 124, 43, 0\.38\)"/, "food target hints should have a soft readable style");
assert.match(html, /state\.apples\.forEach\(drawTargetHint\);[\s\S]*state\.apples\.forEach\(drawApple\);/, "target hints should render under food before food sprites");
assert.match(html, /function drawTargetHint\(apple\)/, "food should include a grid-aligned target hint renderer");
assert.match(html, /const left = apple\.x \* CELL_SIZE;/, "target hint should lock to the exact apple grid cell");
assert.match(html, /const \{ cx, cy \} = cellCenter\(apple\);[\s\S]*ctx\.arc\(cx, cy, CELL_SIZE \* 0\.12, 0, Math\.PI \* 2\);/, "target hint should mark the exact grid center");
assert.match(html, /visualScale: \{[\s\S]*snakeRadius: 0\.42,[\s\S]*headScale: 1\.04,[\s\S]*treatRadius: 0\.44,[\s\S]*sparkleScale: 0\.85/, "food should be visually larger while staying cell centered");
assert.match(html, /--board-size: min\(calc\(100vh - 204px\), calc\(100vw - 236px\), 900px\);/, "desktop board should leave room for the richer board-bottom shop while staying prioritized");
assert.match(html, /id: "orchard", name: "果园"[\s\S]*boardLight: "#d9f4ad", boardDark: "#d3efa6"[\s\S]*grid: "rgba\(112, 158, 70, 0\.055\)"/, "orchard board should use low-contrast comfortable colors");
assert.match(html, /drawSoftArenaTexture\(\);/, "arena should draw a soft texture instead of a harsh checkerboard");
assert.match(html, /roundMissions: \[[\s\S]*id: "combo6"[\s\S]*id: "power2"/, "game should define varied per-round missions");
assert.match(html, /roundEvents: \[[\s\S]*id: "harvest"[\s\S]*id: "streakStorm"/, "game should define random orchard events");
assert.match(html, /mapRotation: \[[\s\S]*themeId: "orchard"[\s\S]*themeId: "moonlit"[\s\S]*themeId: "snow"/, "game should rotate through orchard maps");
assert.match(html, /dailyTasks: \[[\s\S]*metric: "goldens"[\s\S]*metric: "bosses"/, "game should define daily golden-apple and boss goals");
assert.match(html, /function spawnGoldenRunner\(\)/, "game should spawn a moving golden apple");
assert.match(html, /function openMysteryChest\(now\)/, "game should open a three-choice mystery chest");
assert.match(html, /function chooseMysteryChestReward\(id\)/, "game should apply a selected mystery chest reward");
assert.match(html, /点击领取/, "mystery chest cards should make their direct action explicit");
assert.match(html, /els\.startButton\.hidden = true;/, "mystery chest should remove the confusing extra start button");
assert.match(html, /余额可买 \$\{getShopAffordableCount\(item\)\} 次/, "shop cards should show the exact affordable purchase count");
assert.match(html, /shop-note/, "shop cards should show a concise effect description");
assert.match(html, /function spawnBoss\(\)/, "game should spawn a boss challenge target");
assert.match(html, /function hitBoss\(now\)/, "game should resolve boss hits and rewards");
assert.match(html, /稳稳救场[\s\S]*火焰穿行/, "six featured snake talents should be described in the game");
assert.match(html, /id="dailyTaskList"/, "task panel should show daily tasks");
assert.match(html, /id="collectionList"/, "task panel should show the collection book");
assert.match(html, /function loadGameImages\(\)/, "generated image assets should be preloaded");
assert.match(html, /function drawAlignedOrchardGrid\(\)[\s\S]*drawSoftArenaTexture\(\);/, "aligned orchard cells should keep a soft texture");
assert.doesNotMatch(html, /function drawBackground\(\)\s*\{[\s\S]*?drawArenaImageUnderlay\(ctx, canvas\);/, "logical board should not render a competing image grid");
assert.doesNotMatch(html, /radial-gradient\(circle at/, "desktop background should not use large round blob decorations");
assert.match(html, /function cellCenter\(cell\)/, "rendering should share one grid-center helper");
assert.match(html, /body\.map\(cellCenter\)/, "snake tube path should use the shared grid-center helper");
assert.match(html, /const \{ cx, cy \} = cellCenter\(apple\);/, "food should use the shared grid-center helper");

const cells = Number(html.match(/cells: (\d+),/)?.[1]);
const scaleBlock = html.match(/visualScale: \{([\s\S]*?)\n      \}/)?.[1] || "";
const scale = Object.fromEntries([...scaleBlock.matchAll(/(\w+): ([0-9.]+)/g)].map(([, key, value]) => [key, Number(value)]));
assert.equal(1300 % cells, 0, "canvas pixel size should divide evenly by the larger-cell grid count");
assert.ok(scale.treatRadius * 1.12 <= 0.5, "food body should visually stay inside one grid cell");
assert.ok(scale.treatRadius * (scale.sparkleScale + 0.16) <= 0.5, "food sparkle should not drift into a neighboring grid cell");
assert.ok(scale.snakeRadius * scale.headScale * 1.1 <= 0.5, "snake head details should stay visually tied to the current grid cell");

const demoAppleBlock = html.match(/state\.apples = \[([\s\S]*?)\n      \];/)?.[1] || "";
for (const [, x, y] of demoAppleBlock.matchAll(/\{ x: (\d+), y: (\d+), type:/g)) {
  assert.ok(Number(x) >= 0 && Number(x) < cells, `demo apple x=${x} should fit the current grid`);
  assert.ok(Number(y) >= 0 && Number(y) < cells, `demo apple y=${y} should fit the current grid`);
}

console.log("snake arena checks passed");
