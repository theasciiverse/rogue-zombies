import { Drawable, Visual } from "./renderer/renderer.js";

let seed = -Math.random()*100;


export default class Background {
	data: Drawable[][] = [];

	constructor(width: number, height: number) {
		const { data } = this;
		for (let x = 0; x < width; x++) {
			let col: Drawable[] = [];
			data.push(col);
			for (let y = 0; y < height; y++) {
				let drawable = {position: [x, y], visual: {ch: ".", bg: bgColor(x, y), fg: "#222"}};
				col.push(drawable);
			}
		}
	}

	set(x: number, y: number, visual: Partial<Visual>) { Object.assign(this.data[x][y].visual, visual); }
	at(x: number, y: number) { return this.data[x][y]; }
}

function bgColor(x: number, y: number) {
	x += seed;
	y += seed;
	let h = Math.sin(x*y * 0.001); // -1..1
	h = 60 + h*30;

	let s = Math.cos(x*y * 0.003); // -1..1
	s = 50 + s*20;

	let l = 15;
	return `hsl(${h}, ${s}%, ${l}%)`;
}
