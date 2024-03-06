import Renderer from "./renderer/renderer.js";


export let tileCount: number[];
export let tileSize: number[];
export let charWidth: number;
const { style } = document.documentElement;


let RCtor: typeof Renderer;
let resizeTimeout: ReturnType<typeof setTimeout>;


function onResized() {
	measure();
	window.dispatchEvent(new CustomEvent("metrics-change"));
}

function onResize() {
	if (resizeTimeout) { clearTimeout(resizeTimeout); }
	resizeTimeout = setTimeout(onResized, 100);
}

function measure() {
	let realTileCount = [tileCount[0], tileCount[1]+5];
	tileSize = RCtor.computeTileSize(realTileCount, [window.innerWidth, window.innerHeight], [0.7, 1.0]);
//	console.log(tileSize)

	style.setProperty("--tile-width", `${tileSize[0]}px`);
	style.setProperty("--tile-height", `${tileSize[1]}px`);

	charWidth = measureCharWidth();
	style.setProperty("--char-width", `${charWidth}px`);
}

export async function init(tc: number[], R: typeof Renderer) {
	tileCount = tc;
	RCtor = R;

	style.setProperty("--map-width", String(tileCount[0]));
	style.setProperty("--map-height", String(tileCount[1]));

	document.fonts.forEach(f => f.load());
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
