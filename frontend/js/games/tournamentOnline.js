import { renderTournamentRoom } from '../views/viewTournament.js';
import { renderTournamentOnline } from '../views/viewTournament.js';
import { renderTournamentLobby } from '../views/viewTournament.js';

import handleRoom from './tournamentRoom.js';

// TODO: Need to think about what ui elements to add
// TODO: Change the logic of the room creation / joining maybe it would be better to invite ?

// Function to load content into an element
export function loadContent(viewFunction, elementId) {
	try {
		const htmlContent = viewFunction();
		document.getElementById(elementId).innerHTML = htmlContent;
		// Need to attach existing event listeners ?
	} catch (error) {
		console.error("Error loading content: ", error);
	}
}

export function loadContent2(viewFunction, elementId) {
    return new Promise((resolve, reject) => {
        try {
            const htmlContent = viewFunction();
            document.getElementById(elementId).innerHTML = htmlContent;
            resolve();
        } catch (error) {
            console.error("Error loading content: ", error);
            reject(error);
        }
    });
}


export function loadContentWithListener(viewFunction, elementId, listenerFunction) {
	try {
		const htmlContent = viewFunction();
		document.getElementById(elementId).innerHTML = htmlContent;
		listenerFunction();
	} catch (error) {
		console.error("Error loading content: ", error);
	}
}

/* -------------------------------------------------------------------------- */

let tournament_name = '';
let g_data = {};

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

// Function to list all tournaments
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

				// Create join button
				const joinButton = document.createElement('button');
				joinButton.textContent = 'Join';

				// Use a closure to associate the button with the tournament
				joinButton.addEventListener('click', (function(tournament) {
					return function() {
						joinRoom(tournament.name);
					};
				})(tournament));

				// Append elements to tournament item
				tournamentItem.appendChild(joinButton);

				tournamentList.appendChild(tournamentItem);
			});
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

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
				tournament_name = tournamentName;
				console.log('Successfully joined tournament: ', tournament_name);
				loadContent(renderTournamentRoom, 'main__content');
				handleRoom.listenerTournamentRoom();
				handleRoom.loadTournamentRoom(tournament_name);
				// listPlayersInRoom();
				// listenerRoom();
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
				loadContent(renderTournamentOnline, 'main__content');
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

export function leaveRoomName(tournamentName) {
	fetch(`/api/tournaments/${tournamentName}/leave_tournament/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Ensure to include CSRF token
		},
	})
		.then(response => {
			if (response.ok) {
				// Handle success response
				console.log('Successfully left tournament: ', tournamentName);
				loadContent(renderTournamentOnline, 'main__content');
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

//!!! Need to rework this function, adjust the router maybe to work with it
// Function to list all players in the room
function listPlayersInRoom() {
	let divRoom = document.getElementById('tournament-room');
	let tournamentName = document.getElementById('tournament-name');
	let playersList = document.getElementById('players-list');

	// console.log('Loading room:', tournament_name);
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

	try {
		// const response = await fetch(`https://${window.location.host}/api/tournamentOnline/`, init); //! Change this to the correct URL
		const response = await fetch('/api/tournamentOnline/', init);

		if (!response.ok) {
			const text = await response.text();
			throw new Error(text);
		}

		const data = await response.json();
		g_data = data;
		// console.log("g_data: ", g_data);
		console.log("g_data.username: ", g_data.username);

		return 1;
	} catch (e) {
		console.error("loadTournamentOnline: " + e);
		return 0;
	}
};

export default {
	listenerTournamentOnline,
	loadTournamentOnline
};