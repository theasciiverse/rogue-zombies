export async function readKey() {
	let ac = new AbortController();
	let { signal } = ac;

	return new Promise<KeyboardEvent>(resolve => {
		function onKeyDown(e: KeyboardEvent) {
			ac.abort();
			resolve(e);
		}
		window.addEventListener("keydown", onKeyDown, {signal});
	});
}
