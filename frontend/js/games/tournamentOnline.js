import { renderTournamentRoom } from '../views/viewTournament.js';
import { renderTournamentOnline } from '../views/viewTournament.js';

let tournament_name = '';

function createTournament() {
	const name = document.getElementById('name').value;
	const visibility = document.querySelector('input[name="visibility"]:checked').value;
	const password = document.getElementById('password').value;
	
	let hostnameport = "https://" + window.location.host


	fetch('/api/tournaments/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Ensure to include CSRF token
		},
		body: JSON.stringify({ name, visibility, password })
	})
		.then(response => {
			if (response.ok) {
				// Reload tournament list
				loadTournaments();
			} else {
				// Handle error response
				console.error('Failed to create tournament');
				console.error(response);
			}
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

function loadTournaments() {

	let hostnameport = "https://" + window.location.host

	fetch('/api/tournaments/load_tournaments/') 
		.then(response => response.json())
		.then(data => {
			const tournamentList = document.getElementById('tournament-list');
			tournamentList.innerHTML = ''; // Clear existing list
			
			data.forEach(tournament => {
				const tournamentItem = document.createElement('div');
				tournamentItem.textContent = tournament.name;

				// Create password input
				const passwordInput = document.createElement('input');
				passwordInput.type = 'password';
				passwordInput.placeholder = 'Enter password';

				// Create join button
				const joinButton = document.createElement('button');
				joinButton.textContent = 'Join';

				// Use a closure to associate the button with the tournament
				joinButton.addEventListener('click', (function(tournament, passwordInput) {
					return function() {
						// Handle join button click
						console.log('Joining tournament:', tournament.name, 'with password:', passwordInput.value);
						joinRoom(tournament.name);
					};
				})(tournament, passwordInput));

				// Append elements to tournament item
				tournamentItem.appendChild(passwordInput);
				tournamentItem.appendChild(joinButton);

				tournamentList.appendChild(tournamentItem);
			});
		})
		.catch(error => {
			console.error('Error:', error);
		});
}


// function joinRoom(tournamentName) {
// 	fetch(`/api/tournaments/join_tournament/`, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'X-CSRFToken': getCookie('csrftoken') // Ensure to include CSRF token
// 		},
// 		body: JSON.stringify({"name": tournamentName}),
// 	})
// 		.then(response => {
// 			if (response.ok) {
// 				// Handle success response
// 				console.log('Successfully joined tournament');
// 				tournament_name = tournamentName;
// 				document.getElementById('main__content').innerHTML = renderTournamentRoom();
// 				loadRoom();
// 				listenerRoom();

// 			} else {
// 				// Handle error response
// 				console.error('Failed to join tournament');
// 				console.error(response);
// 			}
// 		})
// 		.catch(error => {
// 			console.error('Error:', error);
// 		});
// }

function joinRoom(tournamentName) {
	fetch(`/api/tournaments/${tournamentName}/join_tournament/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Ensure to include CSRF token
		},
	})
		.then(response => {
			if (response.ok) {
				// Handle success response
				console.log('Successfully joined tournament');
				tournament_name = tournamentName;
				document.getElementById('main__content').innerHTML = renderTournamentRoom();
				loadRoom();
				listenerRoom();
			} else {
				// Handle error response
				console.error('Failed to join tournament');
				console.error(response);
			}
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

// function leaveRoom() {
// 	fetch('/api/tournaments/leave_tournament/', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'X-CSRFToken': getCookie('csrftoken') // Ensure to include CSRF token
// 		},
// 		body: JSON.stringify({"name": tournament_name}),
// 	})
// 		.then(response => {
// 			if (response.ok) {
// 				// Handle success response
// 				console.log('Successfully left tournament');
// 				document.getElementById('main__content').innerHTML = renderTournamentOnline();
// 				listenerTournamentOnline();
// 			} else {
// 				// Handle error response
// 				console.error('Failed to leave tournament');
// 				console.error(response);
// 			}
// 		})
// 		.catch(error => {
// 			console.error('Error:', error);
// 		});
// }

function leaveRoom() {
	fetch(`/api/tournaments/${tournament_name}/leave_tournament/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Ensure to include CSRF token
		},
	})
		.then(response => {
			if (response.ok) {
				// Handle success response
				console.log('Successfully left tournament');
				document.getElementById('main__content').innerHTML = renderTournamentOnline();
				listenerTournamentOnline();
			} else {
				// Handle error response
				console.error('Failed to leave tournament');
				console.error(response);
			}
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

function listenerRoom() {
	const leaveRoomButton = document.getElementById('leave-room-button');
	leaveRoomButton.addEventListener('click', (event) => {
		event.preventDefault();
		leaveRoom();
	});

	const startTournamentButton = document.getElementById('start-tournament-button');
	startTournamentButton.addEventListener('click', (event) => {
		event.preventDefault();
		// startTournament();
	});

}

function loadRoom() {
	let divRoom = document.getElementById('tournament-room');
	let tournamentName = document.getElementById('tournament-name');
	let playersList = document.getElementById('players-list');

	fetch(`/api/tournaments/${tournament_name}/load_players/`) 
		.then(response => response.json())
		.then(players => {
			tournamentName.textContent = tournament_name;
			playersList.innerHTML = ''; // Clear existing list

			players.forEach(player => {
				const playerItem = document.createElement('div');
				playerItem.textContent = player.id;
				playersList.appendChild(playerItem);
			});
		})
		.catch(error => {
			console.error('Error:', error);
		});

}







/* ---------------------------------- Utils --------------------------------- */

// Function to get CSRF token from cookies
function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.startsWith(name + '=')) {
			cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
			break;
			}
		}
	}
	return cookieValue;
}











/* ------------ Listener and loader for the tournamentOnline page ----------- */

function listenerTournamentOnline() {
	const button_create_tournament = document.getElementById('create-tournament-button');
	button_create_tournament.addEventListener('click', (event) => {
		event.preventDefault();
		createTournament();
	})

	// Load existing tournaments
    loadTournaments();
}

async function loadTournamentOnline() {

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
	listenerTournamentOnline,
	loadTournamentOnline
};