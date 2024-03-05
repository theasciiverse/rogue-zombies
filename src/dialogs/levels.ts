/*

Tutorial: basic controls and concepts
Home defense: regular run
???: ???
Sandbox: unlimited resources

*/

import Dialog from "./dialog.js";
import Level from "../levels/level.js";

const MODES = [
	{ id: "tutorial", name: "Tutorial: basic controls and concepts", Ctor: Level },
]


export default async function pickLevel() {
	let dialog = new Dialog("Game mode selection");

	MODES.forEach((mode, i) => {
		dialog.append(mode.name);
		dialog.addKey({id: mode.id, code: `Numpad${i+1}`});
		dialog.addKey({id: mode.id, code: `Digit${i+1}`});
	});

	let id = await dialog.show();
	return MODES.find(mode => mode.id == id).Ctor;
}
