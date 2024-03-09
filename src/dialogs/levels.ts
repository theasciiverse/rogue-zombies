import Dialog from "./dialog.js";
import Level from "../levels/level.js";
import Tutorial from "../levels/tutorial.js";
import Regular from "../levels/regular.js";
import Hope from "../levels/hope.js";
import Sandbox from "../levels/sandbox.js";


const Ctors: (typeof Level)[] = [ Tutorial, Regular, Hope, Sandbox ];

export default async function pickLevel() {
	let dialog = new Dialog("Game mode selection");

	let p = document.createElement("p");
	p.textContent = "Please pick a game mode to use by pressing the corresponding number key.";
	dialog.append(p);

	let dl = document.createElement("dl");
	dialog.append(dl);

	Ctors.forEach((Ctor, i) => {
		let dt = document.createElement("dt");
		let kbd = document.createElement("kbd");
		kbd.textContent = String(i+1);
		dt.append(kbd, " ", Ctor.Name);

		let dd = document.createElement("dd");
		dd.textContent = Ctor.description;

		dl.append(dt, dd);
		dialog.addKey({id: Ctor.Name, code: `Numpad${i+1}`});
		dialog.addKey({id: Ctor.Name, code: `Digit${i+1}`});
	});

	let id = await dialog.show();
	return Ctors.find(Ctor => Ctor.Name == id)!;
}
