import Dialog from "./dialog.js";
import Player from "../beings/player.js";
import { ITEMS, ItemTemplate } from "../items/db.js"


interface Options {
	only: string;
}

export default async function shop(player: Player, options?: Options) {
	while (true) {
		let dialog = new Dialog("Item shop");

		let p = document.createElement("p");
		p.innerHTML = `You can buy anti-zombie stuff here. No refunds, no returns.<br/>You have <span class="money">${player.money}</span> right now.</p>`;
		dialog.append(p);

		let table = buildItemTable(player, dialog, options);
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

function buildItemTable(player: Player, dialog: Dialog, options?: Options) {
	let table = document.createElement("table");
	table.innerHTML = TABLE;
	let rows = ITEMS.map(def => buildItemRow(def, player, dialog, options));
	table.tBodies[0].append(...rows);
	return table;
}

function buildItemRow(item: ItemTemplate, player: Player, dialog: Dialog, options?: Options) {
	let row = document.createElement("tr");
	let disabled = (item.price > player.money);
	if (options && options.only != item.id) { disabled = true; }

	if (!item.price)  { disabled = true; }
	row.classList.toggle("disabled", disabled);

	let kbd = document.createElement("kbd");
	kbd.textContent = item.key;
	row.insertCell().append(kbd);

	row.insertCell().textContent = item.ctor.Name.capitalize();

	let price = document.createElement("span");
	price.className = "money";
	price.textContent = String(item.price);
	let count = document.createElement("span");
	count.className = "count";
	count.textContent = String(item.amount);
	row.insertCell().append(count, " for ", price);

	row.insertCell().textContent = item.ctor.description;

	let have = player.getItem(item.id)
	row.insertCell().textContent = (have == Infinity ? "∞" : String(have));

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
