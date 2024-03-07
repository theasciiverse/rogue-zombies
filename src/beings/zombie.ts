import Entity from "../entity.js";
import Being from "./being.js";
import Item from "../items/item.js";
import Zombies from "../zombies.js";
import Map from "../map.js";
import DIRS from "../dirs.js"


const CHARS = ["z", "Z"];
const COLORS = ["DarkOliveGreen", "LightSlateGray", "Olive", "OliveDrab", "SaddleBrown", "GoldenRod", "DarkSeaGreen"];

type InvalidResult = { type: "invalid" };
type PlayerResult = { type: "player" };
type MoveResult = { type: "move", dist: number, position: number[], item?: Item };
type ItemResult = { type: "item", dist: number, item: Item };
type MovementResult = InvalidResult | PlayerResult | MoveResult | ItemResult;


export default class Zombie extends Being {
	readonly visual = {ch:CHARS.random(), fg:COLORS.random()};
	protected _name: string;

	constructor(map: Map, protected zombies: Zombies) {
		super(map);
		if (Math.random() < 0.01) {
			this._name = "zombie lutefisk";
		} else {
			this._name = (this.visual.ch == "z"? "zombie" : "large zombie");
		}
	}

	get name() { return this._name; }

	async play(player: Being) {
		const { position } = this;

		let results = DIRS.map(dir => {
			let x = position[0] + dir[0];
			let y = position[1] + dir[1];
			return this.getMovementResult(x, y, player);
		});

		let best = pickBestMovementResult(results);
		if (!best)  {return; }

		switch (best.type) {
			case "player": player.damage(this); break;
			case "item": best.item.damage(this); break;
			case "move":
				this.position = best.position;
				if (best.item) { await best.item.activate(this); }
			break;
		}
	}

	die(source: Entity) {
		super.die(source);
		this.zombies.remove(this);
	}

	protected getMovementResult(x: number, y: number, player: Being): MovementResult {
		const { map, position } = this;
		if (!map.isPositionValid(x, y)) { return {type:"invalid"}; } // out of area


		let being = map.getBeing(x, y);
		if (being) { // surrounding zombies are ignored, player is immediately attacked
			let type = (being == player ? "player" : "invalid");
			return {type} as MovementResult;
		}

		let currentDistance = player.position.distance(position);
		let dist = player.position.distance([x, y]);
		if (dist > currentDistance) { return {type:"invalid"}; } // pohorsime si

		let item = map.getItem(x, y);

		if (item) {
			if (item.blocks) {
				if (item.destructible) {
					return {type:"item", dist, item};
				} else {
					return {type:"invalid"};
				}
			} else {
				return {type:"move", dist, position:[x, y], item};
			}
		} else {
			return {type:"move", dist, position:[x, y]};
		}
	}
}

function pickBestMovementResult(results: MovementResult[]) {
	let valid = results.filter(r => r.type != "invalid");
	if (!valid.length) { return null; }

	let player = valid.find(r => r.type == "player");
	if (player) { return player; }

	let moves = valid.filter(r => r.type == "move") as MoveResult[];
	if (moves.length > 0) { return pickBestDistanceResult(moves); }

	let items = valid.filter(r => r.type == "item") as ItemResult[];
	return pickBestDistanceResult(items);
}

function pickBestDistanceResult(results: (MoveResult | ItemResult)[]) {
	let distances = results.map(r => r.dist);
	let best = Math.min(...distances);
	return results.filter(r => r.dist == best).random();
}

