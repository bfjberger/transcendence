import { router } from "../logic/router.js";
import {
	renderTournamentOnlineGame,
	renderTournamentBracketsEight,
	renderTournamentBracketsFour
} from "../views/viewTournament.js";

import {
	loadContent,
	leaveRoomNameAndGoTo,
} from "./tournamentOnline.js";


import {
	startTournamentOnline,
	on_set_position,
	on_game_start,
	on_game_state,
	on_game_end,
} from "./pongTournamentOnline.js";

/* ----------------------------------- VAR ---------------------------------- */

const base_wsurl = `wss://${window.location.host}/wss/tournament/`;

let g_socket = {};
let g_tournament_name = '';
let g_username = '';
let g_nickname = '';
let g_data = {};

export { g_username, g_nickname, g_socket };

/* ----------------------------------- UI ----------------------------------- */

// To replace the current div that shows players later on
const create_player_div = (player, nickname, is_owner, actual_owner) => {
	const div = document.createElement("div");

	if (is_owner && g_username == actual_owner) {
		div.className = "owner row text-center justify-content-end py-3 border-info border-bottom";
		div.innerHTML = `
				<div class="col-4 h3">
					${nickname}
				</div>
				<div class="col-2">
					<button id="start-btn" class="btn btn-outline-success" type="button">COMMENCER</button>
				</div>
				<div class="col-2">
					<button id="delete-btn" class="btn btn-outline-danger" type="button">SUPPRIMER</button>
				</div>
			`;
	}
	else {
		div.className = "row text-center py-3 border-info border-bottom";
		div.innerHTML = `
			<div class="h3">${nickname}</div>
		`;
	}
	return div;
}

/*
// Added a listener in update_lobby_ui
const create_owner_btns = () => {
	const div = document.createElement('div');
	div.innerHTML = `
		<button id="start-btn" class="btn btn-outline-success">COMMENCER</button>
		<button id="delete-btn" class="btn btn-outline-danger">SUPPRIMER</button>
	`
	return div;
}
*/

// Might change depending on the room ui
const update_lobby_ui = (room) => {
	const lobby_container = document.getElementById("tournament__room--list");
	lobby_container.innerHTML = "";

	if (!room.players)
		return ;

	room.players.forEach((player, i) => {
		const is_owner = player === room.owner;
		lobby_container.appendChild(create_player_div(player, room.nicknames[i], is_owner, room.owner));
	})

	if (room.owner === g_username) {
		// lobby_container.appendChild(create_owner_btns());
		add_start_and_delete_buttons_listeners();
	}

	document.getElementById("tournament__room--list--nb").textContent = room.players.length;
}

function addNameBracketsStart(arg) {

	if (arg["n_ready"] == 4) {
		document.getElementById("demi__seed1--1--name").textContent = arg["nicknames"][0];
		document.getElementById("demi__seed1--2--name").textContent = arg["nicknames"][1];
		document.getElementById("demi__seed2--1--name").textContent = arg["nicknames"][2];
		document.getElementById("demi__seed2--2--name").textContent = arg["nicknames"][3];
	}
	else if (arg["n_ready"] == 8) {
		document.getElementById("quarter__seed1--1--name").textContent = arg["nicknames"][0];
		document.getElementById("quarter__seed1--2--name").textContent = arg["nicknames"][1];
		document.getElementById("quarter__seed2--1--name").textContent = arg["nicknames"][2];
		document.getElementById("quarter__seed2--2--name").textContent = arg["nicknames"][3];
		document.getElementById("quarter__seed3--1--name").textContent = arg["nicknames"][4];
		document.getElementById("quarter__seed3--2--name").textContent = arg["nicknames"][5];
		document.getElementById("quarter__seed4--1--name").textContent = arg["nicknames"][6];
		document.getElementById("quarter__seed4--2--name").textContent = arg["nicknames"][7];
	}
};

