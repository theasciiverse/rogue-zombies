import Item from "./item.js";
import Player from "../beings/player.js";
import Being from "../beings/being.js";
import Map from "../map.js";
import * as log from "../log.js";
import DIRS from "../dirs.js";


const CONNECTION_DISTANCE = 3;

export default class Wire extends Item {
	static name = "Barbed wire";
	static description = "Auto-connects to nearby wires. Has little health.";
	readonly visual = {ch:"#", fg:"#888"};

	activate(being: Being) {
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
		DIRS.forEach(dir => {
			tryConnection([tx, ty], dir, map, Ctor);
		});

		log.add("You build a barbed wire segment.");
	}
}

function tryConnection(position: number[], direction: number[], map: Map, Ctor: typeof Wire) {
	let amount = 0;

	for (let i=1;i<CONNECTION_DISTANCE;i++) {
		let x = position[0] + i*direction[0];
		let y = position[1] + i*direction[1];
		let blocker = map.getBlocker(x, y);
		if (blocker && !(blocker instanceof Player)) { break; } // sorry

		let item = map.getItem(x, y);
		if (item) {
			if (item instanceof Ctor) { amount = i-1; }
			break;
		}
	}

	for (let i=1;i<=amount;i++) {
		let x = position[0] + i*direction[0];
		let y = position[1] + i*direction[1];
		let item = new Ctor(map);
		item.position = [x, y];
		map.addItem(item);
	}
}
