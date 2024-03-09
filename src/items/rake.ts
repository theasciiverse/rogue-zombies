import Item from "./item.js";
import Being from "../beings/being.js";
import * as log from "../log.js";
import * as sfx from "../sfx.js";
import * as colors from "../colors.js";


export default class Rake extends Item {
	static Name = "rake";
	static description = "Kills one zombie dumb enough to step on it.";
	readonly visual = {ch:"T", fg:colors.WOOD[1]};

	use(position: number[], direction: number[]) {
		let ok = super.use(position, direction);
		if (!ok) { return false; }

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		this._position = [tx, ty];
		this.map.addItem(this);
		log.add("You set up a rake.");

		return true;
	}

	activate(being: Being) {
		sfx.play("rake");
		this.map.removeItem(this);
		being.damage(this);
	}
}
