import Item from "./item.js";
import Being from "../beings/being.js";
import * as log from "../log.js";
import * as sfx from "../sfx.js";
import * as colors from "../colors.js";


export default class Trap extends Item {
	static Name = "Bear trap";
	static description = "Kills several zombies dumb enough to step on it.";
	readonly visual = {ch:"0", fg:colors.METAL};
	protected _hp = 3;

	use(position: number[], direction: number[]) {
		let ok = super.use(position, direction);
		if (!ok) { return false; }

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		this._position = [tx, ty];
		this.map.addItem(this);
		log.add("You set up a bear trap.");

		return true;
	}

	activate(being: Being) {
		sfx.play("rake"); // FIXME
		this.damage(being);
		being.damage(this);
	}
}
