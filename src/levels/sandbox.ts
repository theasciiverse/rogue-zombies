import Level, { Feature } from "./level.js";
import Renderer from "../renderer/renderer.js";


export default class Sandbox extends Level {
	static Name = "Sandbox";
	static description = "Unlimited resources, unlimited carnage";

	constructor(renderer: Renderer) {
		super(renderer);

		const { player } = this;
		player.setItem("rake", Infinity);
		player.setItem("barrier", Infinity);
		player.setItem("trap", Infinity);
		player.setItem("mine", Infinity);
		player.setItem("bazooka", Infinity);
		player.setItem("wire", Infinity);
		player.setItem("fence", Infinity);
		player.setItem("shock", Infinity);
	}

	isAllowed(feature: Feature) {
		if (feature == "shop") { return false; }
		return super.isAllowed(feature);
	}
}
