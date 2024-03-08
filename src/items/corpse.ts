import Item from "./item.js";
import Map from "../map.js";
import Being from "../beings/being.js";


export default class Corpse extends Item {
	readonly visual = {ch:"%", fg:""};
	protected _name: string;

	constructor(map: Map, being: Being) {
		super(map);

		this.visual.fg = being.visual.fg || "";
		this._position = being.position
		this._name = `${being.name} corpse`;
	}

	get name() { return this._name; }
}
