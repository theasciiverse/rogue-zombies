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
Array.prototype.distance = function(other) {
  let dx = Math.abs(this[0] - other[0]);
  let dy = Math.abs(this[1] - other[1]);
  return Math.max(dx, dy);
};

// src/metrics.ts
var tileCount;
var tileSize;
var charWidth;
var { style } = document.documentElement;
var RCtor;
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
  tileSize = RCtor.computeTileSize(realTileCount, [window.innerWidth, window.innerHeight], [0.7, 1]);
  style.setProperty("--tile-width", `${tileSize[0]}px`);
  style.setProperty("--tile-height", `${tileSize[1]}px`);
  charWidth = measureCharWidth();
  style.setProperty("--char-width", `${charWidth}px`);
}
async function init(tc, R) {
  tileCount = tc;
  RCtor = R;
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

// src/sfx.ts
var DB = {
  "zombie-spawn": 8,
  "rake": 3,
  "crowbar": 3,
  "swoosh": 1,
  "barricade": 3,
  "wire": 3,
  "fence": 2,
  "bazooka": 1,
  "mine": 1,
  "game-over": 1,
  "ping": 1
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
      if (item instanceof Corpse) {
        map.removeItem(item);
        return true;
      } else {
        add(`Cannot use ${this.name}: ${item.name.article()} is lying there!`);
        return false;
      }
    }
    return true;
  }
};

// src/items/corpse.ts
var Corpse = class extends Item {
  visual = { ch: "%", fg: "" };
  _name;
  constructor(map, being) {
    super(map);
    this.visual.fg = being.visual.fg;
    this._position = being.position;
    this._name = `${being.name} corpse`;
  }
  get name() {
    return this._name;
  }
};

// src/beings/being.ts
var Being = class extends Entity {
  die(source) {
    const { map } = this;
    map.removeBeing(this);
    let existing = map.getItem(this.position[0], this.position[1]);
    if (!existing) {
      let corpse = new Corpse(map, this);
      map.addItem(corpse);
    }
  }
};

// src/items/trap.ts
var Trap = class extends Item {
  static Name = "Bear trap";
  static description = "Kills several zombies dumb enough to step on it.";
  visual = { ch: "0", fg: "#999" };
  _hp = 3;
  use(position, direction) {
    let ok = super.use(position, direction);
    if (!ok) {
      return false;
    }
    let tx = position[0] + direction[0];
    let ty = position[1] + direction[1];
    this._position = [tx, ty];
    this.map.addItem(this);
    add("You set up a bear trap.");
    return true;
  }
  activate(being) {
    play("rake");
    this.damage(being);
    being.damage(this);
  }
};

