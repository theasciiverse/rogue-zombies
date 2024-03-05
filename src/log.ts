import * as keyboard from "./keyboard.js";
import * as metrics from "./metrics.js";


interface HistoryItem {
	node: HTMLElement;
	length: number;
}

const node = document.querySelector<HTMLElement>("#log")!;

let shown: HistoryItem[] = [];
let pending: HistoryItem[] = [];


export function add(str: string) {
	let span = document.createElement("span");
	span.textContent = str + " ";
	let length = str.length+1;

	pending.push({node: span, length});
	showPending();
}

export async function flush() {
	while (pending.length > 0) {
		await waitForMore();
		while (shown.length > 0) { shown.shift()!.node.remove(); }
		showPending();
	}
}

export function clear() {
	node.replaceChildren();
	shown = [];
	pending = [];
}

function showPending() {
	let limit = metrics.tileCount[0]*2 - 15;
	let shownLength = shown.reduce((acc, h) => acc + h.length, 0);

	while (pending.length > 0) {
		let first = pending[0];
		if (shownLength + first.length > limit) { break; }

		node.append(first.node);
		shownLength += first.length;
		shown.push(pending.shift()!);
	}
}

async function waitForMore() {
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
