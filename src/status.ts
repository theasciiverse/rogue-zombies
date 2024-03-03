import Player from "./beings/player.js";
import { ITEMS, ItemTemplate } from "./items/db.js"
import * as rules from "./rules.js"


const node = document.querySelector<HTMLElement>("#status")!;

export function init(tileSize: number[]) {
	node.style.setProperty("--tile-width", `${tileSize[0]}px`);
	node.style.setProperty("--tile-height", `${tileSize[1]}px`);
	let width = measureCharWidth();
	node.style.setProperty("--char-width", `${width}px`);
}

export function update(player: Player) {
	let items = ITEMS.map(it => buildItem(it, player));
	let status = [
		"Health: ",
		buildHP(player.hp, rules.PLAYER_HP),
		"  ",
		"Money: ",
		buildMoney(player.money),
		"  ",
		buildKey("B", "uy items"),
		"  ",
		buildKey("S", "tart the invasion"),
		"  ",
		buildKey("?", "Help"),
	];
	node.replaceChildren(...items, "\n", ...status);
}

function buildHP(curent: number, max: number) {
	let node = document.createElement("span");
	node.className = "hp";

	let str = "";
	for (let i=0;i<max;i++) {
		str += (i < curent ? "♥" : "♡");
	}

	node.textContent = str;
	return node;
}

function buildMoney(money: number) {
	let node = document.createElement("span");
	node.className = "money";
	node.textContent = String(money);
	return node;
}

function buildKey(key: string, text: string) {
	let node = document.createElement("span");

	let kbd = document.createElement("kbd");
	kbd.textContent = key;

	node.append(kbd, text);
	return node;
}


function buildItem(it: ItemTemplate, player: Player) {
	let node = document.createElement("span");
	node.className = "item";

	let count = player.getItem(it.id);
	node.classList.toggle("disabled", count == 0);

	let kbd = document.createElement("kbd");
	kbd.textContent = it.key;

	let c = document.createElement("span");
	c.className = "count";
	c.textContent = (count == Infinity ? "∞" : String(count));
	node.append(kbd, it.short || it.name, c, "  ");

	return node;
}

function measureCharWidth() {
	let span = document.createElement("span");
	span.textContent = "P";
	node.append(span);

	let rect = span.getBoundingClientRect();
	span.remove();
	return rect.width;
}