function updateBracketsEndOfGame(arg) {

	if (arg["QUARTER_FINALS1"]) {
		if (arg["QUARTER_FINALS1"].winner == arg["QUARTER_FINALS1"].players[0]) {
			document.getElementById("quarter__seed1--1--main").classList.add("bg-success-subtle");
			document.getElementById("quarter__seed1--2--main").classList.add("bg-danger-subtle");
		}
		else if (arg["QUARTER_FINALS1"].winner == arg["QUARTER_FINALS1"].players[1]) {
			document.getElementById("quarter__seed1--1--main").classList.add("bg-danger-subtle");
			document.getElementById("quarter__seed1--2--main").classList.add("bg-success-subtle");
		}
		document.getElementById("quarter__seed1--1--score").textContent = arg["QUARTER_FINALS1"].score[0];
		document.getElementById("quarter__seed1--2--score").textContent = arg["QUARTER_FINALS1"].score[1];
		document.getElementById("demi__seed1--1--name").textContent = arg["QUARTER_FINALS1"].winner;
	}
	if (arg["QUARTER_FINALS2"]) {
		if (arg["QUARTER_FINALS2"].winner == arg["QUARTER_FINALS2"].players[0]) {
			document.getElementById("quarter__seed2--1--main").classList.add("bg-success-subtle");
			document.getElementById("quarter__seed2--2--main").classList.add("bg-danger-subtle");
		}
		else if (arg["QUARTER_FINALS2"].winner == arg["QUARTER_FINALS2"].players[1]) {
			document.getElementById("quarter__seed2--1--main").classList.add("bg-danger-subtle");
			document.getElementById("quarter__seed2--2--main").classList.add("bg-success-subtle");
		}
		document.getElementById("quarter__seed2--1--score").textContent = arg["QUARTER_FINALS2"].score[0];
		document.getElementById("quarter__seed2--2--score").textContent = arg["QUARTER_FINALS2"].score[1];
		document.getElementById("demi__seed1--2--name").textContent = arg["QUARTER_FINALS2"].winner;
	}
	if (arg["QUARTER_FINALS3"]) {
		if (arg["QUARTER_FINALS3"].winner == arg["QUARTER_FINALS3"].players[0]) {
			document.getElementById("quarter__seed3--1--main").classList.add("bg-success-subtle");
			document.getElementById("quarter__seed3--2--main").classList.add("bg-danger-subtle");
		}
		else if (arg["QUARTER_FINALS3"].winner == arg["QUARTER_FINALS3"].players[1]) {
			document.getElementById("quarter__seed3--1--main").classList.add("bg-danger-subtle");
			document.getElementById("quarter__seed3--2--main").classList.add("bg-success-subtle");
		}
		document.getElementById("quarter__seed3--1--score").textContent = arg["QUARTER_FINALS3"].score[0];
		document.getElementById("quarter__seed3--2--score").textContent = arg["QUARTER_FINALS3"].score[1];
		document.getElementById("demi__seed2--1--name").textContent = arg["QUARTER_FINALS3"].winner;
	}
	if (arg["QUARTER_FINALS4"]) {
		if (arg["QUARTER_FINALS4"].winner == arg["QUARTER_FINALS4"].players[0]) {
			document.getElementById("quarter__seed4--1--main").classList.add("bg-success-subtle");
			document.getElementById("quarter__seed4--2--main").classList.add("bg-danger-subtle");
		}
		else if (arg["QUARTER_FINALS4"].winner == arg["QUARTER_FINALS4"].players[1]) {
			document.getElementById("quarter__seed4--1--main").classList.add("bg-danger-subtle");
			document.getElementById("quarter__seed4--2--main").classList.add("bg-success-subtle");
		}
		document.getElementById("quarter__seed4--1--score").textContent = arg["QUARTER_FINALS4"].score[0];
		document.getElementById("quarter__seed4--2--score").textContent = arg["QUARTER_FINALS4"].score[1];
		document.getElementById("demi__seed2--2--name").textContent = arg["QUARTER_FINALS4"].winner;
	}
	if (arg["DEMI_FINALS1"]) {
		if (arg["DEMI_FINALS1"].winner == arg["DEMI_FINALS1"].players[0]) {
			document.getElementById("demi__seed1--1--main").classList.add("bg-success-subtle");
			document.getElementById("demi__seed1--2--main").classList.add("bg-danger-subtle");
		}
		else if (arg["DEMI_FINALS1"].winner == arg["DEMI_FINALS1"].players[1]) {
			document.getElementById("demi__seed1--1--main").classList.add("bg-danger-subtle");
			document.getElementById("demi__seed1--2--main").classList.add("bg-success-subtle");
		}
		document.getElementById("demi__seed1--1--score").textContent = arg["DEMI_FINALS1"].score[0];
		document.getElementById("demi__seed1--2--score").textContent = arg["DEMI_FINALS1"].score[1];
		document.getElementById("final__1--name").textContent = arg["DEMI_FINALS1"].winner;
	}
	if (arg["DEMI_FINALS2"]) {
		if (arg["DEMI_FINALS2"].winner == arg["DEMI_FINALS2"].players[0]) {
			document.getElementById("demi__seed2--1--main").classList.add("bg-success-subtle");
			document.getElementById("demi__seed2--2--main").classList.add("bg-danger-subtle");
		}
		else if (arg["DEMI_FINALS2"].winner == arg["DEMI_FINALS2"].players[1]) {
			document.getElementById("demi__seed2--1--main").classList.add("bg-danger-subtle");
			document.getElementById("demi__seed2--2--main").classList.add("bg-success-subtle");
		}
		document.getElementById("demi__seed2--1--score").textContent = arg["DEMI_FINALS2"].score[0];
		document.getElementById("demi__seed2--2--score").textContent = arg["DEMI_FINALS2"].score[1];
		document.getElementById("final__2--name").textContent = arg["DEMI_FINALS2"].winner;
	}
	if (arg["FINALS"]) {
		if (arg["FINALS"].winner == arg["FINALS"].players[0]) {
			document.getElementById("final__1--main").classList.add("bg-success-subtle");
			document.getElementById("final__2--main").classList.add("bg-danger-subtle");
		}
		else if (arg["FINALS"].winner == arg["FINALS"].players[1]) {
			document.getElementById("final__1--main").classList.add("bg-danger-subtle");
			document.getElementById("final__2--main").classList.add("bg-success-subtle");
		}
		document.getElementById("final__1--score").textContent = arg["FINALS"].score[0];
		document.getElementById("final__2--score").textContent = arg["FINALS"].score[1];
		document.getElementById("winner__name").textContent = arg["FINALS"].winner;
	}
};

