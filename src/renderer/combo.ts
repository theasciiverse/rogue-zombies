import Renderer, { Drawable } from './renderer.js';
import Canvas from "./canvas.js";
import DOM from "./dom.js";


export default class Combo extends Renderer {
	readonly node = document.createElement("div");
	protected renderers: Renderer[];

	constructor(tileCount: number[], tileSize: number[]) {
		super(tileCount, tileSize);

		const { node } = this;
		node.className = "combo";

		let renderers = [Canvas, DOM].map(r => new r(tileCount, tileSize));
		node.append(...renderers.map(r => r.node));

		this.renderers = renderers;
	}

	draw(x: number, y: number, drawables: Drawable[]) {
		const { renderers } = this;
		renderers.forEach(r => r.draw(x, y, drawables));
	}
}
