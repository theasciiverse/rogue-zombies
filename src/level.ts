import Player from "./beings/player.js";
import Zombies from "./zombies.js";

import Map from "./map.js";
import Renderer from "./renderer/renderer.js";
import House from "./items/house.js";


interface Config {
	Renderer: typeof Renderer;
}

export default class Level {
	protected player: Player;
	protected zombies: Zombies;
	protected renderer: Renderer;
	readonly map: Map;

	constructor(protected config: Config) {
		let size = [45, 30];

		let renderer = config.Renderer.withAreaLimit(size, [window.innerWidth*.9, window.innerHeight*.9], [0.7, 1.0])
		document.body.prepend(renderer.node);

		let map = new Map(size[0], size[1], renderer);
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
		this.renderer = renderer;
		console.log("tileSize", this.tileSize);
	}

	async play() {
		const { player, zombies } = this;

		while (!this.done) {
			await player.play();
			await zombies.play();
		}
	}

	get done() {
		return this.player.hp <= 0;
	}

	get tileSize() { return this.renderer.tileSize; }
}
