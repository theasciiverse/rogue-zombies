import Level from "./level.js";


const TURNS = 300; // FIXME vyladit pocet

export default class Hope extends Level {
	static Name = "Hope";
	static description = `Survive for ${TURNS} turns.`;

	get initialMoney() { return 10; }

	protected get done() { return (this.player.hp <= 0 || this._rounds >= TURNS); }
}
