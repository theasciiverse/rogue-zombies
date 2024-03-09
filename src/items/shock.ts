import Item from "./item.js";
import Zombie from "../beings/zombie.js";
import Map from "../map.js";
import * as log from "../log.js";
import * as sfx from "../sfx.js";
import * as colors from "../colors.js";
import DIRS from "../dirs.js";


export default class Shock extends Item {
	readonly visual = {};

	static Name = "electric shock";
	static description = "Electrocutes a nearby zombie, jumps to neighboring zombies.";

	async use(position: number[], direction: number[]) {
		const { map } = this;

		let tx = position[0] + direction[0];
		let ty = position[1] + direction[1];
		let being = map.getBeing(tx, ty);

		if (!(being instanceof Zombie)) {
			log.add(`Cannot use ${this.name}: there is no zombie in that direction!`);
			return false;
		}

		await useAtBeing(map, being, this);

		return true;
	}
}

async function useAtBeing(map: Map, being: Zombie, source: Item) {
	sfx.play("fence");
	log.add("You electrocute a zombie...");

	let processed: Zombie[] = [];
	let queue: Zombie[] = [being];

	while (queue.length > 0) {
		let being = queue.shift()!;
		const { visual, position } = being;

		visual.fg = colors.SHOCK;
		map.changed(being);
		await sleep(50);
		being.damage(source);
		processed.push(being);

		DIRS.forEach(dir => {
			let being = map.getBeing(position[0] + dir[0], position[1] + dir[1]);
			if (!being) { return; }

			if (!(being instanceof Zombie)) { return; }

			if (queue.includes(being) || processed.includes(being)) { return; }
			queue.push(being);
		});
	}
}


function sleep(ms: number) { return new Promise<void>(resolve => setTimeout(resolve, ms)); }
