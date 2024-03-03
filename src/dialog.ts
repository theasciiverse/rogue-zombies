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
		let dialog = new Dialog("Buy items");
		dialog.addKey({id:"", key: "Escape"});

		let table = buildItemTable(player, dialog);
		dialog.append("Buy", table);

		let result = await dialog.show();

		if (result == "") {
			break;
		} else {
			let it = ITEMS.find(it => it.id == result)!;
			let price = it.price;
			player.setItem(result, player.getItem(result)+it.amount);
			player.money -= price;
		}
	}
}

function buildItemTable(player: Player, dialog: Dialog) {
	let table = document.createElement("table");
	table.innerHTML = TABLE;
	let rows = ITEMS.map(def => buildItemRow(def, player, dialog));
	table.tBodies[0].append(...rows);
	return table;
}

function buildItemRow(item: ItemTemplate, player: Player, dialog: Dialog) {
	let row = document.createElement("tr");
	let disabled = (item.price > player.money);
	if (!item.price)  { disabled = true; }
	row.classList.toggle("disabled", disabled);

	let kbd = document.createElement("kbd");
	kbd.textContent = item.key;
	row.insertCell().append(kbd);

	row.insertCell().textContent = item.name;

	if (item.price > 0) {
		let price = document.createElement("span");
		price.className = "price";
		price.textContent = String(item.price);
		row.insertCell().append(price, " for ", String(item.amount));
	} else {
		row.insertCell().textContent = "-free-";
	}

	row.insertCell().textContent = item.description;

	if (!disabled) {
		dialog.addKey({id: item.id, code: `Numpad${item.key}`});
		dialog.addKey({id: item.id, code: `Digit${item.key}`});
	}

	return row;
}


const TABLE = `
<thead>
	<tr>
		<th>Key</th>
		<th>Item</th>
		<th>Price</th>
		<th></th>
	</tr>
</thead>
<tbody></tbody>
`