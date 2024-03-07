import Dialog from "./dialog.js";


export default async function tutorial4() {
	let dialog = new Dialog("Tutorial #4");

	let node = document.createElement("div");
	node.innerHTML = HTML;
	dialog.append(node);

	dialog.addKey({id: "", code: "Escape"});

	await dialog.show();
}

const HTML = `
<p>The tutorial is almost over. You can move around and kill zombies with stuff - like a boss.
The Sandbox game mode is a good way to familiarize yourself with other items that can be bought.</p>
<p>In a typical game, you start in preparation phase in order to buy items and organize your defenses.
The real heat is then started by pressing the <kbd>FIXME</kbd> key. This is where the action begins.</p>
<p>In this tutorial, only four more zombies will spawn once you do that. Press <kbd>esc</kbd> and start the invasion when ready.</p>
`;
