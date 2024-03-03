type Filter = {code:string} | {key:string};

function matchFilter(event: KeyboardEvent, filter: Filter[]) {
	if (!filter.length) { return true; }
	return filter.some(f => {
		for (let p in f) {
			return event[p] == f[p];
		}
	});
}

export async function readKey(allowed: Filter[] = []) {
	let ac = new AbortController();
	let { signal } = ac;

	return new Promise<KeyboardEvent>(resolve => {
		function onKeyDown(e: KeyboardEvent) {
			if (!matchFilter(e, allowed)) { return; }
			ac.abort();
			resolve(e);
		}
		window.addEventListener("keydown", onKeyDown, {signal});
	});
}
