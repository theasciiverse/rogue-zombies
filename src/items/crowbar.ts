import Item from "./item.js";
import * as log from "../log.js";
import * as sfx from "../sfx.js";


export default class Crowbar extends Item {
	readonly visual = {};

	static Name = "Crowbar";
	static description = "Melee range, unlimited uses. You already have this.";

	use(position: number[], direction: number[]) {
		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		let being = this.map.getBeing(tx, ty);
		let item = this.map.getItem(tx, ty);

		if (being) {
			sfx.play("crowbar");
			log.add(`You hit the ${being.name}.`);
			being.damage(this);
		} else if (item) {
			log.add(`You hit the ${item.name}.`);
			item.damage(this);
		} else {
			sfx.play("swoosh");
			log.add("You swing the crowbar in the empty space.");
		}

		return true;
	}
}
