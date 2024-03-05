import Player from "./beings/player.js";
import Level from "./levels/level.js";
import { ITEMS, ItemTemplate } from "./items/db.js"
import * as rules from "./rules.js"


const node = document.querySelector<HTMLElement>("#status")!;

let previousValues: Record<string, number> = {};


export function update(level: Level) {
	const { player } = level;

	let items = ITEMS.map(it => buildItem(it, player));
	let status = [
		"Health: ", buildHP(player.hp, rules.PLAYER_HP),
		"  ", "Money: ", buildMoney(player.money)
	];

	if (level.canBeStarted) {
		status.push("  ", buildKey("S", "tart the invasion"));
	} else {
		status.push("  ", "Score: ", buildScore(level.score));
	}

	status.push(
		"  ", buildKey("B", "uy items"),
		"  ", buildKey("?", "Help")
	);

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
	animateIfChanged(node, curent);
	return node;
}

function buildMoney(money: number) {
	let node = document.createElement("span");
	node.className = "money";
	node.textContent = String(money);
	animateIfChanged(node, money);
	return node;
}

function buildScore(score: number) {
	let node = document.createElement("span");
	node.className = "score";
	node.textContent = String(score);
	animateIfChanged(node, score);
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

	let count = player.getItem(it.id);
	node.classList.toggle("disabled", count == 0);

	let kbd = document.createElement("kbd");
	kbd.textContent = it.key;

	let c = document.createElement("span");
	c.className = "count";
	c.textContent = (count == Infinity ? "∞" : String(count));
	node.append(kbd, it.short || it.ctor.Name, c, "  ");

	return node;
}

function animateIfChanged(node: HTMLElement, value: number) {
	if (node.className in previousValues) {
		let previous = previousValues[node.className];
		if (previous != value) {
			previousValues[node.className] = value;
			node.animate(keyframes, timing);
		}
	} else {
		previousValues[node.className] = value;
	}
}


const keyframes = {
	transform: ["scale(1)", "scale(1.6)", "scale(1)"],
	offset: [0, 0.1, 1]
}

const timing = {
	duration: 600,
	iterations: 1
};
