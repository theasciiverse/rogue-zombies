import Level from "./level.js";


export default class Regular extends Level {
	static Name = "Regular";
	static description = "Survive for as long as possible. Limited starting resources, unlimited zombies."

	get initialMoney() { return 10; }
}
