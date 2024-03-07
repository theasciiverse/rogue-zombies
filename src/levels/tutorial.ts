import Level, { Feature } from "./level.js";
import Being from "../beings/being.js";
import Tree from "../items/tree.js";
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

	protected setupTerrain() {
		const { map, player } = this;

		for (let i=0; i<map.width; i++) {
			for (let j=0; j<map.height; j++) {
				if (i == 0 || j == 0 || i == map.width-1 || j == map.height-1) {
					let tree = new Tree(map, i, j);
					map.addItem(tree);
				}
			}
		}

		player.position = [5, map.height-5];
		map.addBeing(player);
	}

	isAllowed(feature: Feature) {
		if (feature == "spawn") { return false; } // no auto-spawn: tutorial has explicit spawns

		if (feature == "start") {
			if (this.phase != "starting") { return false; }
		}

		return super.isAllowed(feature);
	}

	protected get done() { return (this.player.hp <= 0 || this.score == 6); }

	async play() {
		await this.changePhase("movement");
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
		switch (this.phase) {
			case "movement": return tutorial1();
			case "buying": return tutorial2();
			case "using": return tutorial3();
			case "starting": return tutorial4();
		}
	}

	async shop() {
		const { player } = this;
		await shop(player, {only:"rake"});

		if (player.getItem("rake") > 0 && this.phase == "buying") {
			await this.changePhase("using");
		}
	}

	protected async playRound() {
		if (this.score == 1 && this.phase == "movement") {
			await this.changePhase("buying");
		}

		if (this.score == 2 && this.phase == "using") {
			await this.changePhase("starting");
		}

		return super.playRound();
	}

	protected async changePhase(phase: Phase) {
		const { player, zombies, map } = this;

		this.phase = phase;
		await sleep(1000);

		switch (phase) {
			case "movement":
				zombies.spawnAt(map.width-10, 10);
			break;

			case "using":
				let pos = getDistantCorner(map, player);
				zombies.spawnAt(pos[0], pos[1]);
			break;
		}

		sfx.play("ping");
		await this.help();
	}
}

function sleep(ms: number) { return new Promise<void>(resolve => setTimeout(resolve, ms)); }

function getDistantCorner(map: Map, player: Being) {
	let corners = map.getCorners();
	let ppos = player.position;
	corners.sort((a, b) => ppos.distance(b) - ppos.distance(a));
	return getFreePosition(map, corners[0]);
}

function getFreePosition(map: Map, position: number[]) {
	let [x, y] = position;
	while (true) {
		let being = map.getBeing(x, y);
		let item = map.getItem(x, y);
		if (!being && !item) { return [x, y]; }

		x += 2 * (x < map.width/2 ? 1 : -1);
		y += 2 * (y < map.height/2 ? 1 : -1);
	}
}
