import Level from "./level.js";
import * as keyboard from "./keyboard.js";


interface HistoryItem {
	node: HTMLElement;
	length: number;
}

const node = document.querySelector<HTMLElement>("#log")!;
let history: HistoryItem[] = [];
let limit: number;

function computeHistoryLength() {
	return history.reduce((acc, h) => acc + h.length, 0);
}

export async function add(str: string) {
	let span = document.createElement("span");
	span.textContent = str + " ";
	let length = str.length+1;

	let wouldBeLength = computeHistoryLength() + length;
	if (wouldBeLength > limit) {
		let more = document.createElement("span");
		let kbd = document.createElement("kbd");
		kbd.textContent = "space";
		more.append("...", kbd);
		node.append(more);
		while (true) {
			let key = await keyboard.readKey();
			if (key.code == "Space") { break; }
		}
		more.remove();
	}

	history.push({node: span, length});
	node.append(span);

	// remove from the beginning
	let totalLength = computeHistoryLength();
	while (totalLength > limit) {
		let first = history.shift()!;
		first.node.remove();
		totalLength -= first.length;
	}
}

export function clear() {
	node.replaceChildren();
	history = [];
}

export function init(level: Level, charWidth: number) {
	const { tileSize, map } = level;
	limit = map.width * 2 - 15;
	node.style.setProperty("--tile-width", `${tileSize[0]}px`);
	node.style.setProperty("--tile-height", `${tileSize[1]}px`);
	node.style.setProperty("--char-width", `${charWidth}px`);
	node.style.setProperty("--char-width", `${charWidth}px`);
	node.style.setProperty("--map-width", String(map.width));
}
