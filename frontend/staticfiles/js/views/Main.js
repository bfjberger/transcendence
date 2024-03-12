import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor() {
		this.setTitle("Main");
	}

	async getHtml() {
		return "";
	}
}