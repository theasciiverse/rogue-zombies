import Dialog from "./dialog.js";


export default async function gameOver(score: number) {
	let dialog = new Dialog("Game over!");

	dialog.append("Your score: ", String(score));

	dialog.addKey({id: "", key: "Escape"});
	dialog.addKey({id: "one", key: "1"});

	await dialog.show();
}
