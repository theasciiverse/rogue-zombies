import Combo from "./renderer/combo.js";
import Canvas from "./renderer/canvas.js";
import DOM from "./renderer/dom.js";


export let tileCount: number[];
export let tileSize: number[];
export let charWidth: number;
export let Renderer = Combo;

export async function init(tc: number[]) {
	const { style } = document.documentElement;
	tileCount = tc;

	document.fonts.forEach(f => f.load());
	await document.fonts.ready;

	tileSize = Renderer.computeTileSize(tileCount, [window.innerWidth*.9, window.innerHeight*.9], [0.7, 1.0]);

	style.setProperty("--tile-width", `${tileSize[0]}px`);
	style.setProperty("--tile-height", `${tileSize[1]}px`);
	style.setProperty("--map-width", String(tileCount[0]));

	charWidth = measureCharWidth();
	style.setProperty("--char-width", `${charWidth}px`);
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
