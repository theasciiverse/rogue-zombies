import Item from './item.js';


export default class House extends Item {
	readonly visual = { ch: "#", fg: "saddlebrown", bg: "black" };

	get blocks() { return true; }
}
