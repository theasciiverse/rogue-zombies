var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/prototype.ts
Array.prototype.random = function() {
  const { length } = this;
  if (!length) {
    return null;
  }
  return this[Math.floor(Math.random() * length)];
};
String.prototype.capitalize = function() {
  const { length } = this;
  if (!length) {
    return this;
  }
  return this.substring(0, 1).toUpperCase() + this.substring(1);
};
String.prototype.article = function() {
  let a = this.match(/^[aeiou]/i) ? "an" : "a";
  return `${a} ${this}`;
};

// src/entity.ts
var Entity = class {
  constructor(map) {
    this.map = map;
  }
  _position;
  _hp = 1;
  get name() {
    return "";
  }
  get position() {
    return this._position;
  }
  set position(position) {
    this._position = position;
    this.map.changed(this);
  }
  damage(source) {
    this._hp -= 1;
    if (this._hp == 0) {
      this.die(source);
    }
  }
};

// src/beings/being.ts
var Being = class extends Entity {
  die(source) {
    const { map, position, visual } = this;
    map.removeBeing(this);
    map.setBackground(position[0], position[1], { ch: "%", fg: visual.fg });
  }
};

// src/keyboard.ts
function matchFilter(event, filter) {
  if (!filter.length) {
    return true;
  }
  return filter.some((f) => {
    for (let p in f) {
      return event[p] == f[p];
    }
  });
}
async function readKey(allowed = []) {
  let ac = new AbortController();
  let { signal } = ac;
  return new Promise((resolve) => {
    function onKeyDown(e) {
      if (!matchFilter(e, allowed)) {
        return;
      }
      ac.abort();
      resolve(e);
    }
    window.addEventListener("keydown", onKeyDown, { signal });
  });
}

// src/metrics.ts
var metrics_exports = {};
__export(metrics_exports, {
  Renderer: () => Renderer2,
  charWidth: () => charWidth,
  init: () => init,
  tileCount: () => tileCount,
  tileSize: () => tileSize
});

// src/renderer/renderer.ts
var Renderer = class {
  node;
  static computeTileSize(tileCount3, area, aspectRatioRange) {
    let w = Math.floor(area[0] / tileCount3[0]);
    let h = Math.floor(area[1] / tileCount3[1]);
    let ar = w / h;
    if (ar < aspectRatioRange[0]) {
      h = Math.floor(w / aspectRatioRange[0]);
    } else if (ar > aspectRatioRange[1]) {
      w = Math.floor(h * aspectRatioRange[1]);
    }
    return [w, h];
  }
};

