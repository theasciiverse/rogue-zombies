import Map from "../map.js";
import House from "../items/house.js";
import Window from "../items/window.js";
import { randomInt } from "../random.js";


const W_HALF = [3, 5] as const;
const H_HALF = [2, 4] as const;
const X_RANGE = 5;
const Y_RANGE = 3;

export function create(map: Map) {
	let W = randomInt(...W_HALF);
	let H = randomInt(...H_HALF);
	let center = [Math.round(map.width/2), Math.round(map.height/2)];
	center[0] += randomInt(-X_RANGE, X_RANGE);
	center[1] += randomInt(-Y_RANGE, Y_RANGE);

	for (let i=-W;i<=W;i++) {
		for (let j=-H;j<=H;j++) {
			let x = center[0] + i;
			let y = center[1] + j;
			let verticalEdge = (i == -W || i == W);
			let horizontalEdge = (j == -H || j == H);

			let empty = false;
			if (i==0 || j==0) { empty = true; } // door
			if (!verticalEdge && !horizontalEdge) { empty = true; } // skip mid

			if (empty) {
				let item = map.getItem(x, y);
				item && map.removeItem(item);
				continue;
			}

			tryItem(map, x, y, verticalEdge, horizontalEdge);
		}
	}

	return center;
}

function tryItem(map: Map, x: number, y: number, vertical: boolean, horizontal: boolean) {
	if (!map.isPositionValid(x, y)) { return; }

	let item = map.getItem(x, y);
	item && map.removeItem(item);

	let i: House | Window;
	if (vertical && horizontal) {
		i = new House(map, "+", x, y);
	} else {
		let Ctor = (Math.random() > 0.5 ? House : Window);
		let ch = (vertical ? "|" : "-");
		i = new Ctor(map, ch, x, y);
	}
	map.addItem(i);
}
