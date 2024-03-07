import { MAX_HP } from "./beings/player.js";
import Level from "./levels/level.js";
import { ITEMS, ItemTemplate } from "./items/db.js"


const node = document.querySelector<HTMLElement>("#status")!;

let previousValues: Record<string, number> = {};
let DOM_ITEMS: Record<string, HTMLElement> = {};
let DOM_MISC: Record<string, HTMLElement> = {};

export function init() {
	ITEMS.forEach(it => DOM_ITEMS[it.id] = buildItem(it));

	DOM_MISC["hp"] = buildHP();
	DOM_MISC["money"] = buildMoney();
	DOM_MISC["start"] = buildStart();
	DOM_MISC["score"] = buildScore();
	DOM_MISC["shop"] = buildShop();
	DOM_MISC["help"] = buildHelp();

	let nodes = [
		...Object.values(DOM_ITEMS),
		"\n",
		DOM_MISC["hp"], DOM_MISC["money"], DOM_MISC["start"],
		DOM_MISC["score"], DOM_MISC["shop"], DOM_MISC["help"]
	];

	node.replaceChildren(...nodes);
}

export function update(level: Level) {
	const { player } = level;

	ITEMS.forEach(it => {
		let node = DOM_ITEMS[it.id];
		let count = player.getItem(it.id);
		node.classList.toggle("disabled", count == 0);
		node.querySelector(".count")!.textContent = (count == Infinity ? "∞" : String(count));
	});

	updateHP(level);
	updateMoney(level);
	updateStart(level);
	updateScore(level);
	updateShop(level);
}

function buildHP() {
	let node = document.createElement("span");
	node.innerHTML = `Health: <span class="hp"></span>`;
	return node;
}

function updateHP(level: Level) {
	let current = level.player.hp;
	let max = MAX_HP;

	let str = "";
	for (let i=0;i<max;i++) {
		str += (i < current ? "♥" : "♡");
	}

	let node = DOM_MISC["hp"].querySelector(".hp")!;
	node.textContent = str;
	animateIfChanged(node, current);
}

function buildMoney() {
	let node = document.createElement("span");
	node.innerHTML = `  Money: <span class="money"></span>`;
	return node;
}

function updateMoney(level: Level) {
	let node = DOM_MISC["money"];
	node.hidden = !level.isAllowed("shop");

	let span = node.querySelector(".money")!;
	let money = level.player.money;
	span.textContent = String(money);
	animateIfChanged(span, money);
}

function buildScore() {
	let node = document.createElement("span");
	node.innerHTML = `  Score: <span class="score"></span>`;
	return node;
}

function updateScore(level: Level) {
	let node = DOM_MISC["score"];
	node.hidden = !level.isAllowed("score");

	let span = node.querySelector(".score")!;
	let score = level.score;
	span.textContent = String(score);
	animateIfChanged(span, score);
}

function buildStart() {
	let node = document.createElement("span");
	node.append("  ", buildKey("S", "tart the invasion"));
	return node;
}

function updateStart(level: Level) {
	DOM_MISC["start"].hidden = !level.isAllowed("start");
}

function buildShop() {
	let node = document.createElement("span");
	node.append("  ", buildKey("I", "tems"));
	return node;
}

function updateShop(level: Level) {
	DOM_MISC["shop"].hidden = !level.isAllowed("shop");
}

function buildHelp() {
	let node = document.createElement("span");
	node.append("  ", buildKey("?", "Help"));
	return node;
}

function buildKey(key: string, text: string) {
	let node = document.createElement("span");

	let kbd = document.createElement("kbd");
	kbd.textContent = key;

	node.append(kbd, text);
	return node;
}

function buildItem(it: ItemTemplate) {
	let node = document.createElement("span");

	let kbd = document.createElement("kbd");
	kbd.textContent = it.key;

	let c = document.createElement("span");
	c.className = "count";
	node.append(kbd, it.short || it.ctor.Name, c, "  ");

	return node;
}

function animateIfChanged(node: Element, value: number) {
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
