import Dialog from "./dialog.js";


export default async function tutorial1() {
	let dialog = new Dialog("Tutorial #1");

	let node = document.createElement("div");
	node.innerHTML = HTML;
	dialog.append(node);

	dialog.addKey({id: "", code: "Escape"});

	await dialog.show();
}

const HTML = `
<p>Welcome to the Rogue Zombies tutorial! You can move around using arrow keys (←↓↑→), numpad or vi-keys (hjkl/yubn). It is possible and recommended to move diagonally as well.</p>
<p>There is a lone zombie nearby. You can kill it by <em>bumping</em> into it, i.e. by trying to move to the zombie's place. Do that right now!</p>
<p>Press <kbd>esc</kbd> to continue.</p>
`;
