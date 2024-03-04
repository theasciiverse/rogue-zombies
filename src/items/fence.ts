import Item from "./item.js";
import * as log from "../log.js";


export default class Fence extends Item {
	static name = "Electric fence";
	static description = "Auto-connects to nearby fences. Has more health.";

	async use(position: number[], direction: number[]) {
		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		let being = this.map.getBeing(tx, ty);

		if (being) {
			await log.add(`You hit the ${being.name}.`);
			being.damage(this);
		} else {
			await log.add("You swing the crowbar in the empty space.");
		}
	}
}
