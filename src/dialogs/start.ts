import Dialog from "./dialog.js";


export default async function start() {
	let dialog = new Dialog("Start the zombie invasion?");
	dialog.addKey({id:"", key: "Escape"});
	dialog.addKey({id:"ok", code: "Space"});

	let info = document.createElement("p");
	info.innerHTML = HTML;
	dialog.append(info);

	let result = await dialog.show();
	return (result == "ok");
}

const HTML = `
If you want to start the zombie invasion, press <kbd>space</kbd>.
Zombies will slowly start spawning (you can still buy stuff).
Otherwise, press <kbd>esc</kbd> to exit.
`