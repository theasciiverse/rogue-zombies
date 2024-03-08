import Item from "./item.js";
import Corpse from "./corpse.js";
import Player from "../beings/player.js";
import Being from "../beings/being.js";
import Map from "../map.js";
import * as log from "../log.js";
import * as sfx from "../sfx.js";
import * as colors from "../colors.js";
import DIRS, { CHARS } from "../dirs.js";


const CONNECTION_DISTANCE = 3;

export default class Wire extends Item {
	static Name = "Barbed wire";
	static description = "Auto-connects to nearby wires. Has little health.";
	readonly visual = {ch:"*", fg:colors.METAL};
	protected sound: Parameters<typeof sfx.play>[0] = "wire";

	activate(being: Being) {
		sfx.play(this.sound);
		this.damage(being);
		being.damage(this);
	}

	use(position: number[], direction: number[]) {
		let ok = super.use(position, direction);
		if (!ok) { return false; }

		const { map } = this;

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		this._position = [tx, ty];
		map.addItem(this);

		let Ctor = this.constructor as typeof Wire;
		DIRS.forEach((dir, i) => {
			tryConnection([tx, ty], i, map, Ctor);
		});

		log.add(`You build ${this.name.article()} segment.`);
		return true;
	}
}

function tryConnection(position: number[], directionIndex: number, map: Map, Ctor: typeof Wire) {
	let amount = 0;
	let direction = DIRS[directionIndex];
	let ch = CHARS[directionIndex];

	for (let i=1;i<=CONNECTION_DISTANCE;i++) {
		let x = position[0] + i*direction[0];
		let y = position[1] + i*direction[1];

		let being = map.getBeing(x, y);
		let item = map.getItem(x, y);

		if (being && !(being instanceof Player)) { break; } // sorry
		if (item) {
			if (item instanceof Corpse) { continue; } // we remove them in the process
			if (item instanceof Ctor) { amount = i-1; }
			break;
		}
	}

	for (let i=1;i<=amount;i++) {
		let x = position[0] + i*direction[0];
		let y = position[1] + i*direction[1];

		let corpse = map.getItem(x, y);
		corpse && map.removeItem(corpse);

		let item = new Ctor(map);
		item.visual.ch = ch;
		item.position = [x, y];
		map.addItem(item);
	}
}
