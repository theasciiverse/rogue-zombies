import Player from "./beings/player.js";
import Zombie from "./beings/zombie.js";
import Map from "./map.js";
import * as rules from "./rules.js";
import * as sfx from "./sfx.js";


export default class Zombies {
	protected zombies: Zombie[] = [];
	protected rounds = 0;
	protected spawnPotential = 1;

	constructor(protected map: Map, protected player: Player) {
	}

	async play() {
		const { zombies, player } = this;
		this.rounds++;

		let activeZombies = zombies.filter(_ => Math.random() > rules.ZOMBIE_MOVE_CHANCE);
		// FIXME: sort podle vzdalenosti od hrace
		for (let i=0; i<activeZombies.length;i++) {
			await activeZombies[i].play(player);
		}

		let spawnPotential = this.updateSpawnPotential();
		if (spawnPotential >= 1) {
			let amount = Math.floor(this.spawnPotential);
			this.spawnPotential -= amount;
			this.spawn(amount);
		}
	}

	remove(zombie: Zombie) {
		this.player.money++;
		this.zombies = this.zombies.filter(z => z != zombie);
	}

	protected spawn(amount: number) {
		const { zombies, map } = this;
		sfx.play("zombie-spawn");

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
