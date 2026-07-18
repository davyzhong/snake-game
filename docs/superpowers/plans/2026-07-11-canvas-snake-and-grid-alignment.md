# Canvas Snake And Grid Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the controllable canvas snake match the selected character art and make the visible board grid exactly match the 30 x 30 game coordinates.

**Architecture:** Keep the single-file canvas game and its existing state model. Introduce a single cell rectangle helper, draw all board layers from that helper, replace the generic snake head with a selected character sprite, and render the body as cell-snapped segments instead of a smoothed path that visually crosses grid boundaries.

**Tech Stack:** HTML, CSS, vanilla JavaScript Canvas 2D, Node assertion script, generated PNG sprite asset.

## Global Constraints

- Preserve the 30 x 30 board, controls, scores, skills, collision rules, and save data.
- Use only original generated assets stored under `outputs/assets`.
- Do not render a static screenshot as a game interface.
- Every visible board object must derive its position from `CELL_SIZE` and a logical cell coordinate.

---

### Task 1: Define the visual alignment contract

**Files:**
- Modify: `outputs/snake-game.html`
- Test: `work/tests/check-snake-options.mjs`

- [ ] **Step 1: Write the failing test**

```js
assert.match(html, /function cellRect\(cell\)/, "board visuals should share a cell rectangle helper");
assert.match(html, /drawAlignedOrchardGrid\(\)/, "orchard should draw its own logical grid");
assert.doesNotMatch(html, /drawArenaImageUnderlay\(ctx, canvas\);/, "board should not use an unrelated image grid");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node work/tests/check-snake-options.mjs`

Expected: an assertion failure for `cellRect` or `drawAlignedOrchardGrid`.

- [ ] **Step 3: Write minimal implementation**

```js
function cellRect(cell) {
  return { x: cell.x * CELL_SIZE, y: cell.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE };
}

function drawAlignedOrchardGrid() {
  // Paint exactly CONFIG.cells rows and columns with CELL_SIZE-derived bounds.
}
```

Remove the in-board arena image draw and call `drawAlignedOrchardGrid()` from `drawBackground()` before drawing objects.

- [ ] **Step 4: Run test to verify it passes**

Run: `node work/tests/check-snake-options.mjs`

Expected: `snake arena checks passed`.

### Task 2: Add selected-character snake head art

**Files:**
- Modify: `outputs/snake-game.html`
- Test: `work/tests/check-snake-options.mjs`

- [ ] **Step 1: Write the failing test**

```js
assert.match(html, /snakePortraitsCrisp: "assets\/snake-portraits-royal-v3-crisp\.png"/, "canvas should register the card portrait atlas");
assert.match(html, /function drawCardPortraitHead\(/, "canvas should render the exact card portrait as its head");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node work/tests/check-snake-options.mjs`

Expected: an assertion failure for `snakePortraitsCrisp`.

- [ ] **Step 3: Write minimal implementation**

Register the same crisp 4 x 3 portrait atlas used by the side cards in `CONFIG.assetPaths`. Draw its selected tile at the head cell center, rotate based on `state.snake.direction`, place the existing full-body mascot art behind it, and use the vector-drawn head only as an image-loading fallback.

- [ ] **Step 4: Run test to verify it passes**

Run: `node work/tests/check-snake-options.mjs`

Expected: `snake arena checks passed`.

### Task 3: Render body segments without cross-cell drift

**Files:**
- Modify: `outputs/snake-game.html`
- Test: `work/tests/check-snake-options.mjs`

- [ ] **Step 1: Write the failing test**

```js
assert.match(html, /function drawCharacterSnakeSegments\(/, "body should use cell-snapped segments");
assert.match(html, /body\.slice\(1\)\.forEach\(drawCharacterSnakeSegment\)/, "each body segment should occupy a logical cell");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node work/tests/check-snake-options.mjs`

Expected: an assertion failure for `drawCharacterSnakeSegments`.

- [ ] **Step 3: Write minimal implementation**

Replace `drawLuxuryTubePath` with segment rendering based on `cellCenter(part)`. Each segment draws an outer outline, colored body, lighter belly/highlight and optional scale decoration inside one cell. Draw the selected-character head above the segments.

- [ ] **Step 4: Run test to verify it passes**

Run: `node work/tests/check-snake-options.mjs`

Expected: `snake arena checks passed`.

### Task 4: Verify visual alignment and gameplay

**Files:**
- Modify: `work/tests/check-snake-options.mjs`

- [ ] **Step 1: Add static checks for alignment helpers and character assets**

```js
assert.ok(existsSync(join(root, "outputs", "assets", "snake-portraits-royal-v3-crisp.png")), "shared card portrait asset should exist");
assert.match(html, /cellCenter\(apple\)/, "apples should remain cell centered");
```

- [ ] **Step 2: Run full static test and script compilation**

Run: `node work/tests/check-snake-options.mjs && node -e '/* compile inline scripts */'`

Expected: static test passes and all inline scripts compile.

- [ ] **Step 3: Run browser checks**

At a 1680 x 945 desktop viewport, select a non-default snake, start the game, verify the message layer hides, press Space twice, and verify pause then resume. Visually inspect that grid lines pass through each cell boundary and every board object is centered in one cell.
