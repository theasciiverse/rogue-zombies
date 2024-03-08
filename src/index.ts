import "./prototype.js";
import * as metrics from "./metrics.js";
import * as sfx from "./sfx.js";
import * as status from "./status.js";
import * as log from "./log.js";
import welcome from "./dialogs/welcome.js";
import pickLevel from "./dialogs/levels.js";

import Combo from "./renderer/combo.js";
import Canvas from "./renderer/canvas.js";
import DOM from "./renderer/dom.js";

import Ctor from "./levels/regular.js"


async function run() {
	let RCtor = Combo;
	let main = document.querySelector("main")!;

	await metrics.init([43, 30], RCtor);
	sfx.init();

//	await welcome();

	while (true) {
//		let Ctor = await pickLevel();
		status.reset();
		log.clear();

		let renderer = new RCtor();
		main.replaceChildren(renderer.node, status.node, log.node);
		await new Ctor(renderer).play();
		main.replaceChildren();
	}
}

run();
