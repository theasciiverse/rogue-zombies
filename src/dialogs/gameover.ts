import Dialog from "./dialog.js";
import Level from "../levels/level.js";


export default async function gameOver(level: Level) {
	let dialog = new Dialog("Game over!");

	let p1 = document.createElement("p");
	p1.textContent = (level.player.hp > 0 ? ALIVE : DEAD);

	let p2 = document.createElement("p");
	let Ctor = level.constructor as typeof Level;
	p2.innerHTML = `Your score (${Ctor.Name}): survived for <strong>${level.rounds}</strong> rounds, killed <span class="score">${level.score}</span> zombies.`;

	let p3 = document.createElement("p");
	p3.innerHTML = `Press <kbd>space</kbd> to return to the main menu.`;

	dialog.append(p1, p2, p3);

	dialog.addKey({id: "", code: "Space"});
	await dialog.show();
}

const ALIVE = `The game is over!`;
const DEAD = `${ALIVE} The zombies have eaten your brains.`;