/* --------------------------------- SOCKET --------------------------------- */

const on_message = (msg) => {
	let handler = on_message_handlers.filter((e) => msg.type === e.type)
	handler[0]?.handler(msg.arg);
}

const on_players_update = (arg) => {
	update_lobby_ui(arg);
}

const on_load_lobby = (arg) => {
	update_lobby_ui(arg);
}

const on_load_game = (arg) => {

	loadContent(renderTournamentOnlineGame, "tournament__room--main");
	if (arg == 4)
		loadContent(renderTournamentBracketsFour, "tournament__room--brackets");
	else if (arg == 8)
		loadContent(renderTournamentBracketsEight, "tournament__room--brackets");

	load_game();
	g_socket.send(JSON.stringify({ event: 'tournament_start' }));
}

const on_tournament_start = (arg) => {
	addNameBracketsStart(arg);
	window.startTournamentOnline();
}

const on_tournament_end = (arg) => {
	alert(arg);
	g_socket.close();

	/*
	// countdown before going back to the tournamentonline page
	let count = 0;
	let interval = setInterval(() => {
		count++;

		document.getElementById("template__text--next").textContent = "Tu reviens à la page Tournoi en Ligne dans " + (15 - count);

		if (count == 15) {
			clearInterval(interval);

			router("tournamentonline")
		}
	}, 1000);
	*/
}

// MATCH INFO for brackets
const on_matchs_info = (arg) => {
	// console.log('on_matchs_info', arg);
	updateBracketsEndOfGame(arg);
}

let on_message_handlers = [
	{ type: 'players_update', handler: on_players_update },
	{ type: 'load_lobby', handler: on_load_lobby },
	{ type: 'load_game', handler: on_load_game },
	{ type: 'tournament_start', handler: on_tournament_start },
	{ type: 'tournament_end', handler: on_tournament_end },
	{ type: 'matchs_info', handler: on_matchs_info },
];

/* ------------------------------- Page loader ------------------------------ */

