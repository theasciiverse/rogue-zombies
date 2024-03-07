import Map from "../map.js";
import Water from "../items/water.js";


export function create(map: Map) {
	let center = [Math.floor(map.width/2), Math.floor(map.height/2)];
//	let corner = map.getCorners().random();
	let corner = map.getCorners()[3];
	let toCenter = [center[0]-corner[0], center[1]-corner[1]];
	let length = toCenter.norm();

	let vecToCenter = toCenter.normalize();
//	let midDist = length * randomFloat(0.2, 0.5);
	let midDist = length * 0.5;
	let midPoint = [
		corner[0] + midDist*vecToCenter[0],
		corner[1] + midDist*vecToCenter[1],
	];

	let vecRiver = [-vecToCenter[0], vecToCenter[1]];

	createAtPoint(map, midPoint, vecRiver, length + 6); // +3 on each side
}

function createAtPoint(map: Map, center: number[], vecRiver: number[], length: number) {
//	const thickness = randomInt(2, 4);
	const thickness = 3;

	let vecNormal = [-vecRiver[1], vecRiver[0]];
	let dScale = 1;
	let dFrequency = 0.4;
	let dOffset= 10;

	console.log("center", center, "vecRiver", vecRiver, "length", length);
	for (let i=0;i<length;i+=0.5) {
		let dist = i-length/2;
		let distortion = dScale * Math.sin((i + dOffset)*dFrequency);

		let cx = center[0] + dist*vecRiver[0] + distortion*vecNormal[0];
		let cy = center[1] + dist*vecRiver[1] + distortion*vecNormal[1];

		for (let j=0;j<thickness;j++) {
			let dist = j-thickness/2;
			let x = cx + dist*vecNormal[0];
			let y = cy + dist*vecNormal[1];
			tryWater(map, Math.round(x), Math.round(y));
		}

	}
}

function tryWater(map: Map, x: number, y: number) {
	if (!map.isPositionValid(x, y)) { return; }

	let item = map.getItem(x, y);
	if (item) { return; }

	let water = new Water(map, x, y);
	map.addItem(water);
}

function randomFloat(min: number, max: number) {
	return min + Math.random() * (max-min);
}

function randomInt(min: number, max: number) {
	return min + Math.floor(Math.random() * (max-min+1));
}
