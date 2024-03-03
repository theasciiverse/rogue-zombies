import Renderer, { Drawable } from "./renderer/renderer.js";
import Being from "./beings/being.js";
import Item from "./items/item.js";


export default class Map {
	protected beings: Being[] = [];
	protected items: Item[] = [];
	protected bg: Drawable[][] = [];
	protected oldPositions = new window.Map<Drawable, number[]>();

	constructor(readonly width: number, readonly height: number, readonly renderer: Renderer) {
		this.bg = createBackground(width, height);

		for (let i=0;i<width;i++) {
			for (let j=0;j<height;j++) {
				this.redraw(i, j);
			}
		}
	}

	addBeing(being: Being) {
		this.beings.push(being);
		this.redraw(being.position[0], being.position[1]);
	}

	addItem(item: Item) {
		this.items.push(item);
		this.redraw(item.position[0], item.position[1]);
	}

	getBeing(x: number, y: number) {
		return this.beings.find(being => being.position[0] == x && being.position[1] == y);
	}

	getItem(x: number, y: number) {
		return this.items.find(item => item.position[0] == x && item.position[1] == y);
	}

	changed(what: Drawable) {
		const { oldPositions } = this;
		let op = oldPositions.get(what);
		if (op) { this.redraw(op[0], op[1]); }

		oldPositions.set(what, what.position.slice());
		this.redraw(what.position[0], what.position[1]);
	}

	protected redraw(x: number, y: number) {
		let drawables = this.getDrawables(x, y);
		this.renderer.draw(x, y, drawables);
	}

	protected getDrawables(x: number, y: number) {
		const { bg } = this;

		let drawables: Drawable[] = [];

		drawables.push(bg[x][y]);

		let item = this.getItem(x, y);
		item && drawables.push(item);

		let being = this.getBeing(x, y);
		being && drawables.push(being);

		return drawables;
	}
}

function createBackground(width: number, height: number) {
	let bg: Drawable[][] = [];
	for (let x = 0; x < width; x++) {
		let col: Drawable[] = [];
		bg.push(col);
		for (let y = 0; y < height; y++) {
			let drawable = {position: [x, y], visual: {ch: ".", bg: "black", fg: "gray"}};
			col.push(drawable);
		}
	}
	return bg;
}
