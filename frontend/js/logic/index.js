function renderIndex() {
	return `

		Welcome, this is the main page.

	`;
};

function listenerIndex() {

};

async function loadIndex() {

	try {
		let hostnameport = "http://" + window.location.host

		const response = await fetch(hostnameport + '/api/index/');

		if (response.status === 202) {

			const data = await response.json();

			sessionStorage.setItem("username", data["username"]);
			sessionStorage.setItem("avatar", data["player"].avatar);
			sessionStorage.setItem("nickname", data["player"].nickname);

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
