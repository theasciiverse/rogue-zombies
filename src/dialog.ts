import * as keyboard from "./keyboard.js";
import Player from "./beings/player.js";
import { ITEMS, ItemTemplate } from "./items/db.js"


interface Key {
	id: string;
	key?: string;
	code?: string;
}

export default class Dialog {
	protected dialog = document.createElement("dialog");
	protected resolve: (value: string | null) => void;
	protected keys: Key[] = [];

	append(...nodes: (string | Node)[]) {
		this.dialog.append(...nodes);
	}

	async show() {
		const { dialog } = this;
		document.body.append(dialog)
		dialog.showModal();

		while (true) {
			let event = await keyboard.readKey();
			if (event.key == "Escape") { event.preventDefault(); } // do not close dialog

			let id = this.matchKeyEvent(event);
			if (id !== null) {
				dialog.close();
				dialog.remove();
				return id;
			}
		}
	}

	addKey(key: Key) {
		this.keys.push(key);
	}

	protected matchKeyEvent(event: KeyboardEvent) {
		let key = this.keys.find(key => {
			if ("key" in key && key.key != event.key) { return false; }
			if ("code" in key && key.code != event.code) { return false; }
			return true;
		});

		return (key ? key.id : null);
	}
}

export async function help() {
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

export async function buy(player: Player) {
	while (true) {
		let dialog = new Dialog();
		dialog.addKey({id:"", key: "Escape"});

		let table = buildItemTable(player, dialog);
		dialog.append("Buy", table);

		let result = await dialog.show();

		if (result == "") {
			break;
		} else {
			console.log("buy", result);
//			player.setItem(result, player.getItem(result)+1);
		}
	}
}

function buildItemTable(player: Player, dialog: Dialog) {
	let table = document.createElement("table");

	let rows = ITEMS.map(def => buildItemRow(def, player, dialog));
	table.append(...rows);
	return table;
}

function buildItemRow(item: ItemTemplate, player: Player, dialog: Dialog) {
	let row = document.createElement("tr");
	let disabled = (item.price > player.money);
	row.classList.toggle("disabled", disabled);

	let key = row.insertCell();
	key.textContent = item.key;

	row.insertCell().textContent = item.id;

	if (!disabled) {
		dialog.addKey({id: item.id, code: `Numpad${item.key}`});
		dialog.addKey({id: item.id, code: `Digit${item.key}`});
	}

	return row;
}


// 1 Crow(3)  2 Barr(3)  3 Rake(4)  4 Mine(2)  5 Bazoo(6x)  6 Wire(6x)  7 El.fence(15)
