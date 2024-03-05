import Player from "../beings/player.js";
import Zombies from "../zombies.js";

import Map from "../map.js";
import Renderer from "../renderer/renderer.js";
import House from "../items/house.js";
import * as log from "../log.js";
import * as status from "../status.js";
import gameOver from "../dialogs/gameover.js";


interface Config {
	renderer: Renderer;
	tileCount: number[];
}

export default class Level {
	readonly player: Player;
	protected zombies: Zombies;
	protected renderer: Renderer;
	protected started = false;
	protected _score = 0;
	readonly map: Map;

	constructor(protected config: Config) {
		let map = new Map(config.tileCount[0], config.tileCount[1], config.renderer);
		this.map = map;

		let zombies = new Zombies(this);
		this.zombies = zombies;

		let player = new Player(this);
		this.player = player;

		player.setItem("rake", Infinity);
		player.setItem("barricade", 3);
		player.setItem("mine", Infinity);
		player.setItem("bazooka", Infinity);
		player.setItem("wire", Infinity);
		player.setItem("fence", Infinity);

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

	get canBeStarted() {
		return !this.started;
	}

	start() {
		this.started = true;
		this.updateStatus();
	}

	updateStatus() {
		status.update(this);
	}

	get score() { return this._score; }
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

		await gameOver(this.score);
	}

	protected get done() { return (this.player.hp <= 0); }
}
