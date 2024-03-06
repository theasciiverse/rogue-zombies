import Level from "./level.js";
import Renderer from "../renderer/renderer.js";
import House from "../items/house.js";


export default class Regular extends Level {
	static Name = "Regular";
	static description = "Survive for as long as possible. Limited starting resources, unlimited zombies."

	constructor(renderer: Renderer) {
		super(renderer);

		const { map, player } = this;

		player.position = [15,15];
		map.addBeing(player);

		[
			new House(map, 10, 10),
			new House(map, 11, 10),
			new House(map, 12, 10),
			new House(map, 12, 11)
		].forEach(h => map.addItem(h));
	}

	get initialMoney() { return 10; }
}
