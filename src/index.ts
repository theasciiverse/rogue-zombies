import "./prototype.js";
import * as metrics from "./metrics.js";
import * as sfx from "./sfx.js";
import welcome from "./dialogs/welcome.js";
import pickLevel from "./dialogs/levels.js";


async function run() {
	await metrics.init([43, 30]);
	sfx.init();

	let renderer = new metrics.Renderer();
	document.querySelector("main").prepend(renderer.node);

	await welcome();

	while (true) {
		let Ctor = await pickLevel()
		await new Ctor({renderer}).play();
	}
}

run();
