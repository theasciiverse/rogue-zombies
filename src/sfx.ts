const DB = {
	"zombie-spawn": 8,
	"rake": 3,
	"crowbar": 3,
	"swoosh": 1,
	"barricade": 3,
}

let audio: Record<keyof typeof DB, HTMLAudioElement[]> = {};

export function init() {
	Object.entries(DB).forEach(([key, count]) => {
		let list: HTMLAudioElement[] = [];

		for (let i=1; i<=count; i++) {
			let a = new Audio(`sfx/${key}-${i}.mp3`);
			a.load();
			list.push(a);
		}

		audio[key] = list;
	});
}

export function play(what: keyof typeof DB) {
	audio[what].random().play();
}
