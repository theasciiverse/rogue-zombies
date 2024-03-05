import Map from "./map.js";
import { Visual } from "./renderer/renderer.js";


export default abstract class Entity {
	protected _position: number[];
	protected _hp = 1;

	constructor(protected map: Map) {}

	get name() { return ""; }
	abstract get visual(): Partial<Visual>;

	get position() { return this._position; }
	set position(position: number[]) {
		this._position = position;
		this.map.changed(this);
	}

	damage(source: Entity) {
		this._hp -= 1;
		if (this._hp == 0) { this.die(source); }
	}

	abstract die(source: Entity): void;
}
