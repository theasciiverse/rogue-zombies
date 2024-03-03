export const ITEMS = [{
	id: "crowbar",
	name: "Crowbar",
	key: "1",
	price: 0,
	amount: 0,
	description: "Melee range, unlimited uses. You already have this."
} as const, {
	id: "barricade",
	name: "Wooden barricade",
	short: "Barricade",
	key: "2",
	price: 1,
	amount: 3,
	description: "Can hold them for some time."
} as const, {
	id: "rake",
	name: "Rake",
	key: "3",
	price: 1,
	amount: 3,
	description: "Kills one zombie dumb enough to step on it."
} as const, {
	id: "mine",
	name: "Mine",
	key: "4",
	price: 3,
	amount: 1,
	description: "Explodes when stepped on by a zombie."
} as const, {
	id: "bazooka",
	name: "Bazooka",
	key: "5",
	price: 5,
	amount: 1,
	description: "Flys in a straight line, explodes on impact."
} as const, {
	id: "wire",
	name: "Barbed wire",
	short: "Wire",
	key: "6",
	price: 3,
	amount: 2,
	description: "Auto-connects to nearby wires. Has little health."
} as const, {
	id: "fence",
	name: "Electric fence",
	short: "Fence",
	key: "7",
	price: 3,
	amount: 2,
	description: "Auto-connects to nearby fences. Has more health."
} as const]

export type ItemTypes = (typeof ITEMS)[number]["id"];

export type ItemTemplate = typeof ITEMS[number];
