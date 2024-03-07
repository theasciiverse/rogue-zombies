import Level, { Feature } from "./level.js";
import Renderer from "../renderer/renderer.js";
import * as river from "../terrain/river.js";


export default class Sandbox extends Level {
	static Name = "Sandbox";
	static description = "unlimited resources, unlimited carnage";

	constructor(renderer: Renderer) {
		super(renderer);

		const { map, player } = this;

		river.create(map);

		let x = Math.floor(map.width / 2);
		let y = Math.floor(map.height / 2);
		player.position = [x, y];
		map.addBeing(player);

		player.setItem("rake", Infinity);
		player.setItem("barricade", Infinity);
		player.setItem("trap", Infinity);
		player.setItem("mine", Infinity);
		player.setItem("bazooka", Infinity);
		player.setItem("wire", Infinity);
		player.setItem("fence", Infinity);
	}

	isAllowed(feature: Feature) {
		if (feature == "shop") { return false; }
		return super.isAllowed(feature);
	}
}