function set_g_username() {
    return new Promise((resolve, reject) => {
        try {
            if (!g_data || !g_data.username) {
                throw new Error('g_data or g_data.username is not defined');
            }
            g_username = g_data.username;
            g_nickname = g_data.nickname;
			// g_nickname = g_username;
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function set_g_tournament_name() {
	return new Promise((resolve, reject) => {
		try {
			if (!g_data || !g_data.tournaments || !g_data.tournaments[0].name) {
				throw new Error('g_data or g_data.tournaments or g_data.tournaments[0].name is not defined');
			}
			resolve(g_tournament_name);
		} catch (error) {
			reject(error);
		}
	});
}

const load_create_online = () => {
	// return loadContent2(renderTournamentLobby, 'tournament-room')
	// .then(set_g_username)
	// .then(set_g_tournament_name)
	// .then(connect_socket)
	// .catch(console.error)
	return set_g_username()
	.then(set_g_tournament_name)
	.then(connect_socket)
	.catch(console.error)
}



const load_game = () => {
	on_message_handlers = [...on_message_handlers,
		{ type: 'set_position', handler: window.tournamentEvents.on_set_position },
		{ type: 'game_start', handler: window.tournamentEvents.on_game_start },
		{ type: 'game_state', handler: window.tournamentEvents.on_game_state },
		{ type: 'game_end', handler: window.tournamentEvents.on_game_end },
	];
	// return loadContent2(renderPlayground, 'tournament-room');
}


/* -------------------------- Server communication -------------------------- */

const connect_socket = (tournament_name) => {
	const wsurl = base_wsurl + tournament_name + '/';
	g_socket = new WebSocket(wsurl);

	g_socket.onopen = function(event) {
		console.log('Socket opened: ', event);
	}

	g_socket.onmessage = function(event) {
		const msg = JSON.parse(event.data);
		on_message(msg);
	}

	g_socket.onclose = function(event) {
		console.log('Socket closed: ', event);
	}

}

/* ----------------------- Start and Delete Tournament ---------------------- */

/**
 * Check the lenght of the list of players,
 * if not enough does not send a message to the backend
*/
const start_online_tournament = () => {

	let players_nb = document.getElementById("tournament__room--list").children.length;
	if (players_nb != 4 && players_nb != 8) {
		document.getElementById("tournament__room--errorMsg").textContent = "Le nombre de joueurs n'est pas valide. Il en faut 4 ou 8.";
	}
	else if (players_nb == 4 || players_nb == 8) {
		if (g_socket instanceof WebSocket && g_socket.readyState === WebSocket.OPEN) {
			g_socket.send(JSON.stringify({ event: 'load_game' }));
		} else {
			console.error('Cannot send message: WebSocket is not open');
		}
	}
}

function delete_room_name(tournament_name) {
	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];
	const init = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};
	fetch(`/api/tournaments/${tournament_name}/delete_tournament/`, init)
		.then(response => {
			if (response.ok) {
				console.log('Room deleted');
			} else {
				console.error('Room not deleted');
			}
		})
		.catch(error => {
			console.error('Room not deleted: ', error);
		});
}

const delete_online_tournament = () => {
	if (g_socket instanceof WebSocket && g_socket.readyState === WebSocket.OPEN) {
		g_socket.send(JSON.stringify({ event: 'tournament_end' }));
	} else {
		console.error('Cannot send message: WebSocket is not open');
	}
	delete_room_name(g_tournament_name);
	router("tournamentonline");

}

function add_start_and_delete_buttons_listeners() {
	const start_btn = document.getElementById('start-btn');
	const delete_btn = document.getElementById('delete-btn');
	start_btn.addEventListener('click', start_online_tournament);
	delete_btn.addEventListener('click', delete_online_tournament);
}

/* ------------------------------- Page listener ---------------------------- */

function listenerTournamentRoom() {
	// Add event listeners to the navbar items to close the socket when clicked
	const navbarItems = document.querySelectorAll('.nav__item');
	navbarItems.forEach(item => {
		item.addEventListener('click', () => {
			const value = item.getAttribute('value');
			if (g_socket instanceof WebSocket && g_socket.readyState === WebSocket.OPEN) {
				g_socket.close();
				leaveRoomNameAndGoTo(g_tournament_name, value);
			}
		});
	});
}

async function loadTournamentRoom(tournament_name) {
	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	document.getElementById("tournament__room--name").textContent = tournament_name;

	window.startTournamentOnline = startTournamentOnline;
	window.tournamentEvents = {
		on_set_position,
		on_game_start,
		on_game_state,
		on_game_end,
	};

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		// const response = await fetch(`https://${window.location.host}/api/tournamentOnline/`, init);
		const response = await fetch('/api/tournamentOnline/', init);
		if (!response.ok) {
			const text = await response.text();
			throw new Error(text);
		}

		const data = await response.json();
		g_data = data;
		g_tournament_name = tournament_name;

		load_create_online();

		return 1;
	} catch (e) {
		console.error("loadTournamentOnline: " + e);
		return 0;
	}
};

export default {
	listenerTournamentRoom,
	loadTournamentRoom
};
