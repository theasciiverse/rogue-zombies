import Map from "../map.js";


export default abstract class Item {
	readonly position: number[];
	readonly visual = { ch: "?", fg: "white" };

	constructor(protected map: Map, readonly x:number, readonly y:number) {
		this.position = [x, y];
	}

	abstract get blocks(): boolean;
}
