import Entity from "../entity.js";
import Corpse from "../items/corpse.js";


export default abstract class Being extends Entity {
	die(source: Entity) {
		const { map } = this;

		map.removeBeing(this);

		let existing = map.getItem(this.position[0], this.position[1]);
		if (!existing) {
			let corpse = new Corpse(map, this);
			map.addItem(corpse);
		}
	}
}