// src/renderer/canvas.ts
var DPR = devicePixelRatio > 1 ? 2 : 1;
var Canvas = class extends Renderer {
  node = document.createElement("canvas");
  ctx = this.node.getContext("2d");
  tileSize;
  constructor() {
    super();
    this.node.className = "renderer canvas";
  }
  configure(tileCount3, tileSize2) {
    const { node: node3, ctx } = this;
    node3.width = tileCount3[0] * tileSize2[0] * DPR;
    node3.height = tileCount3[1] * tileSize2[1] * DPR;
    ctx.restore();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${tileSize2[1]}px input`;
    ctx.scale(DPR, DPR);
    this.tileSize = tileSize2;
  }
  draw(x, y, drawables) {
    let visuals = drawables.map((d) => d.visual);
    let visual = resolveVisual(visuals);
    this.drawVisual(x, y, visual);
  }
  drawVisual(x, y, visual) {
    const { ctx, tileSize: tileSize2 } = this;
    ctx.fillStyle = visual.bg;
    ctx.fillRect(x * tileSize2[0], y * tileSize2[1], tileSize2[0], tileSize2[1]);
    if (visual.ch) {
      ctx.fillStyle = visual.fg;
      ctx.fillText(visual.ch, (x + 0.5) * tileSize2[0], (y + 0.5) * tileSize2[1] + 1);
    }
  }
  remove() {
  }
};
function resolveVisual(visuals) {
  let visual = {
    bg: "black",
    fg: "gray",
    ch: ""
  };
  visuals.forEach((v) => Object.assign(visual, v));
  return visual;
}

// src/renderer/dom.ts
var DOM = class extends Renderer {
  node = document.createElement("div");
  nodes = /* @__PURE__ */ new Map();
  constructor() {
    super();
    this.node.className = "renderer dom";
  }
  configure() {
  }
  draw(x, y, drawables) {
    const { node: node3, nodes } = this;
    drawables.forEach((d, i) => {
      let dnode = nodes.get(d);
      if (!dnode) {
        dnode = document.createElement("div");
        node3.append(dnode);
        nodes.set(d, dnode);
      }
      dnode.style.setProperty("--x", String(x));
      dnode.style.setProperty("--y", String(y));
      dnode.style.zIndex = String(i + 1);
      const { visual } = d;
      if (visual.bg) {
        dnode.style.backgroundColor = visual.bg;
      }
      if (visual.fg) {
        dnode.style.color = visual.fg;
      }
      if (visual.ch) {
        dnode.textContent = visual.ch;
      }
    });
  }
  remove(drawable) {
    const { nodes } = this;
    let dnode = nodes.get(drawable);
    dnode && dnode.remove();
  }
};

// src/renderer/combo.ts
var Combo = class extends Renderer {
  node = document.createElement("div");
  renderers;
  static computeTileSize(tileCount3, area, aspectRatioRange) {
    let halfArea = [area[0] / 2, area[1]];
    return super.computeTileSize(tileCount3, halfArea, aspectRatioRange);
  }
  constructor() {
    super();
    const { node: node3 } = this;
    node3.className = "renderer combo";
    let renderers = [Canvas, DOM].map((r) => new r());
    node3.append(...renderers.map((r) => r.node));
    this.renderers = renderers;
  }
  draw(x, y, drawables) {
    this.renderers.forEach((r) => r.draw(x, y, drawables));
  }
  remove(drawable) {
    this.renderers.forEach((r) => r.remove(drawable));
  }
  configure(tileCount3, tileSize2) {
    this.renderers.forEach((r) => r.configure(tileCount3, tileSize2));
  }
};

// src/metrics.ts
var tileCount;
var tileSize;
var charWidth;
var Renderer2 = Combo;
var { style } = document.documentElement;
var resizeTimeout;
function onResized() {
  measure();
  window.dispatchEvent(new CustomEvent("metrics-change"));
}
function onResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(onResized, 100);
}
function measure() {
  let realTileCount = [tileCount[0], tileCount[1] + 5];
  tileSize = Renderer2.computeTileSize(realTileCount, [window.innerWidth, window.innerHeight], [0.7, 1]);
  console.log(tileSize);
  style.setProperty("--tile-width", `${tileSize[0]}px`);
  style.setProperty("--tile-height", `${tileSize[1]}px`);
  charWidth = measureCharWidth();
  style.setProperty("--char-width", `${charWidth}px`);
}
async function init(tc) {
  tileCount = tc;
  style.setProperty("--map-width", String(tileCount[0]));
  style.setProperty("--map-height", String(tileCount[1]));
  document.fonts.forEach((f) => f.load());
  await document.fonts.ready;
  measure();
  window.addEventListener("resize", onResize);
}
function measureCharWidth() {
  let span = document.createElement("span");
  span.style.fontSize = "var(--tile-height)";
  span.textContent = "P";
  document.body.append(span);
  let rect = span.getBoundingClientRect();
  span.remove();
  return rect.width;
}

// src/log.ts
var node = document.querySelector("#log");
var shown = [];
var pending = [];
function add(str) {
  let span = document.createElement("span");
  span.textContent = str + " ";
  let length = str.length + 1;
  pending.push({ node: span, length });
  showPending();
}
async function flush() {
  while (pending.length > 0) {
    await waitForMore();
    while (shown.length > 0) {
      shown.shift().node.remove();
    }
    showPending();
  }
}
function clear() {
  node.replaceChildren();
  shown = [];
  pending = [];
}
function showPending() {
  let limit = tileCount[0] * 2 - 15;
  let shownLength = shown.reduce((acc, h) => acc + h.length, 0);
  while (pending.length > 0) {
    let first = pending[0];
    if (shownLength + first.length > limit) {
      break;
    }
    node.append(first.node);
    shownLength += first.length;
    shown.push(pending.shift());
  }
}
async function waitForMore() {
  let more = document.createElement("span");
  let kbd = document.createElement("kbd");
  kbd.textContent = "space";
  more.append("...", kbd);
  node.append(more);
  while (true) {
    let key = await readKey();
    if (key.code == "Space") {
      break;
    }
  }
  more.remove();
}

// src/items/item.ts
var Item = class extends Entity {
  static Name = "";
  static description = "";
  blocks = false;
  get name() {
    return this.constructor.Name;
  }
  die(source) {
    this.map.removeItem(this);
  }
  activate(being) {
  }
  // stepped on something
  use(position, direction) {
    const { map } = this;
    let tx = position[0] + direction[0];
    let ty = position[1] + direction[1];
    let blocker = map.getBlocker(tx, ty);
    if (blocker) {
      add(`Cannot use ${this.name}: ${blocker.name.article()} is standing there!`);
      return false;
    }
    let item = map.getItem(tx, ty);
    if (item) {
      add(`Cannot use ${this.name}: ${item.name.article()} is lying there!`);
      return false;
    }
    return true;
  }
};

// src/sfx.ts
var DB = {
  "zombie-spawn": 8,
  "rake": 3,
  "crowbar": 3,
  "swoosh": 1,
  "barricade": 3
};
var audio = {};
function init2() {
  Object.entries(DB).forEach(([key, count]) => {
    let list = [];
    for (let i = 1; i <= count; i++) {
      let a = new Audio(`sfx/${key}-${i}.mp3`);
      a.load();
      list.push(a);
    }
    audio[key] = list;
  });
}
function play(what) {
  audio[what].random().play();
}

// src/items/crowbar.ts
var Crowbar = class extends Item {
  visual = {};
  static Name = "Crowbar";
  static description = "Melee range, unlimited uses. You already have this.";
  use(position, direction) {
    let tx = position[0] + direction[0];
    let ty = position[1] + direction[1];
    let being = this.map.getBeing(tx, ty);
    let item = this.map.getItem(tx, ty);
    if (being) {
      play("crowbar");
      add(`You hit the ${being.name}.`);
      being.damage(this);
    } else if (item) {
      add(`You hit the ${item.name}.`);
      item.damage(this);
    } else {
      play("swoosh");
      add("You swing the crowbar in the empty space.");
    }
    return true;
  }
};

// src/items/barricade.ts
var COLORS = ["", "#300", "#850", "#c90"];
var Barricade = class extends Item {
  static Name = "Wooden Barricade";
  static description = "Can hold them for some time.";
  blocks = true;
  _hp = COLORS.length - 1;
  visual = { ch: "#", fg: COLORS[COLORS.length - 1] };
  damage(source) {
    play("barricade");
    super.damage(source);
    if (this._hp > 0) {
      this.visual.fg = COLORS[this._hp];
      this.map.changed(this);
    }
  }
  use(position, direction) {
    let ok = super.use(position, direction);
    if (!ok) {
      return false;
    }
    let tx = position[0] + direction[0];
    let ty = position[1] + direction[1];
    this._position = [tx, ty];
    this.map.addItem(this);
    add("You build a barricade.");
    return true;
  }
};

// src/items/rake.ts
var Rake = class extends Item {
  static Name = "Rake";
  static description = "Kills one zombie dumb enough to step on it.";
  visual = { ch: "]", fg: "#999" };
  use(position, direction) {
    let ok = super.use(position, direction);
    if (!ok) {
      return false;
    }
    let tx = position[0] + direction[0];
    let ty = position[1] + direction[1];
    this._position = [tx, ty];
    this.map.addItem(this);
    add("You set up a rake.");
    return true;
  }
  activate(being) {
    play("rake");
    this.map.removeItem(this);
    being.damage(this);
  }
};

// src/dirs.ts
var dirs_default = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1]
];

// src/beings/zombie.ts
var CHARS = ["z", "Z"];
var COLORS2 = ["DarkOliveGreen", "LightSlateGray", "Olive", "OliveDrab", "SaddleBrown", "GoldenRod", "DarkSeaGreen"];
var Zombie = class extends Being {
  constructor(map, zombies) {
    super(map);
    this.zombies = zombies;
  }
  visual = { ch: CHARS.random(), fg: COLORS2.random() };
  get name() {
    return this.visual.ch == "z" ? "zombie" : "large zombie";
  }
  async play(player) {
    const { position } = this;
    let results = dirs_default.map((dir) => {
      let x = position[0] + dir[0];
      let y = position[1] + dir[1];
      return this.getMovementResult(x, y, player);
    });
    let best = pickBestMovementResult(results);
    if (!best) {
      return;
    }
    switch (best.type) {
      case "player":
        player.damage(this);
        break;
      case "item":
        best.item.damage(this);
        break;
      case "move":
        this.position = best.position;
        if (best.item) {
          await best.item.activate(this);
        }
        break;
    }
  }
  die(source) {
    super.die(source);
    this.zombies.remove(this);
  }
  getMovementResult(x, y, player) {
    const { map, position } = this;
    if (!map.isPositionValid(x, y)) {
      return { type: "invalid" };
    }
    let being = map.getBeing(x, y);
    if (being) {
      let type = being == player ? "player" : "invalid";
      return { type };
    }
    let currentDistance = distance(position, player.position);
    let dist = distance([x, y], player.position);
    if (dist > currentDistance) {
      return { type: "invalid" };
    }
    let item = map.getItem(x, y);
    if (item && item.blocks) {
      return { type: "item", dist, item };
    } else {
      return { type: "move", dist, position: [x, y], item };
    }
  }
};
function pickBestMovementResult(results) {
  let valid = results.filter((r) => r.type != "invalid");
  if (!valid.length) {
    return null;
  }
  let player = valid.find((r) => r.type == "player");
  if (player) {
    return player;
  }
  let moves = valid.filter((r) => r.type == "move");
  if (moves.length > 0) {
    return pickBestDistanceResult(moves);
  }
  let items = valid.filter((r) => r.type == "item");
  return pickBestDistanceResult(items);
}
function pickBestDistanceResult(results) {
  let distances = results.map((r) => r.dist);
  let best = Math.min(...distances);
  return results.filter((r) => r.dist == best).random();
}
function distance(pos1, pos2) {
  var dx = Math.abs(pos1[0] - pos2[0]);
  var dy = Math.abs(pos1[1] - pos2[1]);
  return Math.max(dx, dy);
}

// src/explosion.ts
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function gatherPositions(map, center, r) {
  let positions = [];
  for (let i = center[0] - r; i <= center[0] + r; i++) {
    for (let j = center[1] - r; j <= center[1] + r; j++) {
      if (!map.isPositionValid(i, j)) {
        continue;
      }
      positions.push([i, j]);
    }
  }
  return positions;
}
function extractZombies(positions, map) {
  let zombies = [];
  positions.forEach((pos) => {
    let being = map.getBeing(pos[0], pos[1]);
    if (being instanceof Zombie) {
      zombies.push(being);
    }
  });
  return zombies;
}
function drawExplosions(map, positions, fraction) {
  let amount = Math.round(3 * 255 * (1 - fraction));
  let r = Math.max(0, Math.min(amount - 0 * 255, 255));
  let g = Math.max(0, Math.min(amount - 1 * 255, 255));
  let b = Math.max(0, Math.min(amount - 2 * 255, 255));
  let fg = `rgb(${r} ${g} ${b})`;
  let visual = { ch: "*", fg };
  positions.forEach((pos) => map.setFX(pos[0], pos[1], visual));
}
async function explode(map, position, radius, source) {
  let positions = gatherPositions(map, position, radius);
  let zombies = extractZombies(positions, map);
  let promises = zombies.map((z) => z.damage(source));
  let duration = 400;
  let step = 30;
  for (let i = 0; i < duration; i += step) {
    drawExplosions(map, positions, i / duration);
    await sleep(step);
  }
  positions.forEach((pos) => map.setFX(pos[0], pos[1], null));
  await Promise.all(promises);
}

// src/items/mine.ts
var Mine = class extends Item {
  static Name = "Mine";
  static description = "Explodes when stepped on by a zombie.";
  visual = { ch: "*", fg: "gray" };
  use(position, direction) {
    let ok = super.use(position, direction);
    if (!ok) {
      return false;
    }
    let tx = position[0] + direction[0];
    let ty = position[1] + direction[1];
    this._position = [tx, ty];
    this.map.addItem(this);
    add("You set up a mine.");
    return true;
  }
  async activate(being) {
    const { map, position } = this;
    map.removeItem(this);
    await explode(map, position, 3, this);
  }
};

// src/items/bazooka.ts
var Bazooka = class extends Item {
  visual = { ch: "*", fg: "yellow" };
  static Name = "Bazooka";
  static description = "Flys in a straight line, explodes on impact.";
  async use(position, direction) {
    const { map, visual } = this;
    add("You launch a rocket...");
    let tx = position[0];
    let ty = position[1];
    while (true) {
      tx += direction[0];
      ty += direction[1];
      if (!map.isPositionValid(tx, ty)) {
        add("it flies away.");
        break;
      }
      let target = map.getBlocker(tx, ty);
      if (target) {
        add(`${target.name.article()} is hit!`);
        await explode(map, [tx, ty], 2, this);
        break;
      } else {
        map.setFX(tx, ty, visual);
        await sleep2(50);
        map.setFX(tx, ty, null);
      }
    }
    return true;
  }
};
function sleep2(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/items/wire.ts
var CONNECTION_DISTANCE = 3;
var Wire = class extends Item {
  static Name = "Barbed wire";
  static description = "Auto-connects to nearby wires. Has little health.";
  visual = { ch: "#", fg: "#888" };
  activate(being) {
    this.damage(being);
    being.damage(this);
  }
  use(position, direction) {
    let ok = super.use(position, direction);
    if (!ok) {
      return false;
    }
    const { map } = this;
    let tx = position[0] + direction[0];
    let ty = position[1] + direction[1];
    this._position = [tx, ty];
    map.addItem(this);
    let Ctor = this.constructor;
    dirs_default.forEach((dir) => {
      tryConnection([tx, ty], dir, map, Ctor);
    });
    add("You build a barbed wire segment.");
  }
};
function tryConnection(position, direction, map, Ctor) {
  let amount = 0;
  for (let i = 1; i < CONNECTION_DISTANCE; i++) {
    let x = position[0] + i * direction[0];
    let y = position[1] + i * direction[1];
    let blocker = map.getBlocker(x, y);
    if (blocker && !(blocker instanceof Player)) {
      break;
    }
    let item = map.getItem(x, y);
    if (item) {
      if (item instanceof Ctor) {
        amount = i - 1;
      }
      break;
    }
  }
  for (let i = 1; i <= amount; i++) {
    let x = position[0] + i * direction[0];
    let y = position[1] + i * direction[1];
    let item = new Ctor(map);
    item.position = [x, y];
    map.addItem(item);
  }
}

// src/items/fence.ts
var COLORS3 = ["", "#008", "#33a", "#88f"];
var Fence = class extends Wire {
  static Name = "Electric fence";
  static description = "Auto-connects to nearby fences. Has more health.";
  _hp = COLORS3.length - 1;
  visual = { ch: "\u2248", fg: COLORS3[this._hp] };
  damage(source) {
    super.damage(source);
    if (this._hp > 0) {
      this.visual.fg = COLORS3[this._hp];
      this.map.changed(this);
    }
  }
};

// src/items/db.ts
var ITEMS = [{
  id: "crowbar",
  key: "1",
  price: 0,
  amount: 0,
  ctor: Crowbar
}, {
  id: "barricade",
  short: "Barricade",
  key: "2",
  price: 1,
  amount: 5,
  ctor: Barricade
}, {
  id: "rake",
  key: "3",
  price: 1,
  amount: 3,
  ctor: Rake
}, {
  id: "mine",
  key: "4",
  price: 3,
  amount: 1,
  ctor: Mine
}, {
  id: "bazooka",
  key: "5",
  price: 5,
  amount: 1,
  ctor: Bazooka
}, {
  id: "wire",
  short: "Wire",
  key: "6",
  price: 3,
  amount: 2,
  ctor: Wire
}, {
  id: "fence",
  short: "Fence",
  key: "7",
  price: 3,
  amount: 2,
  ctor: Fence
}];

// src/rules.ts
var ZOMBIE_MOVE_CHANCE = 0.5;
var PLAYER_HP = 3;

// src/status.ts
var node2 = document.querySelector("#status");
function update(player) {
  let items = ITEMS.map((it) => buildItem(it, player));
  let status = [
    "Health: ",
    buildHP(player.hp, PLAYER_HP),
    "  ",
    "Money: ",
    buildMoney(player.money),
    "  ",
    buildKey("B", "uy items"),
    "  ",
    buildKey("S", "tart the invasion"),
    "  ",
    buildKey("?", "Help")
  ];
  node2.replaceChildren(...items, "\n", ...status);
}
function buildHP(curent, max) {
  let node3 = document.createElement("span");
  node3.className = "hp";
  let str = "";
  for (let i = 0; i < max; i++) {
    str += i < curent ? "\u2665" : "\u2661";
  }
  node3.textContent = str;
  return node3;
}
function buildMoney(money) {
  let node3 = document.createElement("span");
  node3.className = "money";
  node3.textContent = String(money);
  return node3;
}
function buildKey(key, text) {
  let node3 = document.createElement("span");
  let kbd = document.createElement("kbd");
  kbd.textContent = key;
  node3.append(kbd, text);
  return node3;
}
function buildItem(it, player) {
  let node3 = document.createElement("span");
  node3.className = "item";
  let count = player.getItem(it.id);
  node3.classList.toggle("disabled", count == 0);
  let kbd = document.createElement("kbd");
  kbd.textContent = it.key;
  let c = document.createElement("span");
  c.className = "count";
  c.textContent = count == Infinity ? "\u221E" : String(count);
  node3.append(kbd, it.short || it.ctor.Name, c, "  ");
  return node3;
}

// src/dialogs/dialog.ts
var Dialog = class {
  dialog = document.createElement("dialog");
  resolve;
  keys = [];
  constructor(title) {
    let h2 = document.createElement("h2");
    h2.textContent = title;
    this.append(h2);
  }
  append(...nodes) {
    this.dialog.append(...nodes);
  }
  async show() {
    const { dialog } = this;
    document.body.append(dialog);
    dialog.showModal();
    while (true) {
      let event = await readKey();
      if (event.key == "Escape") {
        event.preventDefault();
      }
      let id = this.matchKeyEvent(event);
      if (id !== null) {
        dialog.close();
        dialog.remove();
        return id;
      }
    }
  }
  addKey(key) {
    this.keys.push(key);
  }
  matchKeyEvent(event) {
    let key = this.keys.find((key2) => {
      if ("key" in key2 && key2.key != event.key) {
        return false;
      }
      if ("code" in key2 && key2.code != event.code) {
        return false;
      }
      return true;
    });
    return key ? key.id : null;
  }
};

// src/dialogs/help.ts
async function help() {
  while (true) {
    let dialog = new Dialog("Help!");
    dialog.addKey({ id: "", key: "Escape" });
    dialog.addKey({ id: "one", key: "1" });
    let result = await dialog.show();
    if (result == "") {
      break;
    }
  }
}

// src/dialogs/buy.ts
async function buy(player) {
  while (true) {
    let dialog = new Dialog("Buy items");
    let table = buildItemTable(player, dialog);
    dialog.append(table);
    let info = document.createElement("p");
    info.innerHTML = "Earn money by killing zombies. Press <kbd>esc</kbd> to exit.";
    dialog.addKey({ id: "", key: "Escape" });
    dialog.append(info);
    let result = await dialog.show();
    if (result == "") {
      break;
    } else {
      let it = ITEMS.find((it2) => it2.id == result);
      let price = it.price;
      player.setItem(result, player.getItem(result) + it.amount);
      player.money -= price;
    }
  }
}
function buildItemTable(player, dialog) {
  let table = document.createElement("table");
  table.innerHTML = TABLE;
  let rows = ITEMS.map((def) => buildItemRow(def, player, dialog));
  table.tBodies[0].append(...rows);
  return table;
}
function buildItemRow(item, player, dialog) {
  let row = document.createElement("tr");
  let disabled = item.price > player.money;
  if (!item.price) {
    disabled = true;
  }
  row.classList.toggle("disabled", disabled);
  let kbd = document.createElement("kbd");
  kbd.textContent = item.key;
  row.insertCell().append(kbd);
  row.insertCell().textContent = item.ctor.Name;
  if (item.price > 0) {
    let price = document.createElement("span");
    price.className = "price";
    price.textContent = String(item.price);
    row.insertCell().append(price, " for ", String(item.amount));
  } else {
    row.insertCell().textContent = "-free-";
  }
  row.insertCell().textContent = item.ctor.description;
  if (!disabled) {
    dialog.addKey({ id: item.id, code: `Numpad${item.key}` });
    dialog.addKey({ id: item.id, code: `Digit${item.key}` });
  }
  return row;
}
var TABLE = `
<thead>
	<tr>
		<th>Key</th>
		<th>Item</th>
		<th>Price</th>
		<th></th>
	</tr>
</thead>
<tbody></tbody>
`;

// src/beings/player.ts
var Player = class extends Being {
  constructor(map) {
    super(map);
    this.map = map;
    update(this);
    this._hp--;
    this.setItem("crowbar", Infinity);
    this.setItem("rake", Infinity);
    this.setItem("barricade", 3);
    this.setItem("mine", Infinity);
    this.setItem("bazooka", Infinity);
    this.setItem("wire", Infinity);
    this.setItem("fence", Infinity);
  }
  visual = { ch: "@", fg: "red" };
  _hp = PLAYER_HP;
  _money = 10;
  items = new window.Map();
  get hp() {
    return this._hp;
  }
  async play() {
    while (true) {
      let key = await readKey();
      console.log(key);
      let acted = await this.processKey(key);
      if (acted) {
        break;
      }
    }
  }
  getItem(id) {
    return this.items.get(id) || 0;
  }
  setItem(id, amount) {
    this.items.set(id, amount);
    update(this);
  }
  get money() {
    return this._money;
  }
  set money(money) {
    this._money = money;
    update(this);
  }
  async processKey(key) {
    clear();
    if (key.code in MOVEMENT) {
      let diff = MOVEMENT[key.code];
      return this.moveBy(...diff);
    }
    if (key.code.startsWith("Digit")) {
      let num = key.code.match(/\d/);
      return num ? this.tryItem(num[0]) : false;
    }
    if (key.code == "KeyB") {
      await buy(this);
      return false;
    }
    if (key.key == "?") {
      await help();
      return false;
    }
    if (key.code == "KeyL") {
      for (let i = 0; i < 10; i++) {
        add(String(Math.random()));
      }
      return true;
    }
    return false;
  }
  moveBy(dx, dy) {
    const { position, map } = this;
    let x = position[0] + dx;
    let y = position[1] + dy;
    if (!map.isPositionValid(x, y)) {
      return false;
    }
    let blocker = map.getBlocker(x, y);
    if (blocker) {
      add(`${blocker.name.article().capitalize()} blocks the way.`);
      return false;
    }
    let item = map.getItem(x, y);
    if (item) {
      add(`You carefully sidestep ${item.name.article()}.`);
    }
    this.position = [x, y];
    return true;
  }
  async tryItem(num) {
    let it = ITEMS.find((it2) => it2.key == num);
    if (!it) {
      return false;
    }
    let name = it.ctor.Name;
    let amount = this.getItem(it.id);
    if (!amount) {
      add(`You don't have any ${name}s.`);
      return false;
    }
    let direction = await waitForDirection(`Use ${name.article()}`);
    if (!direction) {
      return false;
    }
    const { map, position } = this;
    clear();
    this.setItem(it.id, amount - 1);
    let item = new it.ctor(map);
    return item.use(position, direction);
  }
  damage(source) {
    add(`${source.name.article().capitalize()} hits you!`);
    super.damage(source);
    update(this);
  }
  die(source) {
    super.die(source);
    add("You die...");
  }
};
async function waitForDirection(prefix) {
  add(`${prefix}: pick a direction, ESC to abort...`);
  while (true) {
    let key = await readKey();
    if (key.key == "Escape") {
      add("aborted.");
      return null;
    } else if (key.code in MOVEMENT) {
      return MOVEMENT[key.code];
    }
  }
}
var MOVEMENT = {
  "Numpad7": [-1, -1],
  "ArrowDown": [0, 1],
  "Numpad2": [0, 1],
  "Numpad9": [1, -1],
  "ArrowLeft": [-1, 0],
  "Numpad4": [-1, 0],
  "ArrowRight": [1, 0],
  "Numpad6": [1, 0],
  "ArrowUp": [0, -1],
  "Numpad8": [0, -1],
  "Numpad1": [-1, 1],
  "Numpad3": [1, 1]
};

