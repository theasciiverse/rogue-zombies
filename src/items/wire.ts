import Item from "./item.js";
import * as log from "../log.js";


export default class Wire extends Item {
	static name = "Barbed wire";
	static description = "Auto-connects to nearby wires. Has little health.";

	use(position: number[], direction: number[]) {
		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		let being = this.map.getBeing(tx, ty);

		if (being) {
			log.add(`You hit the ${being.name}.`);
			being.damage(this);
		} else {
			log.add("You swing the crowbar in the empty space.");
		}
	}
}
