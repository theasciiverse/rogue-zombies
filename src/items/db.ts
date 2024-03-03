export const ITEMS = [{
	id: "crowbar",
	key: "1",
	price: 0
} as const, {
	id: "mine",
	key: "2",
	price: 2
} as const]

export type ItemTypes = (typeof ITEMS)[number]["id"];

export type ItemTemplate = typeof ITEMS[number];
