import Renderer, { Drawable, computeTileSize } from './renderer.js';
import Canvas from "./canvas.js";
import DOM from "./dom.js";


export default class Combo extends Renderer {
	readonly node = document.createElement("div");
	protected renderers: Renderer[];

	static withAreaLimit(tileCount: number[], area: number[], aspectRatioRange: number[]): Renderer {
		let halfArea = [area[0]/2, area[1]];
		let tileSize = computeTileSize(tileCount, halfArea, aspectRatioRange);
		return new Combo(tileCount, tileSize);
	}

	constructor(tileCount: number[], tileSize: number[]) {
		super(tileCount, tileSize);

		const { node } = this;
		node.className = "combo";

		let renderers = [Canvas, DOM].map(r => new r(tileCount, tileSize));
		node.append(...renderers.map(r => r.node));

		this.renderers = renderers;
	}

	draw(x: number, y: number, drawables: Drawable[]) {
		this.renderers.forEach(r => r.draw(x, y, drawables));
	}

	remove(drawable: Drawable) {
		this.renderers.forEach(r => r.remove(drawable));
	}
}
