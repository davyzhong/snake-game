# Demo-Faithful Snake Game UI Design

## Objective

Rebuild the desktop presentation of the snake game so its real, interactive UI follows the supplied 1680 by 945 demo: gold-framed orchard UI, large portrait-only snake cards, a framed orchard arena, a reward-focused menu overlay, and four large power-up buttons. The result must remain a playable HTML canvas game with visible controls and live state.

## Non-Negotiable Constraints

- Desktop only. The reference canvas is 1680 by 945 and all desktop layout is designed from that coordinate system, then scaled uniformly.
- No full-screen screenshot or hidden clickable overlay may substitute for a UI component.
- Every visible control must be a real DOM control and update real game state.
- The existing game rules, player saves, scoring, level progression, shop costs, keyboard controls, pause behavior, and board collision geometry remain unchanged.
- The orchard theme is the default visual target. Other themes remain data-compatible but are not a fidelity target in this pass.
- Generated art must be used as individual assets: never as a complete interface screenshot.

## Reference Layout

The implementation uses a 1680 by 945 virtual desktop canvas.

| Region | Reference role | Implementation role |
| --- | --- | --- |
| Header, y 14-91 | Gold-edged green rail with five cream statistic cells | Live player, score, best score, candy, selected snake, level data |
| Left rail, x 38-302 | Six numbered portrait cards | Six real snake-selection buttons |
| Main arena, x 364-1314 | Stone-and-vine orchard frame, large square playfield | Existing 30 by 30 canvas, decorative DOM frame and scene props |
| Right rail, x 1366-1629 | Six numbered portrait cards | Six real snake-selection buttons |
| Bottom rail, x 452-1214 | Four large action cells | Existing four shop/action buttons with inventory badges |
| Menu overlay, center | Large mascot, chest reward panel, play button | Existing menu state with selected snake, live reward preview, start button |

## Component Design

### Header HUD

- Replace the text-heavy header with a dark green, double gold-framed rail.
- Use five cream stat cells with a large number and a generated icon: trophy/score, crown/best, candy/stock, selected portrait plus length, star/level.
- Keep player edit, tasks, history, and restart as compact icon controls inside the header rail. They must remain visible and keyboard accessible.

### Snake Selection Rails

- Each real button has a colored glossy background, gold outer border, number medallion, and one 3D portrait.
- Card labels, XP text, and feature description are hidden on desktop; full labels remain in `aria-label`, tooltip, and the menu detail panel.
- Selection updates the real selected snake, its HUD portrait, the menu mascot, menu text, and the selected card glow.

### Orchard Arena

- Keep the canvas at 1200 by 1200 logical pixels and its existing `cellCenter()` alignment.
- Add an outer stone wall, moss, gold corners, and orchard props through independent decorative layers around the canvas; all are `pointer-events: none`.
- Update the canvas background renderer to use low-contrast grass cells, subtle scene texture, and a fixed collection of non-blocking props that do not suggest false grid positions.
- Apples, power-ups, and the snake remain drawn by the existing renderer and stay visually contained inside their cells.

### Menu Overlay

- Use a real modal-like menu card, not a static image.
- It contains a large selected-snake mascot, a chest/reward strip with six individual icons, concise selected-snake metadata, and a visible blue play button.
- Menu and game-over are separate content states but share the same component family.

### Bottom Power-Up Rail

- Use four square dark-green cells with gold framing and one large independent asset each: magnet, swirl, wing boot, potion.
- Each button keeps a live quantity/affordability badge and has an accessible name containing the true underlying ability, cost, and current state.
- The icon skin is presentation-only; button ids and `buyShopItem()` behavior remain canonical.

## Asset Inventory

| Asset | Purpose | File convention |
| --- | --- | --- |
| 12 portrait atlas | Side cards and selected portrait | `assets/snake-portraits-demo-v4.png` |
| 12 mascot atlas | Full-body menu mascot | `assets/snake-mascots-demo-v4.png` |
| HUD icon strip | Trophy, crown, candy, star, length dots | `assets/hud-icons-demo-v4.png` |
| Power-up strip | Magnet, swirl, boot, potion | `assets/powerups-demo-v4.png` |
| Reward strip | Chest, candy, gem, paw, fruit, key | `assets/rewards-demo-v4.png` |
| Arena prop strip | Apple, berry, candy, stump, flower, stone | `assets/orchard-props-demo-v4.png` |
| Frame texture | Stone-and-vine frame pieces | `assets/orchard-frame-demo-v4.png` |

All assets are generated and used separately. They may borrow the supplied demo's composition and visual direction, but no interface screenshot is used as a UI background.

## State and Interaction Mapping

- `state.selectedSnakeType` drives the portrait card highlight, menu mascot, menu title, HUD portrait, and canvas snake colors.
- `state.score`, `state.best`, `state.coins`, progress, and snake body length drive HUD cells.
- `state.phase` drives `menu`, `playing`, `paused`, and `gameover` surfaces. No phase hides the functional board or makes controls invisible.
- `CONFIG.shopItems` and `BOARD_POWERUP_BY_ID` remain the source of truth for bottom buttons and board pickups.
- Board prop art is decorative only and never reads or changes collision cells.

## Verification Standard

At 1680 by 945, compare a rendered menu screenshot with the supplied demo at these checkpoints:

1. Header height, cream stat-cell scale, and gold/green frame hierarchy.
2. Left/right card count, card proportions, number medallions, portrait scale, and selected glow.
3. Main arena size, wall thickness, corner ornaments, orchard density, and low-stimulation grid.
4. Menu card size, large mascot placement, reward strip, and primary play button placement.
5. Bottom bar width, four equal action cells, icon scale, and inventory badges.
6. No clipped content, overlapping controls, missing assets, or horizontal page overflow.

Functional validation must exercise: select snake, start game, turn, pause/resume, use a shop power-up, collide/end, claim chest, and restart.
