import Map from "../map.js";
import Being from "../beings/being.js";


export default abstract class Item {
	protected _position: number[];
	readonly visual = { ch: "?", fg: "white" };
	readonly blocks: boolean = false;

	constructor(protected map: Map) {
	}

	get position() { return this._position; }

	set position(position: number[]) {
		const { map } = this;

		this._position = position;
		map.changed(this);
	}

	async use(position: number[], direction: number[]) { // use from inventory

	}

	activate(being: Being) { // stepped on something

	}

	damage(source: Being | Item) {  // damaged by something
		console.log("item", this, "damaged by", source);
	}
}
