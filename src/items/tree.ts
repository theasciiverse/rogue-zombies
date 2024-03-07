import Item from "./item.js";
import Map from "../map.js";
import * as colors from "../colors.js"


export default class Tree extends Item {
	readonly visual = { ch: ["♠", "♣"].random(), fg: colors.TREE.random() };
	static Name = "tree";

	get blocksMovement() { return true; }

	constructor(map: Map, x:number, y:number) {
		super(map);
		this._position = [x, y];
	}
}
