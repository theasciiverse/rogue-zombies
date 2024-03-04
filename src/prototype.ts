export {};

declare global {
	interface Array<T> {
		random(): T;
	}

	interface String {
		capitalize(): string;
		article(): string;
	}
}

Array.prototype.random = function() {
	const { length } = this;
	if (!length) { return null; }
	return this[Math.floor(Math.random()*length)];
}

String.prototype.capitalize = function() {
	const { length } = this;
	if (!length) { return this; }
	return this.substring(0, 1).toUpperCase() + this.substring(1);
}

String.prototype.article = function() {
	let a = (this.match(/^[aeiou]/i) ? "an" : "a");
	return `${a} ${this}`;
}
