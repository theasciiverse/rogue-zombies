import Renderer, { Drawable, Visual } from "./renderer/renderer.js";
import Being from "./beings/being.js";
import Item from "./items/item.js";
import Background from "./background.js";


export default class Map {
	protected beings: Being[] = [];
	protected items: Item[] = [];
	protected bg: Background;
	protected oldPositions = new window.Map<Drawable, number[]>();

	constructor(readonly width: number, readonly height: number, readonly renderer: Renderer) {
		this.bg = new Background(width, height);

		for (let i=0;i<width;i++) {
			for (let j=0;j<height;j++) {
				this.redraw([i, j]);
			}
		}
	}

	isPositionValid(x: number, y: number) {
		const { width, height } = this;
		if (x < 0 || x >= width || y < 0 || y >= height) { return false; }
		return true;
	}

	addBeing(being: Being) {
		this.beings.push(being);
		this.redraw(being.position);
	}

	addItem(item: Item) {
		this.items.push(item);
		this.redraw(item.position);
	}

	getBeing(x: number, y: number) {
		return this.beings.find(being => being.position[0] == x && being.position[1] == y);
	}

	getItem(x: number, y: number) {
		return this.items.find(item => item.position[0] == x && item.position[1] == y);
	}

	removeBeing(being: Being) {
		this.beings = this.beings.filter(b => b != being);
		this.renderer.remove(being);
		this.redraw(being.position);
	}

	removeItem(item: Item) {
		this.items = this.items.filter(i => i != item);
		this.renderer.remove(item);
		this.redraw(item.position);
	}

	setBackground(x: number, y: number, visual: Partial<Visual>) {
		this.bg.set(x, y, visual);
		this.redraw([x, y]);
	}

	changed(what: Drawable) {
		const { oldPositions } = this;
		let op = oldPositions.get(what);
		if (op) { this.redraw(op); }

		oldPositions.set(what, what.position.slice());
		this.redraw(what.position);
	}

	protected redraw(position: number[]) {
		const [x, y] = position;
		let drawables = this.getDrawables(x, y);
		this.renderer.draw(x, y, drawables);
	}

	protected getDrawables(x: number, y: number) {
		const { bg } = this;

		let drawables: Drawable[] = [];

		drawables.push(bg.at(x, y));

		let item = this.getItem(x, y);
		item && drawables.push(item);

		let being = this.getBeing(x, y);
		being && drawables.push(being);

		return drawables;
	}
}

