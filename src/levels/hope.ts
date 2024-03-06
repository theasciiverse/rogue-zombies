import Level from "./level.js";
import Renderer from "../renderer/renderer.js";


const TURNS = 100;

export default class Hope extends Level {
	static Name = "Hope";
	static description = `Survive for ${TURNS} turns.`;
}
