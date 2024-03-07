import Zombie from "./beings/zombie.js";
import Map from "./map.js";
import Level from "./levels/level.js";
import * as sfx from "./sfx.js";


export default class Zombies {
	protected zombies: Zombie[] = [];
	protected rounds = 0;
	protected spawnPotential = 1;

	constructor(protected level: Level) {
	}

	async play() {
		const { zombies, level } = this;
		const ppos = level.player.position;

		let activeZombies = zombies.filter(_ => Math.random() > level.zombieMoveChance);

		// podle vzdalenosti od hrace, nejblizsi se hybou jako prvni
		activeZombies.sort((a, b) => a.position.distance(ppos) - b.position.distance(ppos));
		console.log(activeZombies);

		for (let i=0; i<activeZombies.length;i++) {
			await activeZombies[i].play(level.player);
		}

		if (level.isAllowed("spawn")) { // spawn logic
			this.rounds++;
			let spawnPotential = this.updateSpawnPotential();
			if (spawnPotential >= 1) {
				let amount = Math.floor(this.spawnPotential);
				this.spawnPotential -= amount;
				this.spawn(amount);
			}
		}
	}

	remove(zombie: Zombie) {
		this.level.increaseScore();
		this.zombies = this.zombies.filter(z => z != zombie);
	}

	spawnAt(x: number, y: number) {
		const { level, zombies } = this;
		const { map } = level;

		let zombie = new Zombie(map, this);
		zombie.position = [x, y]
		zombies.push(zombie);
		map.addBeing(zombie);
	}

	protected spawn(amount: number) {
		const { map } = this.level;

		sfx.play("zombie-spawn");

		let corners = map.getCorners();
		for (let i=0;i<amount;i++) {
			let corner = corners.random();
			this.spawnAt(corner[0], corner[1]);
		}
	}

	protected updateSpawnPotential() {
		this.spawnPotential += Math.pow(this.rounds, 0.8) / 30; // fixme rules
		return this.spawnPotential;
	}
}
