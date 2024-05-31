var g_game_history_two;
var g_game_history_four;

var g_data;

function createHistoryTwo(game, game_index) {

	let game_history_two_entry;

	game_history_two_entry = document.createElement('div');
	game_history_two_entry.id = `game__historyTwo--${game_index}`;
	game_history_two_entry.className = "row border-top border-warning";
	let date = game.date.replace("Z", "").split("T");

	game_history_two_entry.innerHTML = `
			<div class="col mt-2">
				<div class="d-inline" id="game__historyTwo--${game_index}--left">
					${game.players[0]}
					<br>
					${game.scores[game.players[0]]}
				</div>
			</div>
			<div class="col mt-2 align-self-center">VS</div>
			<div class="col mt-2">
				<div class="d-inline" id="game__historyTwo--${game_index}--right">
					${game.players[1]}
					<br>
					${game.scores[game.players[1]]}
				</div>
			</div>
			<div class="mb-2" id="game__historyTwo--${game_index}--date">
				Le ${date[0]} à ${date[1].split(".")[0]}
			</div>
		`;

	g_game_history_two.appendChild(game_history_two_entry);

	if (game.winner == game.players[0]) {
		document.getElementById(`game__historyTwo--${game_index}--left`).classList.add("bg-success-subtle");
		document.getElementById(`game__historyTwo--${game_index}--right`).classList.add("bg-danger-subtle");
	}
	else {
		document.getElementById(`game__historyTwo--${game_index}--left`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyTwo--${game_index}--right`).classList.add("bg-success-subtle");
	}
	if (game.players[0] == sessionStorage.getItem("username")) {
		document.getElementById(`game__historyTwo--${game_index}--left`).style.textDecoration = "underline";
	}
	else {
		document.getElementById(`game__historyTwo--${game_index}--right`).style.textDecoration = "underline";
	}
};

function createHistoryTournament(game, game_index) {

	let game_history_tournament;

	game_history_tournament = document.createElement('div');
	game_history_tournament.id = `game__historyTwo--${game_index}`;
	game_history_tournament.className = "row border-top border-warning";
	let date = game.date.replace("Z", "").split("T");
	game_history_tournament.innerHTML = `
			<div class="mt-2" id="game__historyTwo--${game_index}--tournament">
				${game.tournament_level} pendant ${game.tournament_name}
			</div>
			<div class="col mt-2">
				<div class="d-inline" id="game__historyTwo--${game_index}--left">
					${game.players[0]}
					<br>
					${game.scores[game.players[0]]}
				</div>
			</div>
			<div class="col mt-2 align-self-center">VS</div>
			<div class="col mt-2">
				<div class="d-inline" id="game__historyTwo--${game_index}--right">
					${game.players[1]}
					<br>
					${game.scores[game.players[1]]}
				</div>
			</div>
			<div class="mb-2" id="game__historyTwo--${game_index}--date">
				Le ${date[0]} à ${date[1].split(".")[0]}
			</div>
		`;

	g_game_history_two.appendChild(game_history_tournament);

	if (game.winner == game.players[0]) {
		document.getElementById(`game__historyTwo--${game_index}--left`).classList.add("bg-success-subtle");
		document.getElementById(`game__historyTwo--${game_index}--right`).classList.add("bg-danger-subtle");
	}
	else {
		document.getElementById(`game__historyTwo--${game_index}--left`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyTwo--${game_index}--right`).classList.add("bg-success-subtle");
	}
	if (game.players[0] == sessionStorage.getItem("username")) {
		document.getElementById(`game__historyTwo--${game_index}--left`).style.textDecoration = "underline";
	}
	else {
		document.getElementById(`game__historyTwo--${game_index}--right`).style.textDecoration = "underline";
	}
};

