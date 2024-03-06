import Level from "./level.js";
import Renderer from "../renderer/renderer.js";


export default class Sandbox extends Level {
	static Name = "Sandbox";
	static description = "unlimited resources, unlimited carnage";

	constructor(renderer: Renderer) {
		super(renderer);

		const { player } = this;

		player.setItem("rake", Infinity);
		player.setItem("barricade", Infinity);
		player.setItem("trap", Infinity);
		player.setItem("mine", Infinity);
		player.setItem("bazooka", Infinity);
		player.setItem("wire", Infinity);
		player.setItem("fence", Infinity);
	}

	get buyingAllowed() { return false; }
}
