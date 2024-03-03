import Being from "./beings/being.js";
import Item from "./items/item.js";
import Zombie from "./beings/zombie.js";
import Map from "./map.js";
import * as rules from "./rules.js";


export default class Zombies {
	protected zombies: Zombie[] = [];
	protected rounds = 0;
	protected spawnPotential = 1;

	constructor(protected map: Map, protected player: Being) {
	}

	play() {
		const { zombies, player } = this;
		this.rounds++;

		let activeZombies = zombies.filter(_ => Math.random() > rules.ZOMBIE_MOVE_CHANCE);
		// FIXME: sort podle vzdalenosti od hrace
		activeZombies.forEach(z => z.play(player));

		let spawnPotential = this.updateSpawnPotential();
		if (spawnPotential >= 1) {
			let amount = Math.floor(this.spawnPotential);
			this.spawnPotential -= amount;
			this.spawn(amount);
		}
	}

	kill(zombie: Zombie, source: Being | Item) {
		const { map } = this;

		console.log("zombie", zombie, "killed by", source);

		// FIXME adjust money

		this.zombies = this.zombies.filter(z => z != zombie);

		map.removeBeing(zombie);
		let corpse = zombie.toCorpse();
		map.setBackground(zombie.position[0], zombie.position[1], corpse);
	}

	protected spawn(amount: number) {
		const { zombies, map } = this;
		console.log("spawning", amount);

		let corners = getCorners(map);
		for (let i=0;i<amount;i++) {
			let corner = corners.random();
			let zombie = new Zombie(map, this);
			zombie.position = corner.slice();
			zombies.push(zombie);
			map.addBeing(zombie);
		}
	}

	protected updateSpawnPotential() {
		this.spawnPotential += Math.pow(this.rounds, 0.8) / 30; // fixme rules
		return this.spawnPotential;
	}
}

function getCorners(map: Map) {
	const { width, height } = map;
	return [
		[0, 0],
		[width-1, 0],
		[width-1, height-1],
		[0, height-1]
	];
}
