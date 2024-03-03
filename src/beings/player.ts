import Being from "./being.js";
import Map from "../map.js";
import * as keyboard from "../keyboard.js";
import * as rules from "../rules.js";


export default class Player extends Being {
	visual = {ch:"@", fg:"red"};
	_hp = rules.PLAYER_HP;

	constructor(protected map: Map) {
		super(map);
	}

	async play() {
		while (true) {
			let key = await keyboard.readKey();
			console.log(key);

			let acted = this.processKey(key);
			if (acted) { break; }
		}
	}

	protected processKey(key: KeyboardEvent) {
		if (key.code in MOVEMENT) {
			let diff = MOVEMENT[key.code] as [number, number];
			return this.moveBy(...diff);
		}

		return false;
	}

	protected moveBy(dx: number, dy: number): boolean {
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
		if (item && item.blocks) { return false; } // FIXME neco napsat

		this.position = [x, y];
		return true;
	}

	get hp() { return this._hp; }

	damage(source: Being) {
		const { map, position } = this;
		this._hp -= 1;

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