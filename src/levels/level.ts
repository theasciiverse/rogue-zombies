import Player from "../beings/player.js";
import Zombies from "../zombies.js";

import Map from "../map.js";
import Renderer from "../renderer/renderer.js";
import House from "../items/house.js";
import * as log from "../log.js";
import * as status from "../status.js";
import * as metrics from "../metrics.js";
import gameOver from "../dialogs/gameover.js";


const ZOMBIE_MOVE_CHANCE = 0.5;

export default class Level {
	static Name = "???";
	static description = "???";

	readonly player: Player; // chteji znat zombies a status
	readonly map: Map; // chce znat player a zombies
	protected zombies: Zombies;
	protected _started = false;
	protected _score = 0;
	protected _rounds = 0;

	constructor(renderer: Renderer) {
		let map = new Map(metrics.tileCount[0], metrics.tileCount[1], renderer);
		this.map = map;

		let zombies = new Zombies(this);
		this.zombies = zombies;

		let player = new Player(this);
		this.player = player;

		player.position = [15,15];
		map.addBeing(player);

		[
			new House(map, 10, 10),
			new House(map, 11, 10),
			new House(map, 12, 10),
			new House(map, 12, 11)
		].forEach(h => map.addItem(h));

		this.updateStatus();
	}

	get zombieMoveChance()  { return ZOMBIE_MOVE_CHANCE; }
	get buyingAllowed() { return true; }
	get canBeStarted() { return !this._started; }
	get started() { return this._started; }

	start() {
		this._started = true;
		this.updateStatus();
	}

	updateStatus() { status.update(this); }

	get rounds() { return this._rounds; } // chce znat status
	get score() { return this._score; } // chce znat gameOver a status
	increaseScore() {
		this._score++;
		this.player.money++;
	}

	async play() {
		const { player, zombies } = this;

		while (!this.done) {
			this._rounds++;
			this.updateStatus();

			await player.play();
			await zombies.play();
			await log.flush();
		}

		await gameOver(this);
	}

	protected get done() { return (this.player.hp <= 0); }
}
