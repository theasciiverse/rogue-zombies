import Trap from "./trap.js";
import Barrier from "./barrier.js";
import Rake from "./rake.js";
import Mine from "./mine.js";
import Bazooka from "./bazooka.js";
import Wire from "./wire.js";
import Fence from "./fence.js";
import Shock from "./shock.js";


export const ITEMS = [{
	id: "barrier",
	short: "Barrier",
	key: "1",
	price: 1,
	amount: 5,
	ctor: Barrier
}, {
	id: "rake",
	key: "2",
	price: 1,
	amount: 3,
	ctor: Rake
}, {
	id: "trap",
	short: "Trap",
	key: "3",
	price: 2,
	amount: 3,
	ctor: Trap
},  {
	id: "mine",
	key: "4",
	price: 3,
	amount: 3,
	ctor: Mine
}, {
	id: "shock",
	short: "Shock",
	key: "5",
	price: 4,
	amount: 2,
	ctor: Shock
}, {
	id: "bazooka",
	key: "6",
	price: 5,
	amount: 1,
	ctor: Bazooka
}, {
	id: "wire",
	short: "Wire",
	key: "7",
	price: 2,
	amount: 2,
	ctor: Wire
}, {
	id: "fence",
	short: "Fence",
	key: "8",
	price: 3,
	amount: 2,
	ctor: Fence
}];

export type ItemTemplate = typeof ITEMS[number];
