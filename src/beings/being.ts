import Map from "../map.js";


export default class Being {
	_position: number[];
	readonly visual = { ch: "?", fg: "lime" };

	constructor(protected map: Map) {
	}

	get position() { return this._position; }

	set position(position: number[]) {
		const { map } = this;

		this._position = position;
		map.changed(this);
	}
}