// src/items/barricade.ts
var COLORS = ["", "#300", "#850", "#c90"];
var Barricade = class extends Item {
  static Name = "Wooden barricade";
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
  visual = { ch: "T", fg: "#999" };
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
    if (Math.random() < 0.01) {
      this._name = "zombie lutefisk";
    } else {
      this._name = this.visual.ch == "z" ? "zombie" : "large zombie";
    }
  }
  visual = { ch: CHARS.random(), fg: COLORS2.random() };
  _name;
  get name() {
    return this._name;
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
    let currentDistance = player.position.distance(position);
    let dist = player.position.distance([x, y]);
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
  extractZombies(positions, map).forEach((z) => z.damage(source));
  positions.forEach((pos) => {
    let item = map.getItem(pos[0], pos[1]);
    if (item instanceof Corpse) {
      map.removeItem(item);
    }
  });
  let duration = 400;
  let step = 30;
  for (let i = 0; i < duration; i += step) {
    drawExplosions(map, positions, i / duration);
    await sleep(step);
  }
  positions.forEach((pos) => map.setFX(pos[0], pos[1], null));
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
    play("mine");
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
    play("swoosh");
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
        play("bazooka");
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
  sound = "wire";
  activate(being) {
    play(this.sound);
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
    add(`You build ${this.name.article()} segment.`);
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
      if (item instanceof Corpse) {
        continue;
      }
      if (item instanceof Ctor) {
        amount = i - 1;
      }
      break;
    }
  }
  for (let i = 1; i <= amount; i++) {
    let x = position[0] + i * direction[0];
    let y = position[1] + i * direction[1];
    let corpse = map.getItem(x, y);
    corpse && map.removeItem(corpse);
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
  sound = "fence";
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
  id: "barricade",
  short: "Barricade",
  key: "1",
  price: 1,
  amount: 5,
  ctor: Barricade
}, {
  id: "rake",
  key: "2",
  price: 1,
  amount: 3,
  ctor: Rake
}, {
  id: "trap",
  short: "Trap",
  key: "3",
  price: 2,
  amount: 2,
  ctor: Trap
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
    document.activeElement && document.activeElement.blur();
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

// src/dialogs/start.ts
async function start() {
  let dialog = new Dialog("Start the zombie invasion?");
  dialog.addKey({ id: "", key: "Escape" });
  dialog.addKey({ id: "ok", code: "Space" });
  let info = document.createElement("p");
  info.innerHTML = HTML;
  dialog.append(info);
  let result = await dialog.show();
  return result == "ok";
}
var HTML = `
If you want to start the zombie invasion, press <kbd>space</kbd>.
Zombies will slowly start spawning and wandering around. (Item shop is still available in non-snadbox game modes).
<br/><br/>
Press <kbd>esc</kbd> to return back to preparations.
`;

// src/beings/player.ts
var MAX_HP = 3;
var Player = class extends Being {
  constructor(level) {
    super(level.map);
    this.level = level;
    this._money = level.initialMoney;
  }
  visual = { ch: "@", fg: "red" };
  _hp = MAX_HP;
  _money;
  items = new window.Map();
  get hp() {
    return this._hp;
  }
  async play() {
    while (true) {
      let key = await readKey();
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
    this.level.updateStatus();
  }
  get money() {
    return this._money;
  }
  set money(money) {
    this._money = money;
    this.level.updateStatus();
  }
  async processKey(key) {
    const { level } = this;
    clear();
    if (isIdle(key)) {
      return true;
    }
    if (key.code in MOVEMENT) {
      let diff = MOVEMENT[key.code];
      return this.moveBy(...diff);
    }
    if (key.code.startsWith("Digit")) {
      let num = key.code.match(/\d/);
      return num ? this.tryItem(num[0]) : false;
    }
    if (key.key == "i" && level.isAllowed("shop")) {
      await level.shop();
      return false;
    }
    if (key.key == "s" && level.isAllowed("start")) {
      let result = await start();
      if (result) {
        level.start();
        return true;
      } else {
        return false;
      }
    }
    if (key.key == "?") {
      await level.help();
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
    if (being) {
      play("crowbar");
      add(`You hit the ${being.name}.`);
      being.damage(this);
      return true;
    }
    let item = map.getItem(x, y);
    if (item) {
      if (item.blocks) {
        add(`${item.name.article().capitalize()} blocks the way.`);
        return false;
      } else {
        add(`You carefully sidestep ${item.name.article()}.`);
      }
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
    this.level.updateStatus();
  }
  die(source) {
    super.die(source);
    play("game-over");
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
function isIdle(key) {
  return key.code == "Numpad5" || key.code == "Space" || key.key == ".";
}
var MOVEMENT = {
  "Numpad7": [-1, -1],
  "KeyY": [-1, -1],
  "ArrowUp": [0, -1],
  "Numpad8": [0, -1],
  "KeyK": [0, -1],
  "Numpad9": [1, -1],
  "KeyU": [1, -1],
  "ArrowLeft": [-1, 0],
  "Numpad4": [-1, 0],
  "KeyH": [-1, 0],
  "ArrowRight": [1, 0],
  "Numpad6": [1, 0],
  "KeyL": [1, 0],
  "Numpad1": [-1, 1],
  "KeyB": [-1, 1],
  "ArrowDown": [0, 1],
  "Numpad2": [0, 1],
  "KeyJ": [0, 1],
  "Numpad3": [1, 1],
  "KeyN": [1, 1]
};

// src/status.ts
var node2 = document.querySelector("#status");
var previousValues = {};
var DOM_ITEMS = {};
var DOM_MISC = {};
function init3() {
  ITEMS.forEach((it) => DOM_ITEMS[it.id] = buildItem(it));
  DOM_MISC["hp"] = buildHP();
  DOM_MISC["money"] = buildMoney();
  DOM_MISC["start"] = buildStart();
  DOM_MISC["score"] = buildScore();
  DOM_MISC["shop"] = buildShop();
  DOM_MISC["help"] = buildHelp();
  let nodes = [
    ...Object.values(DOM_ITEMS),
    "\n",
    DOM_MISC["hp"],
    DOM_MISC["money"],
    DOM_MISC["start"],
    DOM_MISC["score"],
    DOM_MISC["shop"],
    DOM_MISC["help"]
  ];
  node2.replaceChildren(...nodes);
}
function update(level) {
  const { player } = level;
  ITEMS.forEach((it) => {
    let node3 = DOM_ITEMS[it.id];
    let count = player.getItem(it.id);
    node3.classList.toggle("disabled", count == 0);
    node3.querySelector(".count").textContent = count == Infinity ? "\u221E" : String(count);
  });
  updateHP(level);
  updateMoney(level);
  updateStart(level);
  updateScore(level);
  updateShop(level);
}
function buildHP() {
  let node3 = document.createElement("span");
  node3.innerHTML = `Health: <span class="hp"></span>`;
  return node3;
}
function updateHP(level) {
  let current = level.player.hp;
  let max = MAX_HP;
  let str = "";
  for (let i = 0; i < max; i++) {
    str += i < current ? "\u2665" : "\u2661";
  }
  let node3 = DOM_MISC["hp"].querySelector(".hp");
  node3.textContent = str;
  animateIfChanged(node3, current);
}
function buildMoney() {
  let node3 = document.createElement("span");
  node3.innerHTML = `  Money: <span class="money"></span>`;
  return node3;
}
function updateMoney(level) {
  let node3 = DOM_MISC["money"];
  node3.hidden = !level.isAllowed("shop");
  let span = node3.querySelector(".money");
  let money = level.player.money;
  span.textContent = String(money);
  animateIfChanged(span, money);
}
function buildScore() {
  let node3 = document.createElement("span");
  node3.innerHTML = `  Score: <span class="score"></span>`;
  return node3;
}
function updateScore(level) {
  let node3 = DOM_MISC["score"];
  node3.hidden = !level.isAllowed("score");
  let span = node3.querySelector(".score");
  let score = level.score;
  span.textContent = String(score);
  animateIfChanged(span, score);
}
function buildStart() {
  let node3 = document.createElement("span");
  node3.append("  ", buildKey("S", "tart the invasion"));
  return node3;
}
function updateStart(level) {
  DOM_MISC["start"].hidden = !level.isAllowed("start");
}
function buildShop() {
  let node3 = document.createElement("span");
  node3.append("  ", buildKey("I", "tems"));
  return node3;
}
function updateShop(level) {
  DOM_MISC["shop"].hidden = !level.isAllowed("shop");
}
function buildHelp() {
  let node3 = document.createElement("span");
  node3.append("  ", buildKey("?", "Help"));
  return node3;
}
function buildKey(key, text) {
  let node3 = document.createElement("span");
  let kbd = document.createElement("kbd");
  kbd.textContent = key;
  node3.append(kbd, text);
  return node3;
}
function buildItem(it) {
  let node3 = document.createElement("span");
  let kbd = document.createElement("kbd");
  kbd.textContent = it.key;
  let c = document.createElement("span");
  c.className = "count";
  node3.append(kbd, it.short || it.ctor.Name, c, "  ");
  return node3;
}
function animateIfChanged(node3, value) {
  if (node3.className in previousValues) {
    let previous = previousValues[node3.className];
    if (previous != value) {
      previousValues[node3.className] = value;
      node3.animate(keyframes, timing);
    }
  } else {
    previousValues[node3.className] = value;
  }
}
var keyframes = {
  transform: ["scale(1)", "scale(1.6)", "scale(1)"],
  offset: [0, 0.1, 1]
};
var timing = {
  duration: 600,
  iterations: 1
};

// src/renderer/renderer.ts
var Renderer = class {
  node;
  static computeTileSize(tileCount2, area, aspectRatioRange) {
    let w = Math.floor(area[0] / tileCount2[0]);
    let h = Math.floor(area[1] / tileCount2[1]);
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
  configure(tileCount2, tileSize2) {
    const { node: node3, ctx } = this;
    node3.width = tileCount2[0] * tileSize2[0] * DPR;
    node3.height = tileCount2[1] * tileSize2[1] * DPR;
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
  static computeTileSize(tileCount2, area, aspectRatioRange) {
    let halfArea = [area[0] / 2, area[1]];
    let fakeTileCount = [tileCount2[0] * 2 + 1, tileCount2[1]];
    return super.computeTileSize(fakeTileCount, area, aspectRatioRange);
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
  configure(tileCount2, tileSize2) {
    this.renderers.forEach((r) => r.configure(tileCount2, tileSize2));
  }
};

// src/zombies.ts
var Zombies = class {
  constructor(level) {
    this.level = level;
  }
  zombies = [];
  rounds = 0;
  spawnPotential = 1;
  async play() {
    const { zombies, level } = this;
    let activeZombies = zombies.filter((_) => Math.random() > level.zombieMoveChance);
    for (let i = 0; i < activeZombies.length; i++) {
      await activeZombies[i].play(level.player);
    }
    if (level.isAllowed("spawn")) {
      this.rounds++;
      let spawnPotential = this.updateSpawnPotential();
      if (spawnPotential >= 1) {
        let amount = Math.floor(this.spawnPotential);
        this.spawnPotential -= amount;
        this.spawn(amount);
      }
    }
  }
  remove(zombie) {
    this.level.increaseScore();
    this.zombies = this.zombies.filter((z) => z != zombie);
  }
  spawnAt(x, y) {
    const { level, zombies } = this;
    const { map } = level;
    let zombie = new Zombie(map, this);
    zombie.position = [x, y];
    zombies.push(zombie);
    map.addBeing(zombie);
  }
  spawn(amount) {
    const { map } = this.level;
    play("zombie-spawn");
    let corners = map.getCorners();
    for (let i = 0; i < amount; i++) {
      let corner = corners.random();
      this.spawnAt(corner[0], corner[1]);
    }
  }
  updateSpawnPotential() {
    this.spawnPotential += Math.pow(this.rounds, 0.8) / 30;
    return this.spawnPotential;
  }
};

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
  getCorners() {
    const { width, height } = this;
    return [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1]
    ];
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

// src/dialogs/gameover.ts
async function gameOver(level) {
  let dialog = new Dialog("Game over!");
  let p1 = document.createElement("p");
  p1.textContent = level.player.hp > 0 ? ALIVE : DEAD;
  let p2 = document.createElement("p");
  let Ctor = level.constructor;
  p2.innerHTML = `Your score (${Ctor.Name}): survived for <strong>${level.rounds}</strong> rounds, killed <span class="score">${level.score}</span> zombies.`;
  let p3 = document.createElement("p");
  p3.innerHTML = `Press <kbd>space</kbd> to return to the main menu.`;
  dialog.append(p1, p2, p3);
  dialog.addKey({ id: "", code: "Space" });
  await dialog.show();
}
var ALIVE = `The game is over!`;
var DEAD = `${ALIVE} The zombies have eaten your brains.`;

// src/dialogs/help.ts
async function help() {
  let dialog = new Dialog("Help!");
  dialog.addKey({ id: "", key: "Escape" });
  dialog.addKey({ id: "one", key: "1" });
  let result = await dialog.show();
}

// src/dialogs/shop.ts
async function shop(player, options) {
  while (true) {
    let dialog = new Dialog("Item shop");
    let p = document.createElement("p");
    p.innerHTML = `You can buy anti-zombie stuff here. No refunds, no returns.<br/>You have <span class="money">${player.money}</span> right now.</p>`;
    dialog.append(p);
    let table = buildItemTable(player, dialog, options);
    dialog.append(table);
    let canBuySomething = ITEMS.some((it) => it.price <= player.money);
    let info = document.createElement("p");
    info.innerHTML = `${canBuySomething ? "Earn more money by killing zombies." : "You have no money! Earn some by killing zombies."} Press <kbd>esc</kbd> to exit.`;
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
function buildItemTable(player, dialog, options) {
  let table = document.createElement("table");
  table.innerHTML = TABLE;
  let rows = ITEMS.map((def) => buildItemRow(def, player, dialog, options));
  table.tBodies[0].append(...rows);
  return table;
}
function buildItemRow(item, player, dialog, options) {
  let row = document.createElement("tr");
  let disabled = item.price > player.money;
  if (options && options.only != item.id) {
    disabled = true;
  }
  if (!item.price) {
    disabled = true;
  }
  row.classList.toggle("disabled", disabled);
  let kbd = document.createElement("kbd");
  kbd.textContent = item.key;
  row.insertCell().append(kbd);
  row.insertCell().textContent = item.ctor.Name;
  let price = document.createElement("span");
  price.className = "money";
  price.textContent = String(item.price);
  let count = document.createElement("span");
  count.className = "count";
  count.textContent = String(item.amount);
  row.insertCell().append(count, " for ", price);
  row.insertCell().textContent = item.ctor.description;
  let have = player.getItem(item.id);
  row.insertCell().textContent = have == Infinity ? "\u221E" : String(have);
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
		<th>Have</th>
	</tr>
</thead>
<tbody></tbody>
`;

// src/levels/level.ts
var ZOMBIE_MOVE_CHANCE = 0.5;
var Level = class {
  static Name = "???";
  static description = "???";
  player;
  // chteji znat zombies a status
  map;
  // chce znat player a zombies
  zombies;
  _started = false;
  _score = 0;
  _rounds = 0;
  constructor(renderer) {
    let map = new Map2(tileCount[0], tileCount[1], renderer);
    this.map = map;
    let zombies = new Zombies(this);
    this.zombies = zombies;
    let player = new Player(this);
    this.player = player;
    this.updateStatus();
  }
  get zombieMoveChance() {
    return ZOMBIE_MOVE_CHANCE;
  }
  isAllowed(feature) {
    switch (feature) {
      case "shop":
        return true;
      case "start":
        return !this._started;
      case "score":
        return this._started;
      case "spawn":
        return this._started;
    }
  }
  get initialMoney() {
    return 0;
  }
  get rounds() {
    return this._rounds;
  }
  // chce znat status
  get score() {
    return this._score;
  }
  // chce znat gameOver a status
  get done() {
    return this.player.hp <= 0;
  }
  shop() {
    return shop(this.player);
  }
  help() {
    return help();
  }
  increaseScore() {
    this._score++;
    this.player.money++;
  }
  start() {
    this._started = true;
    this.updateStatus();
  }
  updateStatus() {
    update(this);
  }
  async play() {
    while (!this.done) {
      await this.playRound();
    }
    await gameOver(this);
  }
  async playRound() {
    const { player, zombies } = this;
    this._rounds++;
    this.updateStatus();
    await player.play();
    await zombies.play();
    await flush();
  }
};

// src/dialogs/tutorial-1.ts
async function tutorial1() {
  let dialog = new Dialog("Tutorial #1");
  let node3 = document.createElement("div");
  node3.innerHTML = HTML2;
  dialog.append(node3);
  dialog.addKey({ id: "", code: "Escape" });
  await dialog.show();
}
var HTML2 = `
<p>Welcome to the Rogue Zombies tutorial! You can move around using arrows (\u2190\u2193\u2191\u2192), numpad or vi-keys (hjkl/yubn). It is possible and recommended to move diagonally as well.</p>
<p>There is a lone zombie nearby. You can kill it by <em>bumping</em> into it, i.e. by trying to move to the zombie's place. Do that right now!</p>
<p>Press <kbd>esc</kbd> to continue.</p>
`;

// src/dialogs/tutorial-2.ts
async function tutorial2() {
  let dialog = new Dialog("Tutorial #2");
  let node3 = document.createElement("div");
  node3.innerHTML = HTML3;
  dialog.append(node3);
  dialog.addKey({ id: "", code: "Escape" });
  await dialog.show();
}
var HTML3 = `
<p>Good job! No more zombies in sight. Also, by killing the zombie, you earned your first money.</p>
<p>Of course, fighting zombies by <em>bumping</em> into them would not work for long.
The best way to combat these undead folks is by using <strong>items</strong>.
When in the game, you can always open the item shop with the <kbd>I</kbd> key.</p>
<p>It would be wise to try that out now. Press <kbd>esc</kbd> to continue and use the earned money to buy <strong>a rake</strong>.</p>
`;

// src/dialogs/tutorial-3.ts
async function tutorial3() {
  let dialog = new Dialog("Tutorial #3");
  let node3 = document.createElement("div");
  node3.innerHTML = HTML4;
  dialog.append(node3);
  dialog.addKey({ id: "", code: "Escape" });
  await dialog.show();
}
var HTML4 = `
<p>Your inventory is displayed below the map. Available items can be used by pressing the corresponding number key.</p>
<p>As you can see, another zombie has spawned. This might be a good time to use those rakes you just bought.</p>
<p>A rake is your basic trap item: you place it on the ground and wait for a zombie to step on it.
When that happens, both the zombie and the rake gets destroyed.</p>
<p>Press <kbd>esc</kbd> to continue and get rid of the zombie.</p>
`;

// src/dialogs/tutorial-4.ts
async function tutorial4() {
  let dialog = new Dialog("Tutorial #4");
  let node3 = document.createElement("div");
  node3.innerHTML = HTML5;
  dialog.append(node3);
  dialog.addKey({ id: "", code: "Escape" });
  await dialog.show();
}
var HTML5 = `
<p>The tutorial is almost over. You can move around and kill zombies with stuff - like a boss.
The Sandbox game mode is a good way to familiarize yourself with other items that can be bought.</p>
<p>In a typical game, you start in preparation phase in order to buy items and organize your defenses.
The real heat is then started by pressing the <kbd>S</kbd> key. This is where the action begins.</p>
<p>In this tutorial, only four more zombies will spawn once you do that. Press <kbd>esc</kbd> and start the invasion when ready.</p>
`;

// src/levels/tutorial.ts
var Tutorial = class extends Level {
  static Name = "Tutorial";
  static description = "Learn controls and concepts. Improve your de-zombification skills. Every game needs a tutorial.";
  phase = "movement";
  constructor(renderer) {
    super(renderer);
    const { map, player } = this;
    player.position = [5, map.height - 5];
    map.addBeing(player);
  }
  isAllowed(feature) {
    if (feature == "spawn") {
      return false;
    }
    if (feature == "start") {
      if (this.phase != "starting") {
        return false;
      }
    }
    return super.isAllowed(feature);
  }
  get done() {
    return this.player.hp <= 0 || this.score == 6;
  }
  async play() {
    await this.changePhase("movement");
    return super.play();
  }
  start() {
    const { map, zombies } = this;
    map.getCorners().forEach((pos) => {
      pos = getFreePosition(map, pos);
      zombies.spawnAt(pos[0], pos[1]);
    });
    super.start();
  }
  help() {
    switch (this.phase) {
      case "movement":
        return tutorial1();
      case "buying":
        return tutorial2();
      case "using":
        return tutorial3();
      case "starting":
        return tutorial4();
    }
  }
  async shop() {
    const { player } = this;
    await shop(player, { only: "rake" });
    if (player.getItem("rake") > 0 && this.phase == "buying") {
      await this.changePhase("using");
    }
  }
  async playRound() {
    if (this.score == 1 && this.phase == "movement") {
      await this.changePhase("buying");
    }
    if (this.score == 2 && this.phase == "using") {
      await this.changePhase("starting");
    }
    return super.playRound();
  }
  async changePhase(phase) {
    const { player, zombies, map } = this;
    this.phase = phase;
    await sleep3(1e3);
    switch (phase) {
      case "movement":
        zombies.spawnAt(map.width - 10, 10);
        break;
      case "using":
        let pos = getDistantCorner(map, player);
        zombies.spawnAt(pos[0], pos[1]);
        break;
    }
    play("ping");
    await this.help();
  }
};
function sleep3(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getDistantCorner(map, player) {
  let corners = map.getCorners();
  let ppos = player.position;
  corners.sort((a, b) => ppos.distance(b) - ppos.distance(a));
  return corners[0];
}
function getFreePosition(map, position) {
  let [x, y] = position;
  while (true) {
    let being = map.getBeing(x, y);
    if (!being) {
      return [x, y];
    }
    x += 2 * (x < map.width / 2 ? 1 : -1);
    y += 2 * (y < map.height / 2 ? 1 : -1);
  }
}

// src/index.ts
async function run() {
  let RCtor2 = Combo;
  await init([43, 30], RCtor2);
  init2();
  init3();
  let renderer = new RCtor2();
  document.querySelector("main").prepend(renderer.node);
  while (true) {
    await new Tutorial(renderer).play();
  }
}
run();
