import Item from "./item.js";
import Entity from "../entity.js";
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

		let tx = position[0];
		let ty = position[1];
		while (true) {
			tx += direction[0];
			ty += direction[1];

			if (!map.isPositionValid(tx, ty)) {
				log.add("it flies away.");
				break;
			}

			let being = map.getBeing(tx, ty);
			let item = map.getItem(tx, ty);
			let target: Entity;
			if (being) {
				target = being;
			} else if (item && item.blocksBazooka) {
				target = item;
			}

			if (target) {  // hit!
				log.add(`${target.name.article()} is hit!`);
				sfx.play("bazooka"); // fixme play earlier
				await explode(map, [tx, ty], 2, this);
				break;
			} else {  // fly further
				map.setFX(tx, ty, visual);
				await sleep(50);
				map.setFX(tx, ty, null);
			}
		}

		return true;
	}
}

function sleep(ms: number) { return new Promise<void>(resolve => setTimeout(resolve, ms)); }
