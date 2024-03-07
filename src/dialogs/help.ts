import Dialog from "./dialog.js";


export default async function help() {
	let dialog = new Dialog("Help!");

	let div = document.createElement("div");
	div.innerHTML = HTML;
	dialog.append(div);

	dialog.addKey({id: "", key: "Escape"});
	await dialog.show();
}

const HTML = `
<ul>
<li>Move around using arrow keys, numpad or vi-keys. Skip a turn by pressing spacebar, dot or numpad-5.
Items can be used by pressing the corresponding number key.</li>

<li>Kill zombies to earn money. Use money to buy items (press <kbd>I</kbd> to open the item shop).</li>

<li>Zombies are not spawning until you start the game with the <kbd>S</kbd> key. Once you start the invasion, there is no going back!</li>
</ul>

<p>Press <kbd>escape</kbd> to continue</p>
`;