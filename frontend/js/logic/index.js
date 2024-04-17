function renderIndex() {
	return `

		Welcome this is the main page.

	`;
};

function listenerIndex() {

};

async function loadIndex() {

	/*
	ebauche de requête pour recupèrer les infos que l'on veut dans toutes les pages, celles mises dans sessionStorage
	const init = {
		headers: { 'X-CSRFToken': csrftoken, },
	};

	try {
		const response = await fetch('http://localhost:7890/api//', init); // !! change url

		if (response.status === 202) {

			const data = await response.json();

			if (data.avatar !== value)
				sessionStorage.setItem("avatar", data.avatar);
			sessionStorage.setItem("username", data.username);
			sessionStorage.setItem("nickname", data.nickname);
		}
	} catch (e) {
		console.error("Error: ", e);
	}
	*/

	return 1;
};

export default {
	renderIndex,
	listenerIndex,
	loadIndex
};
