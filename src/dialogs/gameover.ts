import Dialog from "./dialog.js";
import Level from "../levels/level.js";


export default async function gameOver(level: Level) {
	let dialog = new Dialog("Game over!");

	let p1 = document.createElement("p");
	p1.innerHTML = "Game over! The zombies have eaten your brains.";

	let p2 = document.createElement("p");
	let Ctor = level.constructor as typeof Level;
	p2.innerHTML = `Your score (${Ctor.Name}): <span class="score">${level.score}</span>`;

	let p3 = document.createElement("p");
	p3.innerHTML = `Press <kbd>space</kbd> to return to the main menu.`;

	dialog.append(p1, p2, p3);

	dialog.addKey({id: "", code: "Space"});
	await dialog.show();
}
