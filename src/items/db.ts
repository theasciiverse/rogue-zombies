import Crowbar from "./crowbar.js";
import Barricade from "./barricade.js";
import Rake from "./rake.js";
import Mine from "./mine.js";
import Bazooka from "./bazooka.js";
import Wire from "./wire.js";
import Fence from "./fence.js";


export const ITEMS = [{
	id: "crowbar",
	key: "1",
	price: 0,
	amount: 0,
	ctor: Crowbar
}, {
	id: "barricade",
	short: "Barricade",
	key: "2",
	price: 1,
	amount: 5,
	ctor: Barricade
}, {
	id: "rake",
	key: "3",
	price: 1,
	amount: 3,
	ctor: Rake
}, {
	id: "mine",
	key: "4",
	price: 3,
	amount: 1,
	ctor: Mine
}, {
	id: "bazooka",
	key: "5",
	price: 5,
	amount: 1,
	ctor: Bazooka
}, {
	id: "wire",
	short: "Wire",
	key: "6",
	price: 3,
	amount: 2,
	ctor: Wire
}, {
	id: "fence",
	short: "Fence",
	key: "7",
	price: 3,
	amount: 2,
	ctor: Fence
}];

export type ItemTemplate = typeof ITEMS[number];
