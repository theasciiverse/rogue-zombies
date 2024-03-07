import Map from "../map.js";
import Tree from "../items/tree.js";


export function create(map: Map, cornerIndex: number) {
	let center = [map.width/2, map.height/2];
	let corner = map.getCorners()[cornerIndex];
	let toCenter = [center[0]-corner[0], center[1]-corner[1]];

	let midPoint = [corner[0] + Math.floor(toCenter[0]/2), corner[1] + Math.floor(toCenter[1]/2)];
	createAtPoint(map, midPoint); // +3 on each side
}

function createAtPoint(map: Map, center: number[]) {
	const W = 7;
	const H = 4;
	for (let i=-W;i<=W;i++) {
		for (let j=-H;j<=H;j++) {
			let dx = i/W;
			let dy = j/H;
			let dist = Math.sqrt(dx*dx + dy*dy);
			if (Math.random() < dist) { continue; }

			let x = center[0] + i;
			let y = center[1] + j;
			tryItem(map, x, y);
		}
	}
}

function tryItem(map: Map, x: number, y: number) {
	if (!map.isPositionValid(x, y)) { return; }

	let item = map.getItem(x, y);
	if (item) { return; }

	let tree = new Tree(map, x, y);
	map.addItem(tree);
}
