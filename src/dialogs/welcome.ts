import Dialog from "./dialog.js";


export default function welcome() {
	let dialog = new Dialog("Rogue Zombies");

	let ps = HTML.map(html => {
		let p = document.createElement("p");
		p.innerHTML = html;
		return p;
	});
	dialog.append(...ps)

	dialog.addKey({id: "", code: "Space"});

	return dialog.show();
}

let HTML = [
	"Welcome! Hordes of zombies are drawing nearby, and you are the only one who can stop them. The time has come to arm yourself and prepare for the worst.",
	`A bit of warning: this is a roguelike game created for the 2024 7DRL challenge. It may contain bugs, surprising UI/UX and possibly even a lutefisk. You can find more details at the <a href="https://github.com/ondras/roguezombies">game's GitHub repository</a>.`,
	"Press <kbd>space</kbd> to start the game!"
];
