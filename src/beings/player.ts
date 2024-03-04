import Entity from "../entity.js";
import Being from "./being.js";
import Map from "../map.js";
import { ITEMS } from "../items/db.js";
import * as keyboard from "../keyboard.js";
import * as rules from "../rules.js";
import * as log from "../log.js";
import * as status from "../status.js";
import help from "../dialogs/help.js";
import buy from "../dialogs/buy.js";


export default class Player extends Being {
	readonly visual = {ch:"@", fg:"red"};
	protected _hp = rules.PLAYER_HP;
	protected _money = 10;
	readonly items = new window.Map<string, number>();

	constructor(protected map: Map) {
		super(map);
		status.update(this);

		this._hp--;
		this.setItem("crowbar", Infinity);
		this.setItem("rake", Infinity);
		this.setItem("barricade", 3);
		this.setItem("mine", Infinity);
		this.setItem("bazooka", Infinity);
		this.setItem("wire", Infinity);
		this.setItem("fence", Infinity);
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

		if (being) {
			await log.add(`${being.name.article().capitalize()} blocks the way.`);
			return false;
		}

		if (item && item.blocks) {
			await log.add(`${item.name.article().capitalize()} blocks the way.`);
			return false;
		}

		if (item && !item.blocks) {
			await log.add(`You carefully sidestep ${item.name.article()}.`);
		}

		this.position = [x, y];
		return true;
	}

	protected async tryItem(num: string) {
		let it = ITEMS.find(it => it.key == num);
		if (!it) { return false; } // number does not exist

		let amount = this.getItem(it.id);
		if (!amount) {
			await log.add(`You don't have any ${it.ctor.name}s.`);
			return false;
		}

		let name = it.ctor.name;

		let direction = await waitForDirection(`Use ${name.article()}`);
		if (!direction) { return false; }

		const { map, position } = this;

		log.clear();
		this.setItem(it.id, amount-1);
		let item = new it.ctor(map);
		return item.use(position, direction);
	}

	async damage(source: Entity) {
		await log.add(`${source.name.article().capitalize()} hits you!`);
		super.damage(source);
		status.update(this);
	}

	async die(source: Entity) {
		super.die(source);
		await log.add("You die...");
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
