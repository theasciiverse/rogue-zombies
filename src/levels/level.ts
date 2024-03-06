import Player from "../beings/player.js";
import Zombies from "../zombies.js";

import Map from "../map.js";
import Renderer from "../renderer/renderer.js";
import House from "../items/house.js";
import * as log from "../log.js";
import * as status from "../status.js";
import * as metrics from "../metrics.js";
import gameOver from "../dialogs/gameover.js";


export default class Level {
	static Name = "???";
	static description = "???";

	readonly player: Player; // chteji znat zombies a status
	readonly map: Map; // chce znat player a zombies
	protected zombies: Zombies;
	protected started = false;
	protected _score = 0;

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

	get buyingAllowed() { return true; }
	get canBeStarted() { return !this.started; }

	start() {
		this.started = true;
		this.updateStatus();
	}

	updateStatus() { status.update(this); }

	get score() { return this._score; } // chce znat gameOver a status
	increaseScore() {
		this._score++;
		this.player.money++;
	}

	async play() {
		const { player, zombies } = this;

		while (!this.done) {
			await player.play();
			if (this.started) { await zombies.play(); }
			await log.flush();
		}

		await gameOver(this);
	}

	protected get done() { return (this.player.hp <= 0); }
}
