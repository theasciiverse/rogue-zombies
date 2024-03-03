import Level from "./level.js";
import Combo from "./renderer/combo.js";
import Canvas from "./renderer/canvas.js";
import DOM from "./renderer/dom.js";
import "./random.js";


document.fonts.forEach(f => f.load());
await document.fonts.ready;

let level = new Level({Renderer: Combo});
const { tileSize } = level;


let p = document.querySelector("p")!;
p.style.fontSize = `${tileSize[1]}px`;
p.style.lineHeight = "1";
let span = document.createElement("span");
span.textContent = "P";
p.append(span);
let w = span.getBoundingClientRect().width;
//span.remove();

let ls = tileSize[0]-w;
p.style.letterSpacing = `${ls}px`;
p.style.marginLeft = `${ls/2}px`;


level.play();
