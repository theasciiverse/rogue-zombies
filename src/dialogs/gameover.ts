import Dialog from "./dialog.js";


export default async function gameOver(score: number) {
	let dialog = new Dialog("Game over!");

	let p1 = document.createElement("p");
	p1.innerHTML = "Game over! The zombies have eaten your brains.";

	let p2 = document.createElement("p");
	p2.innerHTML = `Your score: <span class="score">${score}</span>`;

	let p3 = document.createElement("p");
	p3.innerHTML = `Press <kbd>space</kbd> to return to the main menu.`;

	dialog.append(p1, p2, p3);

	dialog.addKey({id: "", code: "Space"});
	await dialog.show();
}
