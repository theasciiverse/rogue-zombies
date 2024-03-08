export interface Drawable {
	position: number[];
	visual: Partial<Visual>;
}

export interface Visual {
	ch: string;
	fg: string;
	bg: string;
};


export default abstract class Renderer {
	readonly node!: HTMLElement;

	static computeTileSize(tileCount: number[], area: number[], aspectRatioRange: number[]) {
		let w = Math.floor(area[0]/tileCount[0]);
		let h = Math.floor(area[1]/tileCount[1]);
		let ar = w/h;
		// console.log("optimal values: w=", w, "h=", h, "ar=", ar)
		if (ar < aspectRatioRange[0]) { // too narrow => reduce height
			h = Math.floor(w/aspectRatioRange[0]);
		} else if (ar > aspectRatioRange[1]) { // too wide => reduce width
			w = Math.floor(h*aspectRatioRange[1]);
		}
		return [w, h];
	}

	abstract configure(tileCount: number[], tileSized: number[]): void;
	abstract draw(x: number, y: number, drawables: Drawable[]): void;
	abstract remove(drawable: Drawable): void;
}
