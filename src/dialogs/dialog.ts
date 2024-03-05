import * as keyboard from "../keyboard.js";


interface Key {
	id: string;
	key?: string;
	code?: string;
}

export default class Dialog {
	protected dialog = document.createElement("dialog");
	protected resolve: (value: string | null) => void;
	protected keys: Key[] = [];

	constructor(title: string) {
		let h2 = document.createElement("h2");
		h2.textContent = title;
		this.append(h2);
	}

	append(...nodes: (string | Node)[]) {
		this.dialog.append(...nodes);
	}

	async show() {
		const { dialog } = this;
		document.body.append(dialog)
		dialog.showModal();
		document.activeElement && document.activeElement.blur();

		while (true) {
			let event = await keyboard.readKey();
			if (event.key == "Escape") { event.preventDefault(); } // do not close dialog

			let id = this.matchKeyEvent(event);
			if (id !== null) {
				dialog.close();
				dialog.remove();
				return id;
			}
		}
	}

	addKey(key: Key) {
		this.keys.push(key);
	}

	protected matchKeyEvent(event: KeyboardEvent) {
		let key = this.keys.find(key => {
			if ("key" in key && key.key != event.key) { return false; }
			if ("code" in key && key.code != event.code) { return false; }
			return true;
		});

		return (key ? key.id : null);
	}
}
