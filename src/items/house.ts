import Barricade from "./barricade.js";
import Map from "../map.js";


export default class House extends Barricade {
	static Name = "house wall";

	constructor(map: Map, ch: string, x:number, y:number) {
		super(map);
		this.visual.ch = ch;
		this._position = [x, y];
	}
}
