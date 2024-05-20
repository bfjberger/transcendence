import { renderTournamentRoom } from '../views/viewTournament.js';
import { renderTournamentOnline } from '../views/viewTournament.js';
import { renderTournamentLobby } from '../views/viewTournament.js';
import { router } from '../logic/router.js';
import { renderTournamentOnlineLobby } from "../views/viewTournament.js";

import handleRoom from './tournamentRoom.js';

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
	if (name === '') {
		document.getElementById("create__tournament--errorMsg").textContent = "Le nom du tournoi ne peut pas être vide";
		return;
	}

	fetch('/api/tournaments/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Ensure to include CSRF token
		},
		body: JSON.stringify({ name })
	})
		.then(response => response.json())
		.then(data => {
			console.log("data: ", data);
			if (data.success) {
				// Reload tournament list
				loadTournaments();
			} else {
				// Handle error response
				const errorMsg = data.detail;
				document.getElementById("create__tournament--errorMsg").textContent = errorMsg;

			}
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

// Function to list all tournaments
function loadTournaments() {
	fetch('/api/tournaments/load_tournaments/')
		.then(response => response.json())
		.then(data => {
			const tournamentList = document.getElementById('tournament-list');
			tournamentList.innerHTML = ''; // Clear existing list

			var tournamentItem;

			data.forEach(tournament => {
				tournamentItem = document.createElement('ul');
				tournamentItem.className = "row text-center";
				tournamentItem.style.listStyleType = "none";
				tournamentItem.innerHTML = `
						<li>
							${tournament.name}
							<button id="join__${tournament.name}" class="btn btn-success ms-3">Rejoindre</button>
						</li>
					`;
				tournamentList.appendChild(tournamentItem);

				// ? why use the closure ?
				document.getElementById(`join__${tournament.name}`).addEventListener("click", (function(tournament) {
					return function() {
						joinRoom(tournament.name);
					}
				})(tournament));

				// document.getElementById(`join__${tournament.name}`).addEventListener("click", (e) => {
				// 	e.preventDefault();
				// 	joinRoom(tournament.name);
				// });
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
	.then(response => response.json()) // Parse the response as JSON
	.then(data => {
		if (data.success) {
			// Handle success response
			loadContent(renderTournamentOnlineLobby, "main__content");
			handleRoom.listenerTournamentRoom();
			handleRoom.loadTournamentRoom(tournamentName);
		} else {
			// Handle error response
			const errorMsg = data.detail;
			document.getElementById("tournament__list--errorMsg").textContent = errorMsg;
			loadTournaments();
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
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			// Handle success response
			console.log('Successfully left tournament: ', tournamentName);
			loadContent(renderTournamentOnline, 'main__content');
			listenerTournamentOnline();
		} else {
			// Handle error response
			console.error('Failed to leave tournament');
			console.error(data.detail); // Log the error message
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});
}

export function leaveRoomNameAndGoTo(tournamentName, value) {
	fetch(`/api/tournaments/${tournamentName}/leave_tournament/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Ensure to include CSRF token
		},
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			// Handle success response
			console.log('Successfully left tournament: ', tournamentName);
			router(value);
		} else {
			// Handle error response
			console.error('Failed to leave tournament');
			console.error(data.detail); // Log the error message
		}
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
		const response = await fetch('/api/tournamentOnline/', init);

		if (!response.ok) {
			const text = await response.text();
			throw new Error(text);
		}

		const data = await response.json();
		g_data = data;

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