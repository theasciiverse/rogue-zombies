import Item from "./item.js";
import Map from "../map.js";
import * as colors from "../colors.js"


export default class Water extends Item {
	readonly visual = { ch: "≈", fg: colors.WAVE.random(), bg: colors.WATER };
	static Name = "river";

	get blocksMovement() { return true; }
	get blocksBazooka() { return false; }
	get isDestructible() { return false; }

	constructor(map: Map, x:number, y:number) {
		super(map);
		this._position = [x, y];
	}
}
