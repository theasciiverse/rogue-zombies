import Item from "./item.js";
import Map from "../map.js";
import * as colors from "../colors.js";


export default class Window extends Item {
	static Name = "window";
	readonly visual = {fg:colors.WINDOW, ch:""};
	get blocksMovement() { return true; }

	constructor(map: Map, ch: string, x:number, y:number) {
		super(map);
		this.visual.ch = ch;
		this._position = [x, y];
	}
}
