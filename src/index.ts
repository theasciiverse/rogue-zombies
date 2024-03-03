import Level from "./level.js";
import Combo from "./renderer/combo.js";
import Canvas from "./renderer/canvas.js";
import DOM from "./renderer/dom.js";
import "./random.js";
import * as status from "./status.js";


document.fonts.forEach(f => f.load());
await document.fonts.ready;

let level = new Level({Renderer: Combo});

status.init(level.tileSize);

level.play();
