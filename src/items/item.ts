import Being from "../beings/being.js";
import Corpse from "./corpse.js";
import Entity from "../entity.js";
import * as log from "../log.js";


export default abstract class Item extends Entity {
	static Name = "";
	static description = "";

	get blocksMovement() { return false; }
	get isDestructible() { return true; }
	get blocksBazooka() { return this.blocksMovement; }

	get name() { return (this.constructor as typeof Item).Name; }
	die(source: Entity) { this.map.removeItem(this); }

	activate(being: Being): void | Promise<void> {} // stepped on something
	use(position: number[], direction: number[]): boolean | Promise<boolean> { // use from inventory
		const { map } = this;

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		let being = map.getBeing(tx, ty);
		let item = map.getItem(tx, ty);

		if (being) {
			log.add(`Cannot use ${this.name}: ${being.name.article()} is standing there!`);
			return false;
		}

		if (item) {
			if (item.blocksMovement) {
				log.add(`Cannot use ${this.name}: ${item.name.article()} is standing there!`);
				return false;
			} else if (item instanceof Corpse) {
				map.removeItem(item);
				return true;
			} else {
				log.add(`Cannot use ${this.name}: ${item.name.article()} is lying there!`);
				return false;
			}
		}

		return true;
	}
}
