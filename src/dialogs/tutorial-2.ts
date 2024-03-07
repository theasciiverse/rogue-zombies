import Dialog from "./dialog.js";


export default async function tutorial2() {
	let dialog = new Dialog("Tutorial #2");

	let node = document.createElement("div");
	node.innerHTML = HTML;
	dialog.append(node);

	dialog.addKey({id: "", code: "Escape"});

	await dialog.show();
}

const HTML = `
<p>Good job! No more zombies in sight. Also, by killing the zombie, you earned your first money.</p>
<p>Of course, fighting zombies by <em>bumping</em> into them would not work for long.
The best way to combat these undead folks is by using <strong>items</strong>.
When in the game, you can always open the item shop with the <kbd>I</kbd> key.</p>
<p>It would be wise to try that out now. Press <kbd>esc</kbd> to continue and use the earned money to buy <strong>a rake</strong>.</p>
`;
