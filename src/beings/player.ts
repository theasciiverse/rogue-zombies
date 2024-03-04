import Being from "./being.js";
import Map from "../map.js";
import { ITEMS } from "../items/db.js";
import * as keyboard from "../keyboard.js";
import * as rules from "../rules.js";
import * as log from "../log.js";
import * as status from "../status.js";
import { help, buy } from "../dialog.js";


export default class Player extends Being {
	visual = {ch:"@", fg:"red"};
	_hp = rules.PLAYER_HP;
	_money = 10;
	items = new window.Map<string, number>();

	constructor(protected map: Map) {
		super(map);
		status.update(this);

		this._hp--;
		this.setItem("crowbar", Infinity);
		this.setItem("rake", 5);
	}

	get hp() { return this._hp; }

	async play() {
		while (true) {
			let key = await keyboard.readKey();
			console.log(key);

			let acted = await this.processKey(key);
			if (acted) { break; }
		}
	}

	getItem(id: string) {
		return this.items.get(id) || 0;
	}

	setItem(id: string, amount: number) {
		this.items.set(id, amount);
		status.update(this);
	}

	get money() { return this._money; }
	set money(money: number) {
		this._money = money;
		status.update(this);
	}

	protected async processKey(key: KeyboardEvent) {
		log.clear();

		if (key.code in MOVEMENT) {
			let diff = MOVEMENT[key.code] as [number, number];
			return this.moveBy(...diff);
		}

		if (key.code.startsWith("Digit")) {
			let num = key.code.match(/\d/);
			return (num ? this.tryItem(num[0]) : false);
		}

		if (key.code == "KeyB") {
			await buy(this);
			return false;
		}

		if (key.key == "?") {
			await help();
			return false;
		}

		if (key.code == "KeyL") {
			await log.add(String(Math.random()));
			return false;
		}

		return false;
	}

	protected async moveBy(dx: number, dy: number) {
		const { position, map } = this;
		let x = position[0]+dx;
		let y = position[1]+dy;

		if (!map.isPositionValid(x, y)) { return false; }

		let being = map.getBeing(x, y);
		let item = map.getItem(x, y);

		if (being) { // FIXME debug
			being.damage(this);
			return true;
		}

		if (being) { return false; } // FIXME neco napsat
		if (item && item.blocks) {
			let it = ITEMS.find(it => item instanceof it.ctor)!;
			await log.add(`${it.name} blocks the way.`);
			return false;
		}

		this.position = [x, y];
		return true;
	}

	protected async tryItem(num: string) {
		let it = ITEMS.find(it => it.key == num);
		if (!it) { return false; } // number does not exist

		let amount = this.getItem(it.id);
		if (!amount) {
			await log.add(`You don't have any ${it.name}s.`);
			return false;
		}

		let article = (it.name.match(/^[aeiou]/i) ? "an" : "a");
		let direction = await waitForDirection(`Use ${article} ${it.name}`);
		if (!direction) { return false; }

		const { map, position } = this;

		log.clear();
		let item = new it.ctor(map);
		await item.use(position, direction);
		return true;
	}

	damage(source: Being) {
		const { map, position } = this;
		this._hp -= 1;
		status.update(this);

		if (this.hp == 0) {
			map.removeBeing(this);
			let corpse = this.toCorpse();
			map.setBackground(position[0], position[1], corpse);
			console.log("Player killed by", source, "HP:", this.hp);
		} else {
			console.log("Player damaged by", source, "HP:", this.hp);
		}
	}
}

async function waitForDirection(prefix: string): Promise<[number, number] | null> {
	await log.add(`${prefix}: pick a direction, ESC to abort...`);
	while (true) {
		let key = await keyboard.readKey();
		if (key.key == "Escape") {
			await log.add("aborted.");
			return null;
		} else if (key.code in MOVEMENT) {
			return MOVEMENT[key.code];
		}
	}
}

const MOVEMENT = {
	"Numpad7": [-1, -1],

	"ArrowDown": [0, 1],
	"Numpad2": [0, 1],

	"Numpad9": [1, -1],

	"ArrowLeft": [-1, 0],
	"Numpad4": [-1, 0],

	"ArrowRight": [1, 0],
	"Numpad6": [1, 0],

	"ArrowUp": [0, -1],
	"Numpad8": [0, -1],

	"Numpad1": [-1, 1],

	"Numpad3": [1, 1]
}

