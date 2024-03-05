import Being from "../beings/being.js";
import Entity from "../entity.js";
import * as log from "../log.js";


export default abstract class Item extends Entity {
	static name = "";
	static description = "";

	readonly blocks: boolean = false;

	get name() { return this.constructor.name; }
	die(source: Entity) { this.map.removeItem(this); }

	activate(being: Being): void | Promise<void> {} // stepped on something
	use(position: number[], direction: number[]): boolean | Promise<boolean> { // use from inventory
		const { map } = this;

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		let blocker = map.getBlocker(tx, ty);

		if (blocker) {
			log.add(`Cannot use ${this.name}: ${blocker.name.article()} is standing there!`);
			return false;
		}

		let item = map.getItem(tx, ty);
		if (item) {
			log.add(`Cannot use ${this.name}: ${item.name.article()} is lying there!`);
			return false;
		}

		return true;
	}
}
