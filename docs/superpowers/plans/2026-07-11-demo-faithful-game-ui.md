# Demo-Faithful Game UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a fully playable desktop snake game whose real menu and game UI match the supplied 1680 by 945 orchard demo's layout and visual language.

**Architecture:** Keep all gameplay and persistence inside `outputs/snake-game.html`. Add a coherent `demoUi` visual configuration, independent image assets under `outputs/assets/`, and DOM/CSS components that project the existing `state` object. The canvas remains the only source for grid-aligned game objects; DOM decoration never participates in collisions.

**Tech Stack:** Single-file HTML, CSS, native JavaScript, Canvas 2D, Image Gen assets, Node assertion test, Browser/IAB visual QA.

## Global Constraints

- Desktop reference viewport is exactly `1680x945`; scale uniformly for other desktop viewports.
- No static screenshot may replace a functional screen or capture input.
- Preserve all rules, scores, saves, level thresholds, shop costs, keyboard input, pause, chest reward, and collision logic.
- Keep the playable 30 by 30 canvas geometry and `cellCenter()` coordinate mapping unchanged.
- Use generated assets as individual sprites or decorative pieces only.
- Do not add framework dependencies or a build step.
- All edited visible controls must remain accessible through text/aria labels and keyboard focus.

---

### Task 1: Establish the Reference Layout System

**Files:**
- Modify: `outputs/snake-game.html` CSS and top-level HTML structure
- Modify: `work/tests/check-snake-options.mjs`

**Interfaces:**
- Consumes: existing `.game`, `.topbar`, `.play-layout`, `.snake-column`, `.board-stack`, `.board-shop` elements
- Produces: CSS custom properties `--ref-width`, `--ref-height`, `--hud-height`, `--side-rail-width`, `--bottom-rail-height`, `--arena-size`

- [ ] Add a failing static assertion that desktop styles declare `--ref-width: 1680px` and `--ref-height: 945px`.
- [ ] Run `node work/tests/check-snake-options.mjs` and confirm the new assertion fails.
- [ ] Add an `@media (min-width: 901px)` reference-layout block that derives all region sizes from the six named tokens and centers a 16:9 game surface.
- [ ] Set a fixed desktop region order: HUD, side rails, canvas frame, bottom power-up rail, then transient overlays.
- [ ] Ensure the page has no scrollbars at `1680x945`, `1440x900`, and `1280x720` by constraining the game surface rather than hiding overflow.
- [ ] Re-run the static test and capture a Browser/IAB screenshot at `1680x945`.

### Task 2: Produce the Cohesive Demo Asset Pack

**Files:**
- Create: `outputs/assets/snake-portraits-demo-v4.png`
- Create: `outputs/assets/snake-mascots-demo-v4.png`
- Create: `outputs/assets/hud-icons-demo-v4.png`
- Create: `outputs/assets/powerups-demo-v4.png`
- Create: `outputs/assets/rewards-demo-v4.png`
- Create: `outputs/assets/orchard-props-demo-v4.png`
- Create: `outputs/assets/orchard-frame-demo-v4.png`
- Modify: `outputs/snake-game.html` `CONFIG.assetPaths`
- Modify: `work/tests/check-snake-options.mjs`

**Interfaces:**
- Consumes: `CONFIG.snakeTypes`, `CONFIG.shopItems`, `CONFIG.boardPowerupTypes`
- Produces: one 4 by 3 portrait atlas, one 4 by 3 mascot atlas, and documented sprite coordinate maps

- [ ] Add failing tests asserting that all seven v4 assets exist and are registered by `CONFIG.assetPaths`.
- [ ] Generate each asset independently with consistent glossy 3D orchard-game lighting and solid chroma-key backgrounds where alpha is needed.
- [ ] Remove chroma-key backgrounds with the image helper and validate alpha corners using `sips -g hasAlpha`.
- [ ] Record sprite row/column positions in `CONFIG.demoUi` so CSS and canvas never use anonymous magic coordinates.
- [ ] Verify every snake id maps to one portrait and one mascot; verify each shop item maps to one bottom-rail icon.
- [ ] Re-run the static test and inspect all atlases with `view_image` before using them.

