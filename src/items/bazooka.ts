import Item from "./item.js";
import Map from "../map.js";
import * as log from "../log.js";
import { explode } from "../explosion.js";
import * as sfx from "../sfx.js";


export default class Bazooka extends Item {
	readonly visual = {ch:"*", fg:"yellow"};

	static Name = "Bazooka";
	static description = "Flys in a straight line, explodes on impact.";

	async use(position: number[], direction: number[]) {
		const { map, visual } = this;
		sfx.play("swoosh");
		log.add("You launch a rocket...");

		let {target, distance} = getTarget(map, position, direction);
		let hitPlayed = false;

		let [x, y] = position;
		for (let i=0;i<distance;i++) {
			x += direction[0];
			y += direction[1];

			if (target && !hitPlayed && (distance-i) < 10) {
				sfx.play("bazooka");
				hitPlayed = true;
			}

			map.setFX(x, y, visual);
			await sleep(50);
			map.setFX(x, y, null);
		}

		if (target) {
			log.add(`${target.name.article()} is hit!`);
			await explode(map, [x, y], 2, this);
		} else {
			log.add("it flies away.");
		}

		return true;
	}
}

function getTarget(map: Map, position: number[], direction: number[]) {
	let [x, y] = position;
	let distance = 0;

	while (true) {
		x += direction[0];
		y += direction[1];

		if (!map.isPositionValid(x, y)) { return {target:null, distance}; }

		distance++;

		let being = map.getBeing(x, y);
		if (being) { return {target:being, distance}; }

		let item = map.getItem(x, y);
		if (item && item.blocksBazooka) { return {target:item, distance}; }
	}
}


function sleep(ms: number) { return new Promise<void>(resolve => setTimeout(resolve, ms)); }
