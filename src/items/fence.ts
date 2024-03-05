import Entity from "../entity.js";
import Wire from "./wire.js";


const COLORS = ["", "#008", "#33a", "#88f"];

export default class Fence extends Wire {
	static Name = "Electric fence";
	static description = "Auto-connects to nearby fences. Has more health.";
	protected _hp = COLORS.length-1;
	readonly visual = {ch:"≈", fg:COLORS[this._hp]};

	damage(source: Entity) {
		super.damage(source);
		if (this._hp > 0) {
			this.visual.fg = COLORS[this._hp];
			this.map.changed(this);
		}
	}
}
