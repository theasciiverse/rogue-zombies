import Map from "../map.js";
import { randomInt } from "../random.js";
import * as colors from "../colors.js";


const END_JITTER = 3;

export function create(map: Map, doors: number[][], riverIndex: number) {
	let nonRiverCorner = map.getCorners()[(riverIndex + 2) % 4];

	let w2 = map.width/2;
	let h2 = map.height/2;

	let borderPoint1 = [w2, nonRiverCorner[1]];
	let borderPoint2 = [nonRiverCorner[0], h2];
	let borderPoints = [borderPoint1, borderPoint2];

	let roadCount = randomInt(1, 2);
	while (roadCount --> 0) {
		let borderPoint = borderPoints.random();
		borderPoints = borderPoints.filter(p => p != borderPoint);
		let door = findClosestDoor(doors, borderPoint);
		createSegment(map, door, borderPoint);
	}
}

function createSegment(map: Map, start: number[], end: number[]) {
	let [x1, y1] = start;
	let [x2, y2] = end;
	x2 += randomInt(-END_JITTER, END_JITTER);
	y2 += randomInt(-END_JITTER, END_JITTER);

	let length = start.distance(end) + END_JITTER;
	let vec = [x2-x1, y2-y1].normalize();
	let normal = [vec[1], -vec[0]];

	let thickness = randomInt(1, 3);

	for (let i=0;i<=length;i++) {
		for (let j=0;j<thickness;j++) {
			let dist = j-thickness/2;
			let x = Math.round(x1 + i*vec[0] + dist*normal[0]);
			let y = Math.round(y1 + i*vec[1] + dist*normal[1]);
			if (!map.isPositionValid(x, y)) { continue; }
			map.setBackground(x, y, {fg: colors.ROAD});
		}
	}
}

function findClosestDoor(doors: number[][], point: number[]) {
	doors.sort((a, b) => a.distance(point) - b.distance(point));
	return doors[0];
}