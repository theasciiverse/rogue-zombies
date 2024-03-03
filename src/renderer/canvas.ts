import Renderer, { Visual, Drawable } from "./renderer.js";


const DPR = (devicePixelRatio > 1 ? 2 : 1);

export default class Canvas extends Renderer {
	readonly node = document.createElement("canvas");
	readonly ctx = this.node.getContext("2d")!;

	constructor(tileCount: number[], tileSize: number[]) {
		super(tileCount, tileSize);

		const width = tileCount[0] * tileSize[0];
		const height = tileCount[1] * tileSize[1];

		const { node, ctx } = this;
		node.width = width * DPR;
		node.height = height * DPR;
		node.style.width = `${width}px`;
		node.style.height = `${height}px`;

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = `bold ${tileSize[1]}px input`;
		ctx.scale(DPR, DPR);
	}

	draw(x: number, y: number, drawables: Drawable[]) {
		let visuals = drawables.map(d => d.visual);
		let visual = resolveVisual(visuals);

		this.drawVisual(x, y, visual);
	}

	drawVisual(x: number, y: number, visual: Visual) {
		const { ctx, tileSize } = this;

		ctx.fillStyle = visual.bg;
		ctx.fillRect(x*tileSize[0], y*tileSize[1], tileSize[0], tileSize[1]);

		if (visual.ch) {
			ctx.fillStyle = visual.fg;
			ctx.fillText(visual.ch, (x+0.5)*tileSize[0], (y+0.5)*tileSize[1] + 1); // FIXME +1
		}
	}
}

function resolveVisual(visuals: (Partial<Visual> | null)[]): Visual {
	let visual = {
		bg: "black",
		fg: "gray",
		ch: ""
	}
	visuals.forEach(v => Object.assign(visual, v));
	return visual;
}
