import Entity from "../entity.js";
import Being from "./being.js";
import Level from "../levels/level.js";
import { ITEMS } from "../items/db.js";
import * as keyboard from "../keyboard.js";
import * as log from "../log.js";
import start from "../dialogs/start.js";
import * as sfx from "../sfx.js";


export const MAX_HP = 3;

export default class Player extends Being {
	readonly visual = {ch:"@", fg:"red"};
	protected _hp = MAX_HP;
	protected _money: number;
	readonly items = new window.Map<string, number>();

	constructor(protected level: Level) {
		super(level.map);
		this._money = level.initialMoney;
	}

	get hp() { return this._hp; }

	async play() {
		while (true) {
			let key = await keyboard.readKey();
//			console.log(key);

			let acted = await this.processKey(key);
			if (acted) { break; }
		}
	}

	getItem(id: string) {
		return this.items.get(id) || 0;
	}

	setItem(id: string, amount: number) {
		this.items.set(id, amount);
		this.level.updateStatus();
	}

	get money() { return this._money; }
	set money(money: number) {
		this._money = money;
		this.level.updateStatus();
	}

	protected async processKey(key: KeyboardEvent) {
		const { level } = this;
		log.clear();

		if (isIdle(key)) { return true; }

		if (key.code in MOVEMENT) {
			let diff = MOVEMENT[key.code] as [number, number];
			return this.moveBy(...diff);
		}

		if (key.code.startsWith("Digit")) {
			let num = key.code.match(/\d/);
			return (num ? this.tryItem(num[0]) : false);
		}

		if (key.key == "s" && level.isAllowed("shop")) {
			await level.shop();
			return false;
		}

		if (key.key == "s" && level.isAllowed("start")) { // FIXM
			let result = await start();
			if (result) {
				level.start();
				return true;
			} else {
				return false;
			}
		}

		if (key.key == "?") {
			await level.help();
			return false;
		}

		return false;
	}

	protected moveBy(dx: number, dy: number) {
		const { position, map } = this;
		let x = position[0]+dx;
		let y = position[1]+dy;

		if (!map.isPositionValid(x, y)) { return false; }

		let being = map.getBeing(x, y);
		if (being) {
			sfx.play("crowbar");
			log.add(`You hit the ${being.name}.`);
			being.damage(this);
			return true;
		}

		let item = map.getItem(x, y);
		if (item) {
			if (item.blocks) {
				log.add(`${item.name.article().capitalize()} blocks the way.`);
				return false;
			} else {
				log.add(`You carefully sidestep ${item.name.article()}.`);
			}
		}

		this.position = [x, y];
		return true;
	}

	protected async tryItem(num: string) {
		let it = ITEMS.find(it => it.key == num);
		if (!it) { return false; } // number does not exist

		let name = it.ctor.Name;

		let amount = this.getItem(it.id);
		if (!amount) {
			log.add(`You don't have any ${name}s.`);
			return false;
		}

		let direction = await waitForDirection(`Use ${name.article()}`);
		if (!direction) { return false; }

		const { map, position } = this;

		log.clear();
		this.setItem(it.id, amount-1);
		let item = new it.ctor(map);
		return item.use(position, direction);
	}

	damage(source: Entity) {
		log.add(`${source.name.article().capitalize()} hits you!`);
		super.damage(source);
		this.level.updateStatus();
	}

	die(source: Entity) {
		super.die(source);
		sfx.play("game-over");
		log.add("You die...");
	}
}

async function waitForDirection(prefix: string): Promise<[number, number] | null> {
	log.add(`${prefix}: pick a direction, ESC to abort...`);
	while (true) {
		let key = await keyboard.readKey();
		if (key.key == "Escape") {
			log.add("aborted.");
			return null;
		} else if (key.code in MOVEMENT) {
			return MOVEMENT[key.code];
		}
	}
}

function isIdle(key: KeyboardEvent) {
	return (key.code == "Numpad5" || key.code == "Space" || key.key == ".");
}

const MOVEMENT = {
	"Numpad7": [-1, -1],
	"KeyY": [-1, -1],

	"ArrowUp": [0, -1],
	"Numpad8": [0, -1],
	"KeyK": [0, -1],

	"Numpad9": [1, -1],
	"KeyU": [1, -1],

	"ArrowLeft": [-1, 0],
	"Numpad4": [-1, 0],
	"KeyH": [-1, 0],

	"ArrowRight": [1, 0],
	"Numpad6": [1, 0],
	"KeyL": [1, 0],

	"Numpad1": [-1, 1],
	"KeyB": [-1, 1],

	"ArrowDown": [0, 1],
	"Numpad2": [0, 1],
	"KeyJ": [0, 1],

	"Numpad3": [1, 1],
	"KeyN": [1, 1]
}
