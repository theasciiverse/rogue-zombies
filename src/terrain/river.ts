import Map from "../map.js";
import Water from "../items/water.js";
import Bridge from "../items/bridge.js";
import { randomFloat, randomInt } from "../random.js";


export function create(map: Map, cornerIndex: number) {
	let center = [map.width/2, map.height/2];
	let corner = map.getCorners()[cornerIndex];
	let toCenter = [center[0]-corner[0], center[1]-corner[1]];
	let length = toCenter.norm();

	let vecToCenter = toCenter.normalize();
	let midDist = length * randomFloat(0.2, 0.5);
	let midPoint = [
		corner[0] + midDist*vecToCenter[0],
		corner[1] + midDist*vecToCenter[1],
	];

	let vecRiver = [-vecToCenter[0], vecToCenter[1]];

	createAtPoint(map, midPoint, vecRiver, length + 6); // +3 on each side
}

function createAtPoint(map: Map, center: number[], vecRiver: number[], length: number) {
	const thickness = randomInt(2, 4);

	let vecNormal = [-vecRiver[1], vecRiver[0]];
	let dScale = randomFloat(0.5, 1.5);
	let dFrequency = randomFloat(0.1, 0.5);
	let dOffset = randomFloat(0, 2*Math.PI);

	let bridgeStart = randomFloat(length*1/4, length*3/4);
	let bridgeEnd = bridgeStart + 3;

	for (let i=0;i<length;i+=0.5) {
		let dist = i-length/2;
		let distortion = dScale * Math.sin((i+dOffset)*dFrequency);
		let isBridge = (i > bridgeStart && i < bridgeEnd);

		let cx = center[0] + dist*vecRiver[0] + distortion*vecNormal[0];
		let cy = center[1] + dist*vecRiver[1] + distortion*vecNormal[1];

		for (let j=0;j<thickness;j++) {
			let dist = j-thickness/2;
			let x = cx + dist*vecNormal[0];
			let y = cy + dist*vecNormal[1];
			let Ctor = (isBridge ? Bridge : Water);
			tryItem(map, Ctor, Math.round(x), Math.round(y));
		}
	}
}

function tryItem(map: Map, Ctor: (typeof Bridge | typeof Water), x: number, y: number) {
	if (!map.isPositionValid(x, y)) { return; }

	let item = map.getItem(x, y);
	if (item) { return; }

	let water = new Ctor(map, x, y);
	map.addItem(water);
}
