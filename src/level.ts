import Player from "./beings/player.js";
import Zombies from "./zombies.js";

import Map from "./map.js";
import Renderer from "./renderer/renderer.js";
import House from "./items/house.js";
import * as log from "./log.js";


interface Config {
	renderer: Renderer;
	tileCount: number[];
}

export default class Level {
	protected player: Player;
	protected zombies: Zombies;
	protected renderer: Renderer;
	readonly map: Map;

	constructor(protected config: Config) {
		let map = new Map(config.tileCount[0], config.tileCount[1], config.renderer);
		let player = new Player(map);
		player.position = [15,15];
		map.addBeing(player);

		[
			new House(map, 10, 10),
			new House(map, 11, 10),
			new House(map, 12, 10),
			new House(map, 12, 11)
		].forEach(h => map.addItem(h));

		let zombies = new Zombies(map, player);

		this.map = map;
		this.player = player;
		this.zombies = zombies;
	}

	async play() {
		const { player, zombies } = this;

		while (!this.done) {
			await player.play();
			await zombies.play();
			await log.flush();
		}
	}

	get done() {
		return this.player.hp <= 0;
	}
}
