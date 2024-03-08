export {};

declare global {
	interface Array<T> {
		random(): T;
		distance(other: number[]): number;
		norm(): number;
		normalize(): T[];
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
	if (!length) { return this.valueOf(); }
	return this.substring(0, 1).toUpperCase() + this.substring(1);
}

String.prototype.article = function() {
	let a = (this.match(/^[aeiou]/i) ? "an" : "a");
	return `${a} ${this}`;
}

Array.prototype.distance = function(other: number[]) {
	let dx = Math.abs(this[0]-other[0]);
	let dy = Math.abs(this[1]-other[1]);
	return Math.max(dx, dy);
}

Array.prototype.norm = function() {
	return Math.sqrt(this[0]*this[0] + this[1]*this[1]);
}

Array.prototype.normalize = function() {
	let norm = this.norm();
	return this.map($ => $/norm);
}
