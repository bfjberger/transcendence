function renderIndex() {
	return `

		Welcome, this is the main page.

	`;
};

function listenerIndex() {

};

async function loadIndex() {

	try {
		const response = await fetch('http://localhost:7890/api/index/');

		if (response.status === 202) {

			return 1;
		}
		return 0;
	} catch (e) {
		console.error(e);
	}
};

export default {
	renderIndex,
	listenerIndex,
	loadIndex
};
