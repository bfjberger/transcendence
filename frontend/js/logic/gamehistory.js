var g_data_two;
var g_data_four;
var g_game_history_two;
var g_game_history_four;

/**
 * For loop that iterates over the list,
	use of 'reverse()' in order to have the most recent game on top
	use of 'entries()' in order to have an iterator
	'const [game_index, game]' creates two variables:
		'game_index' will get the index of the current iteration
		'game' will get the value of the current iteration

	At each iteration it will create a new 'div' element and
	fill the template of a game entry with the information from the 'game' variable.

	Change the background color of the user's placeholder depending on the winner of the game.

	Add an underline to identify the current user.
*/
function fillHistoryTwo() {

	var gameHistoryEntry;

	for (const [game_index, game] of g_data_two.reverse().entries()) {
		gameHistoryEntry = document.createElement('div');
		gameHistoryEntry.id = `game__historyTwo--${game_index}`;
		gameHistoryEntry.className = "row border-top border-warning";
		const date = game.date.replace("Z", "").split("T");
		if (game.id_tournament == null) {
			gameHistoryEntry.innerHTML = `
					<div class="col mt-2">
						<div class="d-inline" id="game__historyTwo--${game_index}--left">
							${game.user1.username}
							<br>
							${game.score_user1}
						</div>
					</div>
					<div class="col mt-2 align-self-center">VS</div>
					<div class="col mt-2">
						<div class="d-inline" id="game__historyTwo--${game_index}--right">
							${game.user2.username}
							<br>
							${game.score_user2}
						</div>
					</div>
					<div class="mb-2" id="game__historyTwo--${game_index}--date">
						Le ${date[0]} à ${date[1].split(".")[0]}
					</div>
				`;
		}
		else {
			gameHistoryEntry.innerHTML = `
					<div class="mt-2" id="game__historyTwo--${game_index}--tournament">
						${game.level} pendant ${game.id_name}
					</div>
					<div class="col mt-2">
						<div class="d-inline" id="game__historyTwo--${game_index}--left">
							${game.user1.username}
							<br>
							${game.score_user1}
						</div>
					</div>
					<div class="col mt-2 align-self-center">VS</div>
					<div class="col mt-2">
						<div class="d-inline" id="game__historyTwo--${game_index}--right">
							${game.user2.username}
							<br>
							${game.score_user2}
						</div>
					</div>
					<div class="mb-2" id="game__historyTwo--${game_index}--date">
						Le ${date[0]} à ${date[1].split(".")[0]}
					</div>
				`;
		}
		g_game_history_two.appendChild(gameHistoryEntry);
		if (game.win_player.username == game.user1.username) {
			document.getElementById(`game__historyTwo--${game_index}--left`).classList.add("bg-success-subtle");
			document.getElementById(`game__historyTwo--${game_index}--right`).classList.add("bg-danger-subtle");
		}
		else {
			document.getElementById(`game__historyTwo--${game_index}--left`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyTwo--${game_index}--right`).classList.add("bg-success-subtle");
		}
		if (game.user1.username == sessionStorage.getItem("username")) {
			document.getElementById(`game__historyTwo--${game_index}--left`).style.textDecoration = "underline";
		}
		else {
			document.getElementById(`game__historyTwo--${game_index}--right`).style.textDecoration = "underline";
		}
	};
};

/**
 * For loop that iterates over the list,
	use of 'reverse()' in order to have the most recent game on top
	use of 'entries()' in order to have an iterator
	'const [game_index, game]' creates two variables:
		'game_index' will get the index of the current iteration
		'game' will get the value of the current iteration

	At each iteration it will create a new 'div' element and
	fill the template of a game entry with the information from the 'game' variable.

	Change the background color of the user's placeholder depending on the winner of the game.

	Add an underline to identify the current user.
*/
function fillHistoryFour() {

	var gameHistoryEntry;

	for (const [game_index, game] of g_data_four.reverse().entries()) {
		gameHistoryEntry = document.createElement('div');
		gameHistoryEntry.id = `game__historyFour--${game_index}`;
		gameHistoryEntry.className = "row border-top border-primary";
		const date = game.date.replace("Z", "").split("T");
		gameHistoryEntry.innerHTML = `
				<div class="col mt-2">
					<div class="d-inline" id="game__historyFour--${game_index}--one">
						${game.user1.username}
						<br>
						${game.score_user1}
					</div>
				</div>
				<div class="col mt-2 align-self-center">VS</div>
				<div class="col mt-2">
					<div class="d-inline" id="game__historyFour--${game_index}--two">
						${game.user2.username}
						<br>
						${game.score_user2}
					</div>
				</div>
				<div class="col mt-2 align-self-center">VS</div>
				<div class="col mt-2">
					<div class="d-inline" id="game__historyFour--${game_index}--three">
						${game.user3.username}
						<br>
						${game.score_user3}
					</div>
				</div>
				<div class="col mt-2 align-self-center">VS</div>
				<div class="col mt-2">
					<div class="d-inline" id="game__historyFour--${game_index}--four">
						${game.user4.username}
						<br>
						${game.score_user4}
					</div>
				</div>
				<div class="mb-2" id="game__historyFour--${game_index}--date">
					Le ${date[0]} à ${date[1].split(".")[0]}
				</div>
			`;
		g_game_history_four.appendChild(gameHistoryEntry);
		if (game.win_player.username == game.user1.username) {
			document.getElementById(`game__historyFour--${game_index}--one`).classList.add("bg-success-subtle");
			document.getElementById(`game__historyFour--${game_index}--two`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--three`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--four`).classList.add("bg-danger-subtle");
		}
		else if (game.win_player.username == game.user2.username) {
			document.getElementById(`game__historyFour--${game_index}--one`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--two`).classList.add("bg-success-subtle");
			document.getElementById(`game__historyFour--${game_index}--three`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--four`).classList.add("bg-danger-subtle");
		}
		else if (game.win_player.username == game.user3.username) {
			document.getElementById(`game__historyFour--${game_index}--one`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--two`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--three`).classList.add("bg-success-subtle");
			document.getElementById(`game__historyFour--${game_index}--four`).classList.add("bg-danger-subtle");
		}
		else if (game.win_player.username == game.user4.username) {
			document.getElementById(`game__historyFour--${game_index}--one`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--two`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--three`).classList.add("bg-danger-subtle");
			document.getElementById(`game__historyFour--${game_index}--four`).classList.add("bg-success-subtle");
		}
		if (game.user1.username == sessionStorage.getItem("username")) {
			document.getElementById(`game__historyFour--${game_index}--one`).style.textDecoration = "underline";
		}
		else if (game.user2.username == sessionStorage.getItem("username")) {
			document.getElementById(`game__historyFour--${game_index}--two`).style.textDecoration = "underline";
		}
		else if (game.user3.username == sessionStorage.getItem("username")) {
			document.getElementById(`game__historyFour--${game_index}--three`).style.textDecoration = "underline";
		}
		else if (game.user4.user1 == sessionStorage.getItem("username")) {
			document.getElementById(`game__historyFour--${game_index}--four`).style.textDecoration = "underline";
		}
	};
};

/**
 * For each globals holding the history of the games in both 2 and 4 Players:
 * Checks if it is empty and display a message accordingly or
 * calls for a function that will create an element for each games and display it.
*/
function listenerGameHistory() {

	g_game_history_two = document.getElementById("game__historyTwo--main");
	g_game_history_four = document.getElementById("game__historyFour--main");

	var gameHistoryEntry;

	if (g_data_two == undefined || g_data_two == null || g_data_two.length == 0) {
		gameHistoryEntry = document.createElement("div");
		gameHistoryEntry.innerHTML = `<div class="h3">Aucune partie jouée</div>`;
		g_game_history_two.appendChild(gameHistoryEntry);
	}
	else {
		fillHistoryTwo();
	}

	if (g_data_four == undefined || g_data_four == null || g_data_four.length == 0) {
		gameHistoryEntry = document.createElement('div');
		gameHistoryEntry.innerHTML = `<div class="h3">Aucune partie jouée</div>`;
		g_game_history_four.appendChild(gameHistoryEntry);
	}
	else {
		fillHistoryFour();
	}
};

async function loadGameHistory() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
	};

	try {
		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/gamehistory/', init);

		if (!response.ok) {
			const text = await response.text();
			throw new Error(text);
		}
		else if (response.status === 200) {
			g_data_two = await response.json();

			try {
				const responseFour = await fetch(hostnameport + '/api/gamehistoryfour/', init);

				if (!responseFour.ok) {
					const error = await responseFour.text();
					throw new Error(error);
				}
				else if (responseFour.status === 200) {
					g_data_four = await responseFour.json();
				}
			} catch (e) {
				console.error(e);
			}
		}
		return 1;
	} catch (e) {
		console.error("loadGameHistory Error : " + e);
		return 0;
	}
};

export default {
	listenerGameHistory,
	loadGameHistory
};