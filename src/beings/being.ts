import Entity from "../entity.js";


export default abstract class Being extends Entity {
	die(source: Entity) {
		const { map, position, visual } = this;

		map.removeBeing(this);
		map.setBackground(position[0], position[1], {ch:"%", fg:visual.fg});
	}
}
