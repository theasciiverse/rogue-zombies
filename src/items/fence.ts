import Entity from "../entity.js";
import Wire from "./wire.js";
import * as sfx from "../sfx.js";
import * as colors from "../colors.js";


const COLORS = ["", ...colors.FENCE.slice().reverse()];

export default class Fence extends Wire {
	static Name = "Electric fence";
	static description = "Auto-connects to nearby fences. Has more health.";
	protected _hp = COLORS.length-1;
	readonly visual = {ch:"*", fg:COLORS[this._hp]};
	protected sound: Parameters<typeof sfx.play>[0] = "fence";

	damage(source: Entity) {
		super.damage(source);
		if (this._hp > 0) {
			this.visual.fg = COLORS[this._hp];
			this.map.changed(this);
		}
	}
}