### Task 3: Rebuild the Header as a Live Gold-Framed HUD

**Files:**
- Modify: `outputs/snake-game.html` topbar HTML, CSS, `els`, `syncHud()`, `renderCurrentSnakeHud()`
- Modify: `work/tests/check-snake-options.mjs`

**Interfaces:**
- Consumes: `state.score`, `state.best`, `state.coins`, `state.snake.body.length`, `state.selectedSnakeType`, `getSnakeProgress()`
- Produces: `renderDemoHud()` called from `syncHud()`

- [ ] Add failing tests for five HUD stat cells and an `#hudSelectedPortrait` element.
- [ ] Replace the text-heavy stat layout with five semantic stat cells, each containing a sprite icon, concise label, and live value.
- [ ] Add compact icon-only controls for player edit, task panel, record panel, and restart with visible tooltips.
- [ ] Implement `renderDemoHud()` so portrait background position, score, best, coins, length, and level refresh from `state`.
- [ ] Verify switching a snake immediately updates the HUD portrait and selecting player data updates the score cells.
- [ ] Re-run tests and Browser/IAB checks for keyboard focus and no header wrapping.

### Task 4: Rebuild Both Snake Rails as Interactive Portrait Cards

**Files:**
- Modify: `outputs/snake-game.html` side-card HTML/CSS and `renderSnakeCards()`
- Modify: `work/tests/check-snake-options.mjs`

**Interfaces:**
- Consumes: 12 existing `[data-snake]` buttons and `state.selectedSnakeType`
- Produces: `renderSnakeCards()` updates `aria-pressed`, portrait sprite positions, number medallions, and selected glow

- [ ] Add failing tests for exactly twelve number medallions, portrait-only desktop cards, and a visible selected state.
- [ ] Retain the existing 12 buttons but make card labels visually hidden only on desktop; preserve accessible names and titles with snake name, level, and trait.
- [ ] Apply explicit per-card color variants matching the reference blue, purple, orange, pink, and gold collection-card rhythm.
- [ ] Make portrait crop and card dimensions fixed so selection does not move the layout.
- [ ] Validate all 12 cards are fully visible and clickable in Browser/IAB at the reference viewport.
- [ ] Re-run tests and click one card from each rail to verify the selected menu data changes.

### Task 5: Rebuild the Orchard Arena Frame and Canvas Background

**Files:**
- Modify: `outputs/snake-game.html` `.board-stack`, `.board-wrap`, `drawBackground()`, `drawArenaImageUnderlay()`, `drawSoftArenaTexture()`
- Modify: `work/tests/check-snake-options.mjs`

**Interfaces:**
- Consumes: existing `canvas`, `CELL_SIZE`, `cellCenter()`, `state.apples`, `state.boardPowerups`
- Produces: `drawOrchardProps()` and non-interactive `.arena-decor` DOM layers

- [ ] Add failing tests that require a stone-and-vine frame layer and preserve the canvas `1200x1200` logical size.
- [ ] Build the frame from independent decorative pieces around, never over, the canvas hit area.
- [ ] Add low-contrast grass cells and fixed background props whose bounds stay away from food and power-up centers.
- [ ] Keep grid lines below the visual threshold defined in `CONFIG.themes.orchard.grid` and never alter `cellCenter()`.
- [ ] Exercise apple placement and power-up placement with a console/browser assertion that every object center remains in its own cell.
- [ ] Re-run tests and compare playing-state screenshot against the reference arena frame and orchard density.

### Task 6: Rebuild the Functional Menu and Game-Over Overlay

**Files:**
- Modify: `outputs/snake-game.html` message HTML/CSS, `showMessage()`, `hideMessage()`, `renderSnakeDetail()`, `endGame()`, `claimRoundChest()`
- Modify: `work/tests/check-snake-options.mjs`

**Interfaces:**
- Consumes: `state.phase`, `state.selectedSnakeType`, `getSnakeProgress()`, `state.pendingChest`
- Produces: `renderDemoMenu()` and `renderGameOverPanel()`

