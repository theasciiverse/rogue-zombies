import Level, { Feature } from "./level.js";
import Renderer from "../renderer/renderer.js";
import Being from "../beings/being.js";
import Map from "../map.js";
import shop from "../dialogs/shop.js";
import * as sfx from "../sfx.js";
import tutorial1 from "../dialogs/tutorial-1.js";
import tutorial2 from "../dialogs/tutorial-2.js";
import tutorial3 from "../dialogs/tutorial-3.js";
import tutorial4 from "../dialogs/tutorial-4.js";


type Phase = "movement" | "buying" | "using" | "starting";


export default class Tutorial extends Level {
	static Name = "Tutorial";
	static description = "Learn controls and concepts. Improve your de-zombification skills. Every game needs a tutorial.";
	protected phase: Phase = "movement";

	constructor(renderer: Renderer) {
		super(renderer);

		const { map, player, zombies } = this;

		player.position = [5, map.height-5];
		map.addBeing(player);

		zombies.spawnAt(map.width-10, 10);
	}

	isAllowed(feature: Feature) {
		if (feature == "spawn") { return false; } // no auto-spawn: tutorial has explicit spawns

		if (feature == "start") {
			if (this.phase != "starting") { return false; }
		}

		return super.isAllowed(feature);
	}

	async play() {
		await this.help(); // tutorial1
		return super.play();
	}

	start() {
		const { map, zombies } = this;
		map.getCorners().forEach(pos => {
			pos = getFreePosition(map, pos);
			zombies.spawnAt(pos[0], pos[1]);
		});

		super.start();
	}


	help() {
		sfx.play("ping");
		switch (this.phase) {
			case "movement": return tutorial1();
			case "buying": return tutorial2();
			case "using": return tutorial3();
			case "starting": return tutorial4();
		}
	}

	async shop() {
		const { player, zombies, map } = this;
		await shop(player, {only:"rake"});

		if (player.getItem("rake") > 0 && this.phase == "buying") {
			this.phase = "using";
			await sleep(1000);
			let pos = getDistantCorner(map, player);
			zombies.spawnAt(pos[0], pos[1]);
			await this.help(); // tutorial3
		}
	}

	protected async playRound() {
		if (this.score == 1 && this.phase == "movement") {
			this.phase = "buying";
			await sleep(1000);
			await this.help(); // tutorial2
		}

		if (this.score == 2 && this.phase == "using") {
			this.phase = "starting";
			await sleep(1000);
			await this.help(); // tutorial4
		}

		return super.playRound();
	}

	protected get done() { return (this.player.hp <= 0 || this.score == 6); }
}

function sleep(ms: number) { return new Promise<void>(resolve => setTimeout(resolve, ms)); }

function getDistantCorner(map: Map, player: Being) {
	let corners = map.getCorners();
	let ppos = player.position;
	corners.sort((a, b) => ppos.distance(b) - ppos.distance(a));
	return corners[0];
}

function getFreePosition(map: Map, position: number[]) {
	let [x, y] = position;
	while (true) {
		let being = map.getBeing(x, y);
		if (!being) { return [x, y]; }

		x += 2 * (x < map.width/2 ? 1 : -1);
		y += 2 * (y < map.height/2 ? 1 : -1);
	}
}
