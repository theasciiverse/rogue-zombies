import Dialog from "./dialog.js";


export default function welcome() {
	let dialog = new Dialog("Rogue Zombies");

	let node = document.createElement("div");
	node.innerHTML = HTML;
	dialog.append(node);

	dialog.addKey({id: "", code: "Space"});

	return dialog.show();
}

let HTML = `
	<p>Welcome! Hordes of zombies are drawing nearby, and you are the only one who can stop them. The time has come to arm yourself and prepare for the worst.</p>
	<p>A bit of warning: this is a roguelike game created for the 2024 7DRL challenge. It may contain bugs, surprising UI/UX and possibly even a lutefisk. You can find more details at the <a href="https://github.com/ondras/roguezombies">game's GitHub repository</a>.</p>
	<p>Recommendations:</p>
	<ul>
		<li>browser window size of at least 800×600 pixels</li>
		<li>audio on (game uses sound effects)</li>
		<li>background music (<a href="https://www.youtube.com/playlist?list=PLGC-s5wU_PFRiFxj0oAcjX-irpNnuE8dH">suitable YouTube playlist</a>)</li>
	</ul>
	<p>Press <kbd>space</kbd> to start the game!</p>
`;
