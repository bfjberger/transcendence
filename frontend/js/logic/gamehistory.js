var data_2_json;
var data_4_json;

function listenerGameHistory() {
	var gameHistoryTwo = document.getElementById("game__historyTwo--main");
	var gameHistoryFour = document.getElementById("game__historyFour--main");

	var gameHistoryEntry;

	if (data_2_json == undefined || data_2_json == null || data_2_json.length == 0) {
		gameHistoryEntry = document.createElement('div');
		gameHistoryEntry.innerHTML = `<div class="h3">Aucune partie jouée</div>`;
		gameHistoryTwo.appendChild(gameHistoryEntry);
	}
	else {
		for (const [game_index, game] of data_2_json.reverse().entries()) {
			if (game_index == 10)
				break;
			gameHistoryEntry = document.createElement('div');
			const date = game.date.replace("Z", "").split("T");
			gameHistoryEntry.innerHTML = `
					<div class="row border-top border-warning" id="game__historyTwo--${game_index}">
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
					</div>
				`;
			gameHistoryTwo.insertBefore(gameHistoryEntry, gameHistoryTwo.firstChild);
			if (game.win_player.username == game.user1.username) {
				document.getElementById(`game__historyTwo--${game_index}--left`).classList.add("bg-success-subtle");
				document.getElementById(`game__historyTwo--${game_index}--right`).classList.add("bg-danger-subtle");
			}
			else {
				document.getElementById(`game__historyTwo--${game_index}--left`).classList.add("bg-danger-subtle");
				document.getElementById(`game__historyTwo--${game_index}--right`).classList.add("bg-success-subtle");
			}
		};
	}

	if (data_4_json == undefined || data_4_json == null || data_4_json.length == 0) {
		gameHistoryEntry = document.createElement('div');
		gameHistoryEntry.innerHTML = `<div class="h3">Aucune partie jouée</div>`;
		gameHistoryFour.appendChild(gameHistoryEntry);
	}
	else {
		for (const [game_index, game] of data_4_json.reverse().entries()) {
			if (game_index == 10)
				break;
			gameHistoryEntry = document.createElement('div');
			const date = game.date.replace("Z", "").split("T");
			gameHistoryEntry.innerHTML = `
					<div class="row border-top border-primary" id="game__historyFour--${game_index}">
						<div class="col mt-2">
							<div class="d-inline" id="game__historyFour--${game_index}--one">
								${game.user1.username}
								<br>
								${game.score_user1}
							</div>
						</div>
						<div class="col mt-2">VS</div>
						<div class="col mt-2">
							<div class="d-inline" id="game__historyFour--${game_index}--two">
								${game.user2.username}
								<br>
								${game.score_user2}
							</div>
						</div>
						<div class="col mt-2">VS</div>
						<div class="col mt-2">
							<div class="d-inline" id="game__historyFour--${game_index}--three">
								${game.user3.username}
								<br>
								${game.score_user3}
							</div>
						</div>
						<div class="col mt-2">VS</div>
						<div class="col mt-2">
							<div class="d-inline" id="game__historyFour--${game_index}--four">
								${game.user4.username}
								<br>
								${game.score_user4}
							</div>
						</div>
						<div class="mb-2" id="game__historyFour--${game_index}--date">
							Le ${date[0]} à ${date[1]}
						</div>
					</div>
				`;
			gameHistoryFour.insertBefore(gameHistoryEntry, gameHistoryFour.firstChild);
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
		};
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
		let hostnameport = "http://" + window.location.host

		const response = await fetch(hostnameport + '/api/gamehistory/', init);

		if (response.status === 403 || !response.ok) {
			const text = await response.text();
			throw new Error(text);
		}
		else if (response.status === 200) {
			data_2_json = await response.json();

			/*
			try {
				const responseFour = await fetch(hostnameport + '/api/gamehistoryfour/', init);

				if (responseFour.status === 403 || !responseFour.ok) {
					const error = await responseFour.text();
					throw new Error(error);
				}
				else if (responseFour.status === 200) {
					data_4_json = await responseFour.json();
				}
			} catch (e) {
				console.error(e);
			}
			*/
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