// src/zombies.ts
var Zombies = class {
  constructor(map, player) {
    this.map = map;
    this.player = player;
  }
  zombies = [];
  rounds = 0;
  spawnPotential = 1;
  async play() {
    const { zombies, player } = this;
    this.rounds++;
    let activeZombies = zombies.filter((_) => Math.random() > ZOMBIE_MOVE_CHANCE);
    for (let i = 0; i < activeZombies.length; i++) {
      await activeZombies[i].play(player);
    }
    let spawnPotential = this.updateSpawnPotential();
    if (spawnPotential >= 1) {
      let amount = Math.floor(this.spawnPotential);
      this.spawnPotential -= amount;
      this.spawn(amount);
    }
  }
  remove(zombie) {
    this.player.money++;
    this.zombies = this.zombies.filter((z) => z != zombie);
  }
  spawn(amount) {
    const { zombies, map } = this;
    play("zombie-spawn");
    let corners = getCorners(map);
    for (let i = 0; i < amount; i++) {
      let corner = corners.random();
      let zombie = new Zombie(map, this);
      zombie.position = corner.slice();
      zombies.push(zombie);
      map.addBeing(zombie);
    }
  }
  updateSpawnPotential() {
    this.spawnPotential += Math.pow(this.rounds, 0.8) / 30;
    return this.spawnPotential;
  }
};
function getCorners(map) {
  const { width, height } = map;
  return [
    [0, 0],
    [width - 1, 0],
    [width - 1, height - 1],
    [0, height - 1]
  ];
}

