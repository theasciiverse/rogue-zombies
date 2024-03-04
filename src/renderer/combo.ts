import Renderer, { Drawable } from "./renderer.js";
import Canvas from "./canvas.js";
import DOM from "./dom.js";


export default class Combo extends Renderer {
	readonly node = document.createElement("div");
	protected renderers: Renderer[];

	static computeTileSize(tileCount: number[], area: number[], aspectRatioRange: number[]) {
		let halfArea = [area[0]/2, area[1]];
		return super.computeTileSize(tileCount, halfArea, aspectRatioRange);
	}

	constructor() {
		super();

		const { node } = this;
		node.className = "combo";

		let renderers = [Canvas, DOM].map(r => new r());
		node.append(...renderers.map(r => r.node));

		this.renderers = renderers;
	}

	draw(x: number, y: number, drawables: Drawable[]) {
		this.renderers.forEach(r => r.draw(x, y, drawables));
	}

	remove(drawable: Drawable) {
		this.renderers.forEach(r => r.remove(drawable));
	}

	configure(tileCount: number[], tileSize: number[]) {
		this.renderers.forEach(r => r.configure(tileCount, tileSize));
	}
}