function createHistoryFour(game, game_index) {

	let game_history_four;

	game_history_four = document.createElement('div');
	game_history_four.id = `game__historyFour--${game_index}`;
	game_history_four.className = "row border-top border-primary";
	let date = game.date.replace("Z", "").split("T");
	game_history_four.innerHTML = `
			<div class="col mt-2">
				<div class="d-inline" id="game__historyFour--${game_index}--one">
					${game.players[0]}
					<br>
					${game.scores[game.players[0]]}
				</div>
			</div>
			<div class="col mt-2 align-self-center">VS</div>
			<div class="col mt-2">
				<div class="d-inline" id="game__historyFour--${game_index}--two">
					${game.players[1]}
					<br>
					${game.scores[game.players[1]]}
				</div>
			</div>
			<div class="col mt-2 align-self-center">VS</div>
			<div class="col mt-2">
				<div class="d-inline" id="game__historyFour--${game_index}--three">
					${game.players[2]}
					<br>
					${game.scores[game.players[2]]}
				</div>
			</div>
			<div class="col mt-2 align-self-center">VS</div>
			<div class="col mt-2">
				<div class="d-inline" id="game__historyFour--${game_index}--four">
					${game.players[3]}
					<br>
					${game.scores[game.players[3]]}
				</div>
			</div>
			<div class="mb-2" id="game__historyFour--${game_index}--date">
				Le ${date[0]} à ${date[1].split(".")[0]}
			</div>
		`;

	g_game_history_four.appendChild(game_history_four);

	if (game.winner == game.players[0]) {
		document.getElementById(`game__historyFour--${game_index}--one`).classList.add("bg-success-subtle");
		document.getElementById(`game__historyFour--${game_index}--two`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--three`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--four`).classList.add("bg-danger-subtle");
	}
	else if (game.winner == game.players[1]) {
		document.getElementById(`game__historyFour--${game_index}--one`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--two`).classList.add("bg-success-subtle");
		document.getElementById(`game__historyFour--${game_index}--three`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--four`).classList.add("bg-danger-subtle");
	}
	else if (game.winner == game.players[2]) {
		document.getElementById(`game__historyFour--${game_index}--one`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--two`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--three`).classList.add("bg-success-subtle");
		document.getElementById(`game__historyFour--${game_index}--four`).classList.add("bg-danger-subtle");
	}
	else if (game.winner == game.players[3]) {
		document.getElementById(`game__historyFour--${game_index}--one`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--two`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--three`).classList.add("bg-danger-subtle");
		document.getElementById(`game__historyFour--${game_index}--four`).classList.add("bg-success-subtle");
	}
	if (game.players[0] == sessionStorage.getItem("username")) {
		document.getElementById(`game__historyFour--${game_index}--one`).style.textDecoration = "underline";
	}
	else if (game.players[1] == sessionStorage.getItem("username")) {
		document.getElementById(`game__historyFour--${game_index}--two`).style.textDecoration = "underline";
	}
	else if (game.players[2] == sessionStorage.getItem("username")) {
		document.getElementById(`game__historyFour--${game_index}--three`).style.textDecoration = "underline";
	}
	else if (game.players[3] == sessionStorage.getItem("username")) {
		document.getElementById(`game__historyFour--${game_index}--four`).style.textDecoration = "underline";
	}
};

/**
 * For loop that iterates over the list,
	use of 'reverse()' in order to have the most recent game on top
	use of 'entries()' in order to have an iterator
	'const [game_index, game]' creates two variables:
		'game_index' will get the index of the current iteration
		'game' will get the value of the current iteration

	For the game element,
		if it has only 2 players and the tournament_level field is null -> 1 v 1
		if it has only 2 players and the tournament_level field is not null -> tournoi
		if it has only 4 players -> Multijoueurs

	Each function will create a new 'div' element and
	fill the template of a game entry with the information from the 'game' variable.
	Add it to the appropriate element in the page (history for two and history for four
	Change the background color of the user's placeholder depending on the winner of the game.
	Add an underline to identify the current user.
*/
function fillHistory() {

	for (const [game_index, game] of g_data.reverse().entries()) {
		if (game.players.length == 2 && game.tournament_level == null)
			createHistoryTwo(game, game_index);
		else if (game.players.length == 2 && game.tournament_level != null)
			createHistoryTournament(game, game_index);
		else if (game.players.length == 4)
			createHistoryFour(game, game_index);
	}
};

/**
 * For loop to get the number of games played at two and four players
 * call the function that will use g_data to fill the HTML field
 * depending on the number of games got earlier, add a specific message at the HTML field
*/
function listenerGameHistory() {

	g_game_history_two = document.getElementById("game__historyTwo--main");
	g_game_history_four = document.getElementById("game__historyFour--main");

	var gameHistoryEntry;

	var nb_game_2 = 0;
	var nb_game_4 = 0;

	g_data.forEach(game => {
		if (game.players.length == 2)
			nb_game_2++;
		else if (game.players.length == 4)
			nb_game_4++;
	});

	fillHistory();

	if (nb_game_2 == 0) {
		gameHistoryEntry = document.createElement("div");
		gameHistoryEntry.innerHTML = `<div class="h3">Aucune partie 1 v 1 en ligne jouée</div>`;

		g_game_history_two.appendChild(gameHistoryEntry);
	}
	if (nb_game_4 == 0) {
		gameHistoryEntry = document.createElement("div");
		gameHistoryEntry.innerHTML = `<div class="h3">Aucune partie Multijoueurs en ligne jouée</div>`;

		g_game_history_four.appendChild(gameHistoryEntry);
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
			g_data = await response.json();
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