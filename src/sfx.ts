const DB = {
	"zombie-spawn": 8,
	"rake": 3,
	"crowbar": 3,
	"swoosh": 1,
	"barricade": 3,
	"wire": 3,
	"fence": 2,
	"bazooka": 1,
	"mine": 1,
	"game-over": 1,
	"ping": 1
}

let audio: Partial<Record<keyof typeof DB, HTMLAudioElement[]>> = {};

export function init() {
	Object.entries(DB).forEach(([key, count]) => {
		let list: HTMLAudioElement[] = [];

		for (let i=1; i<=count; i++) {
			let a = new Audio(`sfx/${key}-${i}.mp3`);
			a.load();
			list.push(a);
		}

		audio[key as keyof typeof audio] = list;
	});
}

export function play(what: keyof typeof DB) {
	let a = audio[what];
	a && a.random().play();
}
