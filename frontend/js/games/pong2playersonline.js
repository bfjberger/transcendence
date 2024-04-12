// LA LOGIQUE DU JEU ICI

function listenerTwoPlayersOnline() {

	document.querySelector("#startGame2Online").addEventListener("click", e => {
		e.preventDefault();

		// hide the start button
		document.querySelector("#startGame2Online").classList.add("d-none");

	});
};

async function loadTwoPlayersOnline() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	/*
	try {
		const response = await fetch('http://localhost:7890/api/twoplayer/', init); // attendre avoir lien pour requete

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}
		console.log(response.status);
		return 1;
	} catch (e) {
		console.error("loadTwoPlayers: " + e);
		return 0;
	}
	*/
};

export default {

	listenerTwoPlayersOnline,
	loadTwoPlayersOnline
};
