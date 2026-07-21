import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

class FakeElement {
  constructor() {
    this.style = {};
    this.dataset = {};
    this.hidden = false;
    this.disabled = false;
    this.textContent = "";
    this.className = "";
    this.children = [];
    this.classList = { toggle: () => false };
  }

  addEventListener() {}
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  insertBefore(child) { this.children.push(child); return child; }
  setAttribute() {}
  remove() {}
  focus() {}
  querySelector() { return new FakeElement(); }
  querySelectorAll() { return []; }
}

function createGameHarness() {
  const html = readFileSync(new URL("../../outputs/snake-game.html", import.meta.url), "utf8");
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, "game script should be present");

  const elements = new Map();
  const get = key => {
    if (!elements.has(key)) elements.set(key, new FakeElement());
    return elements.get(key);
  };
  const snakeButtons = ["sprout", "apple", "spark", "berry", "coin", "rainbow", "flower", "cloud", "gem", "candy", "ocean", "fire"].map(id => {
    const button = new FakeElement();
    button.dataset.snake = id;
    return button;
  });
  const controls = ["up", "down", "left", "right"].map(dir => {
    const button = new FakeElement();
    button.dataset.dir = dir;
    return button;
  });
  const canvas = get("#board");
  canvas.width = 1300;
  canvas.height = 1300;
  canvas.getContext = () => ({});

  let clock = 0;
  const storage = new Map();
  const document = {
    body: new FakeElement(),
    visibilityState: "visible",
    addEventListener() {},
    createElement() {
      const element = new FakeElement();
      element.getContext = () => ({});
      return element;
    },
    querySelector(selector) {
      if (selector.startsWith("[data-level-for=") || selector.startsWith("[data-xp-for=")) return get(selector);
      if (selector === ".stat-art-snake") return get(selector);
      return get(selector);
    },
    querySelectorAll(selector) {
      if (selector === ".snake-option") return snakeButtons;
      if (selector === ".control") return controls;
      return [];
    }
  };
  const context = {
    __SNAKE_TEST__: true,
    console,
    document,
    window: { confirm: () => true },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    },
    performance: { now: () => clock },
    requestAnimationFrame: () => 1,
    Image: class { constructor() { this.complete = false; this.naturalWidth = 0; } },
    Date,
    Math,
    Object,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    RegExp,
    setTimeout,
    clearTimeout
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(script, context, { filename: "snake-game.html" });
  return { api: context.__snakeTestApi, document, storage, setClock: value => { clock = value; } };
}

const { api, document, storage, setClock } = createGameHarness();
assert.ok(api, "game should expose its real rule API to the test harness");

api.state.players.p2 = api.newDefaultPlayer("p2", "玩家2", "🐼");
api.state.phase = "playing";
assert.equal(api.switchPlayer("p2"), false, "players cannot switch during a round");
assert.equal(api.state.activePlayerId, "p1", "active player remains stable during a round");
assert.equal(api.chooseSnake("fire"), false, "snake choice cannot change during a round");

api.state.phase = "gameover";
api.state.pendingChest = { id: 7, candy: 42, score: 100, claimed: false };
api.savePendingChest();
assert.equal(JSON.parse(storage.get("snake-players")).players.p1.pendingChest.candy, 42, "unclaimed chest persists in player storage");
api.state.pendingChest = null;
api.applyPlayerToState("p1");
assert.equal(api.state.pendingChest.candy, 42, "pending chest restores from player storage");
api.state.selectedSnakeType = api.CONFIG.snakeTypes.find(type => type.id === "candy");
api.state.coins = 0;
api.claimRoundChest();
assert.equal(api.state.coins, 42, "a saved chest pays its locked amount without a second candy bonus");

api.state.phase = "playing";
api.resetRoundStats();
api.state.timing.gameNow = 0;
api.advanceGameClock(1_000);
assert.equal(api.getGameNow(), 1_000, "game clock keeps accurate active time even on a slow frame");
api.state.phase = "paused";
api.advanceGameClock(30_000);
assert.equal(api.getGameNow(), 1_000, "paused time does not advance gameplay time");
api.state.phase = "playing";
api.applyShopItem("magnet");
const magnetUntil = api.state.powerups.magnetUntil;
api.state.phase = "paused";
api.advanceGameClock(30_000);
assert.equal(api.state.powerups.magnetUntil, magnetUntil, "paused time does not consume magnet duration");

api.state.phase = "playing";
document.visibilityState = "hidden";
assert.equal(api.handleVisibilityChange(), undefined, "visibility handler may pause without returning a value");
assert.equal(api.state.phase, "paused", "hiding the page automatically pauses an active round");
document.visibilityState = "visible";

api.state.selectedSnakeType = api.CONFIG.snakeTypes.find(type => type.id === "ocean");
api.state.phase = "playing";
api.state.talent.oceanWrapCharges = 1;
api.state.snake.body = [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }];
api.state.snake.direction = { x: -1, y: 0 };
api.state.snake.nextDirection = { x: -1, y: 0 };
api.state.apples = [];
api.state.boardPowerups = [];
api.state.goldenRunner = null;
api.state.mysteryChest = null;
api.state.boss = null;
setClock(1000);
api.step(1000);
assert.equal(api.state.snake.body[0].x, api.CONFIG.cells - 1, "ocean snake wraps once at a wall");
assert.equal(api.state.talent.oceanWrapCharges, 0, "ocean wrap is consumed after use");

api.state.selectedSnakeType = api.CONFIG.snakeTypes.find(type => type.id === "candy");
api.state.coins = 0;
assert.equal(api.addCandyPoints(20), 24, "candy snake receives its 20 percent candy bonus");

console.log("game rule runtime checks passed");
