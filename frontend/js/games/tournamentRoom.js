


function listenerTournamentRoom() {

}

async function loadTournamentRoom() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	// try {
	// 	const response = await fetch('http://localhost:7890/api/tournamentOnline/', init); //! Change this to the correct URL

	// 	if (response.status === 403) {
	// 		const text = await response.text();
	// 		throw new Error(text);
	// 	}

	// 	return 1;
	// } catch (e) {
	// 	console.error("loadTournamentOnline: " + e);
	// 	return 0;
	// }
	return 1; // Added for testing
};

export default {
	listenerTournamentRoom,
	loadTournamentRoom
};