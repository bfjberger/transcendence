function createTournament() {
	const name = document.getElementById('name').value;
	const visibility = document.querySelector('input[name="visibility"]:checked').value;
	const password = document.getElementById('password').value;
	
	let hostnameport = "http://" + window.location.host


	fetch(hostnameport + '/api/tournaments/', {
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

	let hostnameport = "http://" + window.location.host

	fetch(hostnameport + '/api/tournaments/load_tournaments/') 
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