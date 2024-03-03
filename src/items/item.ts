import Map from "../map.js";
import Being from "../beings/being.js";


export default abstract class Item {
	readonly position: number[];
	readonly visual = { ch: "?", fg: "white" };
	readonly blocks: boolean = false;

	constructor(protected map: Map, readonly x:number, readonly y:number) {
		this.position = [x, y];
	}

	damage(source: Being | Item) {
		console.log("item", this, "damaged by", source);
	}
}
