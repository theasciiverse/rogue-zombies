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

// src/beings/player.ts
var Player = class extends Being {
  constructor(map) {
    super(map);
    this.map = map;
  }
  visual = { ch: "@", fg: "red" };
  async play() {
    while (true) {
      let key = await readKey();
      console.log(key);
      let acted = this.processKey(key);
      if (acted) {
        break;
      }
    }
  }
  processKey(key) {
    if (key.code in MOVEMENT) {
      let diff = MOVEMENT[key.code];
      return this.moveBy(...diff);
    }
    return false;
  }
  moveBy(dx, dy) {
    const { position, map } = this;
    let x = position[0] + dx;
    let y = position[1] + dy;
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
      return false;
    }
    let being = map.getBeing(x, y);
    let item = map.getItem(x, y);
    if (being) {
      return false;
    }
    if (item && item.blocks) {
      return false;
    }
    this.position = [x, y];
    return true;
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
  visual = { ch: CHARS.random(), fg: COLORS.random() };
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
  play() {
    this.rounds++;
    let spawnPotential = this.updateSpawnPotential();
    if (spawnPotential >= 1) {
      let amount = Math.floor(this.spawnPotential);
      this.spawnPotential -= amount;
      this.spawn(amount);
    }
  }
  spawn(amount) {
    const { zombies, map } = this;
    console.log("spawning", amount);
    let corners = getCorners(map);
    for (let i = 0; i < amount; i++) {
      let corner = corners.random();
      let zombie = new Zombie(map);
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

// src/map.ts
var Map2 = class {
  constructor(width, height, renderer) {
    this.width = width;
    this.height = height;
    this.renderer = renderer;
    this.bg = createBackground(width, height);
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        this.redraw(i, j);
      }
    }
  }
  beings = [];
  items = [];
  bg = [];
  oldPositions = new window.Map();
  addBeing(being) {
    this.beings.push(being);
    this.redraw(being.position[0], being.position[1]);
  }
  addItem(item) {
    this.items.push(item);
    this.redraw(item.position[0], item.position[1]);
  }
  getBeing(x, y) {
    return this.beings.find((being) => being.position[0] == x && being.position[1] == y);
  }
  getItem(x, y) {
    return this.items.find((item) => item.position[0] == x && item.position[1] == y);
  }
  changed(what) {
    const { oldPositions } = this;
    let op = oldPositions.get(what);
    if (op) {
      this.redraw(op[0], op[1]);
    }
    oldPositions.set(what, what.position.slice());
    this.redraw(what.position[0], what.position[1]);
  }
  redraw(x, y) {
    let drawables = this.getDrawables(x, y);
    this.renderer.draw(x, y, drawables);
  }
  getDrawables(x, y) {
    const { bg } = this;
    let drawables = [];
    drawables.push(bg[x][y]);
    let item = this.getItem(x, y);
    item && drawables.push(item);
    let being = this.getBeing(x, y);
    being && drawables.push(being);
    return drawables;
  }
};
function createBackground(width, height) {
  let bg = [];
  for (let x = 0; x < width; x++) {
    let col = [];
    bg.push(col);
    for (let y = 0; y < height; y++) {
      let drawable = { position: [x, y], visual: { ch: ".", bg: "black", fg: "gray" } };
      col.push(drawable);
    }
  }
  return bg;
}

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
};

// src/items/house.ts
var House = class extends Item {
  visual = { ch: "#", fg: "saddlebrown", bg: "black" };
  get blocks() {
    return true;
  }
};

// src/level.ts
var Level = class {
  constructor(config) {
    this.config = config;
    let size = [20, 20];
    let renderer = config.Renderer.withAreaLimit(size, [window.innerWidth / 2, window.innerHeight / 2], [0.7, 1]);
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
    console.log(this.tileSize);
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
    return false;
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
};

// src/renderer/combo.ts
var Combo = class extends Renderer {
  node = document.createElement("div");
  renderers;
  constructor(tileCount, tileSize2) {
    super(tileCount, tileSize2);
    const { node } = this;
    node.className = "combo";
    let renderers = [Canvas, DOM].map((r) => new r(tileCount, tileSize2));
    node.append(...renderers.map((r) => r.node));
    this.renderers = renderers;
  }
  draw(x, y, drawables) {
    const { renderers } = this;
    renderers.forEach((r) => r.draw(x, y, drawables));
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
