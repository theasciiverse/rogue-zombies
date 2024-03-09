import Map from "./map.js";
import Item from "./items/item.js";
import Corpse from "./items/corpse.js";
import Zombie from "./beings/zombie.js";


function sleep(ms: number) { return new Promise<void>(resolve => setTimeout(resolve, ms)); }

function gatherPositions(map: Map, center: number[], r: number) {
	let positions: number[][] = [];

	for (let i=center[0]-r;i<=center[0]+r;i++) {
		for (let j=center[1]-r;j<=center[1]+r;j++) {
			let verticalEdge = Math.abs(i-center[0]) == r;
			let horizontalEdge = Math.abs(j-center[1]) == r;
			if (verticalEdge && horizontalEdge) { continue; } // v rozich ne

			if (!map.isPositionValid(i, j)) { continue; }
			positions.push([i, j]);
		}
	}

	return positions;
}

function extractZombies(positions: number[][], map: Map) {
	let zombies: Zombie[] = [];

	positions.forEach(pos => {
		let being = map.getBeing(pos[0], pos[1]);
		if (being instanceof Zombie) { zombies.push(being); }
	});

	return zombies;
}

function drawExplosions(map: Map, positions: number[][], fraction: number) {
	let amount = Math.round(3*255*(1-fraction));
	let r = Math.max(0, Math.min(amount-0*255, 255));
	let g = Math.max(0, Math.min(amount-1*255, 255));
	let b = Math.max(0, Math.min(amount-2*255, 255));
	let fg = `rgb(${r} ${g} ${b})`;
	let visual = {ch: "*", fg};

	positions.forEach(pos => map.setFX(pos[0], pos[1], visual));
}

export async function explode(map: Map, center: number[], radius: number, source: Item) {
	let positions = gatherPositions(map, center, radius);
	let zombies = extractZombies(positions, map);
	const DIST = 10;

	zombies.forEach(z => {
		let expCenter = (z.position.distance(center) == 0 ? source.position : center)
		let dx = z.position[0] - expCenter[0];
		let dy = z.position[1] - expCenter[1];
		let vec = [dx, dy].normalize();
		let pos = [z.position[0] + vec[0]*DIST, z.position[1] + vec[1]*DIST];
		z.position = [Math.round(pos[0]), Math.round(pos[1])];
	});

	// remove corpses
	positions.forEach(pos => {
		let item = map.getItem(pos[0], pos[1]);
		if (item instanceof Corpse) { map.removeItem(item); }
	});

	// animate explosion
	let duration = 400;
	let step = 30;
	for (let i=0;i<duration;i+=step) {
		drawExplosions(map, positions, i/duration);
		await sleep(step);
	}

	positions.forEach(pos => map.setFX(pos[0], pos[1], null));

	// damage => kill&remove
	zombies.forEach(z => z.damage(source));
}
