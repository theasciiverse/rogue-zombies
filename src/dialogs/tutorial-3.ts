import Dialog from "./dialog.js";


export default async function tutorial3() {
	let dialog = new Dialog("Tutorial #3");

	let node = document.createElement("div");
	node.innerHTML = HTML;
	dialog.append(node);

	dialog.addKey({id: "", code: "Escape"});

	await dialog.show();
}

const HTML = `
<p>Your inventory is displayed below the map. Available items can be used by pressing the corresponding number key.</p>
<p>As you can see, another zombie has spawned. This might be a good time to use those rakes you just bought.</p>
<p>A rake is your basic trap item: you place it on the ground (on one of your eight neighboring blocks) and wait for a zombie to step on it.
When that happens, both the zombie and the rake get destroyed.</p>
<p>Press <kbd>esc</kbd> to continue and get rid of the zombie.</p>
`;
