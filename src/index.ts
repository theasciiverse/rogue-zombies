import Level from "./level.js";
import Combo from "./renderer/combo.js";
import Canvas from "./renderer/canvas.js";
import DOM from "./renderer/dom.js";
import "./random.js";
import * as status from "./status.js";
import * as log from "./log.js";


document.fonts.forEach(f => f.load());
await document.fonts.ready;

let level = new Level({Renderer: Combo});

function measureCharWidth(tileSize: number[]) {
	let span = document.createElement("span");
	span.style.fontSize = `${tileSize[1]}px`;
	span.textContent = "P";
	document.body.append(span);

	let rect = span.getBoundingClientRect();
	span.remove();
	return rect.width;
}


let chw = measureCharWidth(level.tileSize);

status.init(level, chw);
log.init(level, chw);

level.play();
