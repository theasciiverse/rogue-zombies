import Entity from "../entity.js";
import Corpse from "../items/corpse.js";


export default abstract class Being extends Entity {
	die(source: Entity) {
		const { map, position } = this;

		map.removeBeing(this);

		let valid = map.isPositionValid(position[0], position[1]);
		let existing = map.getItem(position[0], position[1]);

		if (valid && !existing) {
			let corpse = new Corpse(map, this);
			map.addItem(corpse);
		}
	}
}
