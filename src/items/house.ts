import Item from "./item.js";
import Map from "../map.js";


export default class House extends Item {
	readonly visual = { ch: "#", fg: "saddlebrown", bg: "black" };
	readonly blocks = true;
	protected _hp = 3;

	constructor(map: Map, x:number, y:number) {
		super(map);
		this._position = [x, y];
	}
}
