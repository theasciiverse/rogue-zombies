export {};

declare global {
	interface Array<T> {
		random(): T;
	}
}

Array.prototype.random = function() {
	const { length } = this;
	if (!length) { return null; }
	return this[Math.floor(Math.random()*length)];
}
