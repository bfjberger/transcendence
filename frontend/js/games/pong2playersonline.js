// LA LOGIQUE DU JEU ICI

function listenerTwoPlayersOnline() {

	document.getElementById("startGame2Online").addEventListener("click", e => {
		e.preventDefault();

		// hide the start button
		document.getElementById("startGame2Online").classList.add("d-none");

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

	try {
		const response = await fetch('http://localhost:7890/api/twoplayer/', init); // !! le lien devra changer

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}

		return 1;
	} catch (e) {
		console.error("loadTwoPlayers: " + e);
		return 0;
	}
};

export default {
	listenerTwoPlayersOnline,
	loadTwoPlayersOnline
};
