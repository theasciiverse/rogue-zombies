import Map from "./map.js";
import Item from "./items/item.js";
import Corpse from "./items/corpse.js";
import Zombie from "./beings/zombie.js";


function sleep(ms: number) { return new Promise<void>(resolve => setTimeout(resolve, ms)); }

function gatherPositions(map: Map, center: number[], r: number) {
	let positions: number[][] = [];

	for (let i=center[0]-r;i<=center[0]+r;i++) {
		for (let j=center[1]-r;j<=center[1]+r;j++) {
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

export async function explode(map: Map, position: number[], radius: number, source: Item) {
	let positions = gatherPositions(map, position, radius);

	extractZombies(positions, map).forEach(z => z.damage(source));

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
}

/*

RZ.Item.prototype._explode = function(coords) {
	RZ.rz.lock();
	var fx = new RZ.Object();
	fx.visual.ch = "*";

	for (var i=0;i<coords.length;i++) {
		var c = coords[i];
		var being = RZ.rz.getBeing(c[0], c[1]);
		if (being) {
			if (being != RZ.rz.player) { being.damage(this); }
		} else {
			RZ.rz.removeBackground(c[0], c[1]);
		}
	}

	var length = 400;
	var start = new Date().getTime();

	var step = function() {
		var ts = new Date().getTime();
		var fraction = (ts-start)/length;
		if (fraction >= 1) {
			for (var i=0;i<coords.length;i++) { RZ.rz.removeFX(coords[i][0], coords[i][1]); }
			clearInterval(interval);
			RZ.rz.unlock();
		} else {
			this._explosionStep(coords, fx, fraction);
		}
	}.bind(this);

	step();
	var interval = setInterval(step, 30);
}

RZ.Item.prototype._explosionStep = function(coords, fx, fraction) {
	var amount = Math.round(3*255*(1-fraction));

	var r = Math.max(0, Math.min(amount-0*255, 255));
	var g = Math.max(0, Math.min(amount-1*255, 255));
	var b = Math.max(0, Math.min(amount-2*255, 255));
	fx.visual.fg = "rgb("+r+","+g+","+b+")"

	for (var i=0;i<coords.length;i++) {
		RZ.rz.addFX(fx, coords[i][0], coords[i][1]);
	}
}
*/