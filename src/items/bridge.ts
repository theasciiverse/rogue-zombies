import Item from "./item.js";
import Map from "../map.js";
import * as colors from "../colors.js"


export default class Bridge extends Item {
	readonly visual = { ch: "=", fg: colors.WOOD[0], bg: colors.WATER };
	static Name = "bridge";

	constructor(map: Map, x:number, y:number) {
		super(map);
		this._position = [x, y];
	}
}