// src/background.ts
var seed = -Math.random() * 100;
var Background = class {
  data = [];
  constructor(width, height) {
    const { data } = this;
    for (let x = 0; x < width; x++) {
      let col = [];
      data.push(col);
      for (let y = 0; y < height; y++) {
        let drawable = { position: [x, y], visual: { ch: ".", bg: bgColor(x, y), fg: "#222" } };
        col.push(drawable);
      }
    }
  }
  set(x, y, visual) {
    Object.assign(this.data[x][y].visual, visual);
  }
  at(x, y) {
    return this.data[x][y];
  }
};
function bgColor(x, y) {
  x += seed;
  y += seed;
  let h = Math.sin(x * y * 1e-3);
  h = 60 + h * 30;
  let s = Math.cos(x * y * 3e-3);
  s = 50 + s * 20;
  let l = 15;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// src/map.ts
var Map2 = class {
  constructor(width, height, renderer2) {
    this.width = width;
    this.height = height;
    this.renderer = renderer2;
    this.bg = new Background(width, height);
    window.addEventListener("metrics-change", () => this.onMetricsChange());
    this.onMetricsChange();
  }
  beings = [];
  items = [];
  bg;
  fx = new window.Map();
  oldPositions = new window.Map();
  onMetricsChange() {
    this.renderer.configure(tileCount, tileSize);
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.redraw([i, j]);
      }
    }
  }
  isPositionValid(x, y) {
    const { width, height } = this;
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }
    return true;
  }
  addBeing(being) {
    this.beings.push(being);
    this.redraw(being.position);
  }
  addItem(item) {
    this.items.push(item);
    this.redraw(item.position);
  }
  getBeing(x, y) {
    return this.beings.find((being) => being.position[0] == x && being.position[1] == y);
  }
  getItem(x, y) {
    return this.items.find((item) => item.position[0] == x && item.position[1] == y);
  }
  getBlocker(x, y) {
    let item = this.getItem(x, y);
    if (item && item.blocks) {
      return item;
    }
    return this.getBeing(x, y);
  }
  removeBeing(being) {
    this.beings = this.beings.filter((b) => b != being);
    this.renderer.remove(being);
    this.redraw(being.position);
  }
  removeItem(item) {
    this.items = this.items.filter((i) => i != item);
    this.renderer.remove(item);
    this.redraw(item.position);
  }
  setBackground(x, y, visual) {
    this.bg.set(x, y, visual);
    this.redraw([x, y]);
  }
  setFX(x, y, visual) {
    const { fx } = this;
    let key = `${x},${y}`;
    let existing = fx.get(key);
    if (visual) {
      if (existing) {
        existing.visual = visual;
      } else {
        fx.set(key, { position: [x, y], visual });
      }
    } else {
      fx.delete(key);
      existing && this.renderer.remove(existing);
    }
    this.redraw([x, y]);
  }
  changed(what) {
    const { oldPositions } = this;
    let op = oldPositions.get(what);
    if (op) {
      this.redraw(op);
    }
    oldPositions.set(what, what.position.slice());
    this.redraw(what.position);
  }
  redraw(position) {
    const [x, y] = position;
    let drawables = this.getDrawables(x, y);
    this.renderer.draw(x, y, drawables);
  }
  getDrawables(x, y) {
    const { bg, fx } = this;
    let drawables = [];
    drawables.push(bg.at(x, y));
    let item = this.getItem(x, y);
    item && drawables.push(item);
    let being = this.getBeing(x, y);
    being && drawables.push(being);
    let fxd = fx.get(`${x},${y}`);
    fxd && drawables.push(fxd);
    return drawables;
  }
};

