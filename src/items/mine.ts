import Item from "./item.js";
import Being from "../beings/being.js";
import * as log from "../log.js";
import { explode } from "../explosion.js";
import * as sfx from "../sfx.js";


export default class Mine extends Item {
	static Name = "Mine";
	static description = "Explodes when stepped on by a zombie.";
	readonly visual = {ch:"*", fg:"gray"};

	use(position: number[], direction: number[]) {
		let ok = super.use(position, direction);
		if (!ok) { return false; }

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		this._position = [tx, ty];
		this.map.addItem(this);
		log.add("You set up a mine.");

		return true;
	}

	async activate(being: Being) {
		const { map, position } = this;
		map.removeItem(this);
		sfx.play("mine");
		await explode(map, position, 3, this);
	}
}
