import Dialog from "./dialog.js";


export default async function help() {
	while (true) {
		let html = "Help!";
		let dialog = new Dialog();
		dialog.append(html);

		dialog.addKey({id: "", key: "Escape"});
		dialog.addKey({id: "one", key: "1"});

		let result = await dialog.show();
		console.log("dialog", result);
		if (result == "") { break; }
	}
}