// src/items/house.ts
var House = class extends Item {
  visual = { ch: "#", fg: "saddlebrown", bg: "black" };
  blocks = true;
  _hp = 3;
  constructor(map, x, y) {
    super(map);
    this._position = [x, y];
  }
};

// src/level.ts
var Level = class {
  constructor(config) {
    this.config = config;
    let map = new Map2(config.tileCount[0], config.tileCount[1], config.renderer);
    let player = new Player(map);
    player.position = [15, 15];
    map.addBeing(player);
    [
      new House(map, 10, 10),
      new House(map, 11, 10),
      new House(map, 12, 10),
      new House(map, 12, 11)
    ].forEach((h) => map.addItem(h));
    let zombies = new Zombies(map, player);
    this.map = map;
    this.player = player;
    this.zombies = zombies;
  }
  player;
  zombies;
  renderer;
  map;
  async play() {
    const { player, zombies } = this;
    while (!this.done) {
      await player.play();
      await zombies.play();
      await flush();
    }
  }
  get done() {
    return this.player.hp <= 0;
  }
};

// src/index.ts
await init([45, 30]);
init2();
var renderer = new Renderer2();
document.querySelector("main").prepend(renderer.node);
var { tileCount: tileCount2 } = metrics_exports;
var level = new Level({ renderer, tileCount: tileCount2 });
level.play();
