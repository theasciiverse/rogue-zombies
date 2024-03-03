// src/beings/being.ts
var Being = class {
  constructor(map) {
    this.map = map;
  }
  _position;
  visual = { ch: "?", fg: "lime" };
  get position() {
    return this._position;
  }
  set position(position) {
    const { map } = this;
    this._position = position;
    map.changed(this);
  }
  damage(source) {
    console.log("being", this, "damaged by", source);
  }
  toCorpse() {
    return { ch: "%", fg: this.visual.fg };
  }
};

// src/keyboard.ts
function matchFilter(event, filter) {
  if (!filter.length) {
    return true;
  }
  return filter.some((f) => {
    for (let p2 in f) {
      return event[p2] == f[p2];
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

// src/rules.ts
var ZOMBIE_MOVE_CHANCE = 0.5;
var PLAYER_HP = 3;

// src/items/db.ts
var ITEMS = [{
  id: "crowbar",
  key: "1",
  price: 0
}, {
  id: "mine",
  key: "2",
  price: 2
}];

// src/dialog.ts
var Dialog = class {
  dialog = document.createElement("dialog");
  resolve;
  keys = [];
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
async function help() {
  while (true) {
    let html = "Help!";
    let dialog = new Dialog();
    dialog.append(html);
    dialog.addKey({ id: "", key: "Escape" });
    dialog.addKey({ id: "one", key: "1" });
    let result = await dialog.show();
    console.log("dialog", result);
    if (result == "") {
      break;
    }
  }
}
async function buy(player) {
  while (true) {
    let dialog = new Dialog();
    dialog.addKey({ id: "", key: "Escape" });
    let table = buildItemTable(player, dialog);
    dialog.append("Buy", table);
    let result = await dialog.show();
    if (result == "") {
      break;
    } else {
      console.log("buy", result);
    }
  }
}
function buildItemTable(player, dialog) {
  let table = document.createElement("table");
  let rows = ITEMS.map((def) => buildItemRow(def, player, dialog));
  table.append(...rows);
  return table;
}
function buildItemRow(item, player, dialog) {
  let row = document.createElement("tr");
  let disabled = item.price > player.money;
  row.classList.toggle("disabled", disabled);
  let key = row.insertCell();
  key.textContent = item.key;
  row.insertCell().textContent = item.id;
  if (!disabled) {
    dialog.addKey({ id: item.id, code: `Numpad${item.key}` });
    dialog.addKey({ id: item.id, code: `Digit${item.key}` });
  }
  return row;
}

// src/beings/player.ts
var Player = class extends Being {
  constructor(map) {
    super(map);
    this.map = map;
  }
  visual = { ch: "@", fg: "red" };
  _hp = PLAYER_HP;
  _money = 1;
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
  getItem(type) {
  }
  setItem(type, amount) {
  }
  // fixme
  get money() {
    return this._money;
  }
  set money(money) {
    this._money = money;
  }
  async processKey(key) {
    if (key.code in MOVEMENT) {
      let diff = MOVEMENT[key.code];
      return this.moveBy(...diff);
    }
    if (key.code == "KeyB") {
      await buy(this);
      return false;
    }
    if (key.key == "?") {
      await help();
      return false;
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
    let being = map.getBeing(x, y);
    let item = map.getItem(x, y);
    if (being) {
      being.damage(this);
      return true;
    }
    if (being) {
      return false;
    }
    if (item && item.blocks) {
      return false;
    }
    this.position = [x, y];
    return true;
  }
  get hp() {
    return this._hp;
  }
  damage(source) {
    const { map, position } = this;
    this._hp -= 1;
    if (this.hp == 0) {
      map.removeBeing(this);
      let corpse = this.toCorpse();
      map.setBackground(position[0], position[1], corpse);
      console.log("Player killed by", source, "HP:", this.hp);
    } else {
      console.log("Player damaged by", source, "HP:", this.hp);
    }
  }
};
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

// src/beings/zombie.ts
var CHARS = ["z", "Z"];
var COLORS = ["DarkOliveGreen", "LightSlateGray", "Olive", "OliveDrab", "SaddleBrown", "GoldenRod", "DarkSeaGreen"];
var Zombie = class extends Being {
  constructor(map, zombies) {
    super(map);
    this.zombies = zombies;
  }
  visual = { ch: CHARS.random(), fg: COLORS.random() };
  play(player) {
    const { position } = this;
    let results = DIRS.map((dir) => {
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
      case "move":
        this.position = best.position;
        break;
      case "item":
        best.item.damage(this);
        break;
    }
  }
  damage(source) {
    this.zombies.kill(this, source);
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
      return { type: "move", dist, position: [x, y] };
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
var DIRS = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1]
];

// src/zombies.ts
var Zombies = class {
  constructor(map, player) {
    this.map = map;
    this.player = player;
  }
  zombies = [];
  rounds = 0;
  spawnPotential = 1;
  play() {
    const { zombies, player } = this;
    this.rounds++;
    let activeZombies = zombies.filter((_) => Math.random() > ZOMBIE_MOVE_CHANCE);
    activeZombies.forEach((z) => z.play(player));
    let spawnPotential = this.updateSpawnPotential();
    if (spawnPotential >= 1) {
      let amount = Math.floor(this.spawnPotential);
      this.spawnPotential -= amount;
      this.spawn(amount);
    }
  }
  kill(zombie, source) {
    const { map } = this;
    console.log("zombie", zombie, "killed by", source);
    this.zombies = this.zombies.filter((z) => z != zombie);
    map.removeBeing(zombie);
    let corpse = zombie.toCorpse();
    map.setBackground(zombie.position[0], zombie.position[1], corpse);
  }
  spawn(amount) {
    const { zombies, map } = this;
    console.log("spawning", amount);
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
  constructor(width, height, renderer) {
    this.width = width;
    this.height = height;
    this.renderer = renderer;
    this.bg = new Background(width, height);
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        this.redraw([i, j]);
      }
    }
  }
  beings = [];
  items = [];
  bg;
  oldPositions = new window.Map();
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
    const { bg } = this;
    let drawables = [];
    drawables.push(bg.at(x, y));
    let item = this.getItem(x, y);
    item && drawables.push(item);
    let being = this.getBeing(x, y);
    being && drawables.push(being);
    return drawables;
  }
};

// src/items/item.ts
var Item = class {
  constructor(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.position = [x, y];
  }
  position;
  visual = { ch: "?", fg: "white" };
  blocks = false;
  damage(source) {
    console.log("item", this, "damaged by", source);
  }
};

// src/items/house.ts
var House = class extends Item {
  visual = { ch: "#", fg: "saddlebrown", bg: "black" };
  blocks = true;
};

// src/level.ts
var Level = class {
  constructor(config) {
    this.config = config;
    let size = [40, 30];
    let renderer = config.Renderer.withAreaLimit(size, [window.innerWidth * 0.75, window.innerHeight * 0.75], [0.7, 1]);
    document.body.prepend(renderer.node);
    let map = new Map2(size[0], size[1], renderer);
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
    this.player = player;
    this.zombies = zombies;
    this.renderer = renderer;
    console.log("tileSize", this.tileSize);
  }
  player;
  zombies;
  renderer;
  async play() {
    const { player, zombies } = this;
    while (!this.done) {
      await player.play();
      await zombies.play();
    }
  }
  get done() {
    return this.player.hp <= 0;
  }
  get tileSize() {
    return this.renderer.tileSize;
  }
};

// src/renderer/renderer.ts
function computeTileSize(tileCount, area, aspectRatioRange) {
  let w2 = Math.floor(area[0] / tileCount[0]);
  let h = Math.floor(area[1] / tileCount[1]);
  let ar = w2 / h;
  if (ar < aspectRatioRange[0]) {
    h = Math.floor(w2 / aspectRatioRange[0]);
  } else if (ar > aspectRatioRange[1]) {
    w2 = Math.floor(h * aspectRatioRange[1]);
  }
  return [w2, h];
}
var Renderer = class {
  constructor(tileCount, tileSize2) {
    this.tileCount = tileCount;
    this.tileSize = tileSize2;
  }
  node;
  static withTileSize(tileCount, tileSize2) {
    return new this(tileCount, tileSize2);
  }
  static withAreaLimit(tileCount, area, aspectRatioRange) {
    let tileSize2 = computeTileSize(tileCount, area, aspectRatioRange);
    return this.withTileSize(tileCount, tileSize2);
  }
  draw(x, y, drawables) {
  }
  remove(drawable) {
  }
};

// src/renderer/canvas.ts
var DPR = devicePixelRatio > 1 ? 2 : 1;
var Canvas = class extends Renderer {
  node = document.createElement("canvas");
  ctx = this.node.getContext("2d");
  constructor(tileCount, tileSize2) {
    super(tileCount, tileSize2);
    const width = tileCount[0] * tileSize2[0];
    const height = tileCount[1] * tileSize2[1];
    const { node, ctx } = this;
    node.width = width * DPR;
    node.height = height * DPR;
    node.style.width = `${width}px`;
    node.style.height = `${height}px`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${tileSize2[1]}px input`;
    ctx.scale(DPR, DPR);
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
  constructor(tileCount, tileSize2) {
    super(tileCount, tileSize2);
    const { node } = this;
    node.className = "renderer";
    node.style.setProperty("--tile-width", `${tileSize2[0]}px`);
    node.style.setProperty("--tile-height", `${tileSize2[1]}px`);
    node.style.width = `${tileCount[0] * tileSize2[0]}px`;
    node.style.height = `${tileCount[1] * tileSize2[1]}px`;
  }
  draw(x, y, drawables) {
    const { node, nodes } = this;
    drawables.forEach((d, i) => {
      let dnode = nodes.get(d);
      if (!dnode) {
        dnode = document.createElement("div");
        node.append(dnode);
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
var Combo = class _Combo extends Renderer {
  node = document.createElement("div");
  renderers;
  static withAreaLimit(tileCount, area, aspectRatioRange) {
    let halfArea = [area[0] / 2, area[1]];
    let tileSize2 = computeTileSize(tileCount, halfArea, aspectRatioRange);
    return new _Combo(tileCount, tileSize2);
  }
  constructor(tileCount, tileSize2) {
    super(tileCount, tileSize2);
    const { node } = this;
    node.className = "combo";
    let renderers = [Canvas, DOM].map((r) => new r(tileCount, tileSize2));
    node.append(...renderers.map((r) => r.node));
    this.renderers = renderers;
  }
  draw(x, y, drawables) {
    this.renderers.forEach((r) => r.draw(x, y, drawables));
  }
  remove(drawable) {
    this.renderers.forEach((r) => r.remove(drawable));
  }
};

// src/random.ts
Array.prototype.random = function() {
  const { length } = this;
  if (!length) {
    return null;
  }
  return this[Math.floor(Math.random() * length)];
};

// src/index.ts
document.fonts.forEach((f) => f.load());
await document.fonts.ready;
var level = new Level({ Renderer: Combo });
var { tileSize } = level;
var p = document.querySelector("p");
p.style.fontSize = `${tileSize[1]}px`;
p.style.lineHeight = "1";
var span = document.createElement("span");
span.textContent = "P";
p.append(span);
var w = span.getBoundingClientRect().width;
var ls = tileSize[0] - w;
p.style.letterSpacing = `${ls}px`;
p.style.marginLeft = `${ls / 2}px`;
level.play();
