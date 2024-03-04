import Item from "./item.js";
import Being from "../beings/being.js";
import * as log from "../log.js";


export default class Rake extends Item {
	static name = "Rake";
	static description = "Kills one zombie dumb enough to step on it.";
	readonly visual = {ch:"]", fg:"#999"};

	async use(position: number[], direction: number[]) {
		let ok = await super.use(position, direction);
		if (!ok) { return false; }

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		this._position = [tx, ty];
		this.map.addItem(this);
		await log.add("You set up a rake.");

		return true;
	}

	async activate(being: Being) {
		this.map.removeItem(this);
		await being.damage(this);
	}
}
