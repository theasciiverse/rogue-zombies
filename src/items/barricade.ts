import Entity from "../entity.js";
import Item from "./item.js";
import * as log from "../log.js";
import * as sfx from "../sfx.js";


// FIXME pekne hnusny
const COLORS = ["", "#300", "#850", "#c90"];

export default class Barricade extends Item {
	static Name = "Wooden Barricade";
	static description = "Can hold them for some time.";

	readonly blocks = true;
	protected _hp = COLORS.length-1;
	readonly visual = { ch: "#", fg: COLORS[COLORS.length-1] };

	damage(source: Entity) {
		sfx.play("barricade");
		super.damage(source);
		if (this._hp > 0) {
			this.visual.fg = COLORS[this._hp];
			this.map.changed(this);
		}
	}

	use(position: number[], direction: number[]) {
		let ok = super.use(position, direction);
		if (!ok) { return false; }

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		this._position = [tx, ty];
		this.map.addItem(this);
		log.add("You build a barricade.");

		return true;
	}
}
