import Being from "../beings/being.js";
import Entity from "../entity.js";
import * as log from "../log.js";


export default abstract class Item extends Entity {
	static name = "";
	static description = "";

	readonly blocks: boolean = false;

	get name() { return this.constructor.name; }
	async activate(being: Being) {} // stepped on something

	die(source: Entity) { this.map.removeItem(this); }
	async use(position: number[], direction: number[]) { // use from inventory
		const { map } = this;

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		let being = map.getBeing(tx, ty);
		let item = map.getItem(tx, ty);

		if (being) {
			await log.add(`Cannot use ${this.name}: there is a ${being.name} standing there!`);
			return false;
		} else if (item) {
			await log.add(`Cannot use ${this.name}: ${item.name.article()} is ${item.blocks ? "standing" : "lying"} there!`);
			return false;
		} else {
			return true;
		}
	}
}
