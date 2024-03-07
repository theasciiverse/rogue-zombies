import Item from "./item.js";
import Map from "../map.js";


export default class Water extends Item {
	readonly visual = { ch: "≈", fg: "dodgerblue", bg: "darkblue" };
	readonly blocks = true;
	readonly destructible = false;
	static Name = "river";

	constructor(map: Map, x:number, y:number) {
		super(map);
		this._position = [x, y];
	}
}
