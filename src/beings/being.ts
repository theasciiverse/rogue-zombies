import Map from "../map.js";
import Item from "../items/item.js";


export default class Being {
	_position: number[];
	readonly visual = { ch: "?", fg: "lime" };

	constructor(protected map: Map) {
	}

	get name() { return "?"; }

	get position() { return this._position; }
	set position(position: number[]) {
		const { map } = this;

		this._position = position;
		map.changed(this);
	}

	damage(source: Being | Item) {
		console.log("being", this, "damaged by", source);
	}

	toCorpse() {
		return {ch:"%", fg:this.visual.fg};
	}
}
