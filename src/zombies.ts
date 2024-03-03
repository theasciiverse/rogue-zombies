import Player from "./beings/player.js";
import Zombie from "./beings/zombie.js";
import Map from "./map.js";


export default class Zombies {
	protected zombies: Zombie[] = [];
	protected rounds = 0;
	protected spawnPotential = 1;

	constructor(protected map: Map, protected player: Player) {
	}

	play() {
		this.rounds++;

		let spawnPotential = this.updateSpawnPotential();
		if (spawnPotential >= 1) {
			let amount = Math.floor(this.spawnPotential);
			this.spawnPotential -= amount;
			this.spawn(amount);
		}
	}

	protected spawn(amount: number) {
		const { zombies, map } = this;
		console.log("spawning", amount);

		let corners = getCorners(map);
		for (let i=0;i<amount;i++) {
			let corner = corners.random();
			let zombie = new Zombie(map);
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