import Barrier from "./barrier.js";
import Map from "../map.js";


export default class House extends Barrier {
	static Name = "house wall";

	constructor(map: Map, ch: string, x:number, y:number) {
		super(map);
		this.visual.ch = ch;
		this._position = [x, y];
	}
}
