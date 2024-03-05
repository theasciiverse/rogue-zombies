import Dialog from "./dialog.js";


export default async function help() {
	let dialog = new Dialog("Help!");

	dialog.addKey({id: "", key: "Escape"});
	dialog.addKey({id: "one", key: "1"});

	let result = await dialog.show();
}
