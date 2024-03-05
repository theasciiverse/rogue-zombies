import Dialog from "./dialog.js";
import Player from "../beings/player.js";
import { ITEMS, ItemTemplate } from "../items/db.js"


export default async function buy(player: Player) {
	while (true) {
		let dialog = new Dialog("Buy items");

		let table = buildItemTable(player, dialog);
		dialog.append(table);

		let canBuySomething = ITEMS.some(it => it.price <= player.money);
		let info = document.createElement("p");
		info.innerHTML = `${canBuySomething ? "Earn more money by killing zombies." : "You have no money! Earn some by killing zombies." } Press <kbd>esc</kbd> to exit.`;
		dialog.addKey({id:"", key: "Escape"});
		dialog.append(info);

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

	row.insertCell().textContent = item.ctor.Name;

	let price = document.createElement("span");
	price.className = "money";
	price.textContent = String(item.price);
	row.insertCell().append(price, " for ", String(item.amount));

	row.insertCell().textContent = item.ctor.description;

	let count = player.getItem(item.id)
	row.insertCell().textContent = (count == Infinity ? "∞" : String(count));

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
		<th>Have</th>
	</tr>
</thead>
<tbody></tbody>
`;