- [ ] Add failing tests for a visible selected-snake mascot, chest reward strip, six reward icon slots, and a real start button.
- [ ] Use the mascot atlas for a large selected snake image; update it through `renderSnakeDetail()`.
- [ ] Replace verbose menu copy with concise lines while keeping level, XP, reward, and chest state readable.
- [ ] Implement reward item slots as real DOM elements populated from `state.pendingChest` or the standard menu preview.
- [ ] Preserve the current start-button behavior: begin a round in menu state; claim chest first in eligible game-over state.
- [ ] Verify selection -> menu updates -> start -> game over -> claim chest -> replay in Browser/IAB.

### Task 7: Rebuild the Four-Item Bottom Power-Up Rail

**Files:**
- Modify: `outputs/snake-game.html` `.board-shop` CSS, `renderShop()`, `shopShowcaseSpritePosition()`
- Modify: `work/tests/check-snake-options.mjs`

**Interfaces:**
- Consumes: `CONFIG.shopItems`, `BOARD_POWERUP_BY_ID`, `getShopAffordableCount()`, `getShopStateText()`, `buyShopItem()`
- Produces: four equal `.shop-use` buttons with `aria-label`, large icon, count badge, and state badge

- [ ] Add failing tests for four equal action cells, v4 icon mapping, a count badge, and accessible ability text.
- [ ] Use a dedicated presentation mapping keyed by item id; do not change board pickup ids or gameplay effects.
- [ ] Make names compact or tooltip-only at the reference viewport while preserving current cost/status in screen-reader text and hover tooltip.
- [ ] Ensure disabled, unaffordable, paused, active-timer, and shield-charge states use distinct visual treatments without changing layout size.
- [ ] Browser-test purchase attempts in menu, playing, and paused states and assert existing rules still apply.
- [ ] Re-run tests and compare icon scale and rail composition against the reference.

### Task 8: Align Pause, Task, History, and Player Management Surfaces

**Files:**
- Modify: `outputs/snake-game.html` modal/popover CSS and rendering helpers
- Modify: `work/tests/check-snake-options.mjs`

**Interfaces:**
- Consumes: `state.phase`, `state.roundHistory`, `state.tasks`, `state.players`
- Produces: gold-framed compact panels that do not cover required controls

- [ ] Add failing tests that verify pause remains available via Space and popovers remain real visible panels.
- [ ] Apply the same gold frame, dark-green inner surface, and image-led heading treatment to task, history, and player-edit panels.
- [ ] Keep form fields, delete controls, and save controls visible and keyboard-operable.
- [ ] Confirm opening one popover closes the other and never moves the board or side rails.
- [ ] Browser-test Space pause/resume, task toggle, history toggle, player rename, and avatar selection.
- [ ] Re-run tests and verify no overlay or modal blocks the board permanently.

### Task 9: Execute Reference-Fidelity and Functional QA

**Files:**
- Modify: `work/tests/check-snake-options.mjs`
- Create: temporary screenshots outside the repository during QA only

**Interfaces:**
- Consumes: all completed UI components and existing gameplay loop
- Produces: a fidelity ledger and green automated checks

- [ ] Add static assertions for the reference layout tokens, v4 asset registration, interactive start control, 12 cards, five HUD cells, four power-up cells, and menu mascot.
- [ ] Run `node work/tests/check-snake-options.mjs` and the inline script syntax check; expected output is `snake arena checks passed` and `script syntax ok`.
- [ ] In Browser/IAB set viewport to `1680x945`; capture menu, playing, paused, game-over, and task-panel screenshots.
- [ ] Compare each screenshot with the reference across HUD, rails, arena, menu, bottom rail, typography, image scale, borders, and spacing; record and repair every material mismatch.
- [ ] Verify no console errors/warnings, broken images, clipping, horizontal overflow, or invisible controls.
- [ ] Run the complete interaction loop: select snake -> start -> move -> eat -> pause -> use power-up -> collide -> claim chest -> replay.

## Execution Handoff

This plan is complete and should be executed task-by-task. Implementation must remain blocked until the user selects an execution approach:

1. **Subagent-Driven (recommended):** one fresh implementation/review cycle per task.
2. **Inline Execution:** complete the tasks in this session, using this plan as the checklist.
