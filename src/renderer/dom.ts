import Renderer, { Drawable } from "./renderer.js";


export default class DOM extends Renderer {
	readonly node = document.createElement("div");
	readonly nodes = new Map<Drawable, HTMLElement>();

	constructor() {
		super();
		this.node.className = "renderer dom";
	}

	configure() {}

	draw(x: number, y: number, drawables: Drawable[]) {
		const { node, nodes } = this;

		drawables.forEach((d, i) => {
			let dnode = nodes.get(d);
			if (!dnode) {
				dnode = document.createElement("div");
				node.append(dnode);
				nodes.set(d, dnode);
			}

			dnode.style.setProperty("--x", String(x));
			dnode.style.setProperty("--y", String(y));
			dnode.style.zIndex = String(i+1);

			const { visual } = d;
			if (visual.bg) { dnode.style.backgroundColor = visual.bg; }
			if (visual.fg) { dnode.style.color = visual.fg; }
			if (visual.ch) { dnode.textContent = visual.ch; }
		})
	}

	remove(drawable: Drawable) {
		const { nodes } = this;
		let dnode = nodes.get(drawable);
		dnode && dnode.remove();
	}
}
