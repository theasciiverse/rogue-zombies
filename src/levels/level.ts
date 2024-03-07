import Player from "../beings/player.js";
import Zombies from "../zombies.js";
import Map from "../map.js";
import Renderer from "../renderer/renderer.js";
import * as log from "../log.js";
import * as status from "../status.js";
import * as metrics from "../metrics.js";
import * as river from "../terrain/river.js";
import * as forest from "../terrain/forest.js";
import * as house from "../terrain/house.js";
import gameOver from "../dialogs/gameover.js";
import help from "../dialogs/help.js";
import shop from "../dialogs/shop.js";
import { randomInt } from "../random.js";


const ZOMBIE_MOVE_CHANCE = 0.5;
export type Feature = "shop" | "start" | "score" | "spawn";

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

		this.setupTerrain();
		this.updateStatus();
	}

	get zombieMoveChance()  { return ZOMBIE_MOVE_CHANCE; }

	isAllowed(feature: Feature) {
		switch (feature) {
			case "shop": return true;
			case "start": return !this._started;
			case "score": return this._started;
			case "spawn": return this._started;
		}
	}

	get initialMoney() { return 0; }
	get rounds() { return this._rounds; } // chce znat status
	get score() { return this._score; } // chce znat gameOver a status
	protected get done() { return (this.player.hp <= 0); }

	shop() { return shop(this.player); }

	help() { return help(); }

	increaseScore() {
		this._score++;
		this.player.money++;
	}

	start() {
		this._started = true;
		this.updateStatus();
	}

	updateStatus() { status.update(this); }

	async play() {
		while (!this.done) {
			await this.playRound();
		}
		await gameOver(this);
	}

	protected async playRound() {
		const { player, zombies } = this;

		this._rounds++;
		this.updateStatus();

		await player.play();
		await zombies.play();
		await log.flush();
	}

	protected setupTerrain() {
		const { map, player } = this;

		let riverIndex = randomInt(0, 3);
		river.create(map, riverIndex);

		let forestIndex = (riverIndex + 2) % 4;
		forest.create(map, forestIndex);

		let center = house.create(map);
		player.position = center;
		map.addBeing(player);
	}
}
