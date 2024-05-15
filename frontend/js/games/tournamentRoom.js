import { renderTournamentOnline } from "../views/viewTournament.js";
import { renderTournamentRoom } from "../views/viewTournament.js";
import { renderTournamentLobby } from "../views/viewTournament.js";
import { renderPlayground } from "../views/viewTournament.js";
import { router } from "../logic/router.js";

import {
	loadContent,
	loadContent2,
	leaveRoomName,
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
const create_player_div = (player, nickname, is_owner) => {
	const div = document.createElement('div');

	if (is_owner) {
		div.classList.add('owner');
	}
	div.innerHTML = `
		<h3>PLAYER: ${player}</h3>
		<div>NICKNAME: ${nickname}</div>
	`
	return div;
}

// Added a listener in update_lobby_ui
const create_owner_btns = () => {
	const div = document.createElement('div');
	div.innerHTML = `
		<button id="start-btn" class="btn btn-warning">COMMENCER</button>
		<button id="delete-btn" class="btn btn-danger">SUPPRIMER</button>
	`
	return div;
}

// Might change depending on the room ui
const update_lobby_ui = (room) => {
	const lobby_container = document.getElementById('lobby-container');

	if (!lobby_container) {
		return;
	}
	lobby_container.innerHTML = '';
	room.players.forEach((player, i) => {
		const is_owner = player === room.owner;
		lobby_container.appendChild(create_player_div(player, room.nicknames[i], is_owner));
	})

	if (room.owner === g_username) {
		lobby_container.appendChild(create_owner_btns());
		add_start_and_delete_buttons_listeners();
	}
}

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
	console.log('on_load_game', arg);
	load_game().then(() => {
		g_socket.send(JSON.stringify({ event: 'tournament_start' }));
	});
}

const on_tournament_start = (arg) => {
	console.log('on_tournament_start', arg);
	window.startTournamentOnline();
}

const on_tournament_end = (arg) => {
	console.log('on_tournament_end', arg);
	alert(arg);
	g_socket.close();
}

// MATCH INFO for brackets
const on_matchs_info = (arg) => {
	console.log('on_matchs_info', arg);
	console.log(arg['DEMI_FINALS1']);
	// console.log(arg['DEMI_FINALS2'][0]);
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
	return loadContent2(renderTournamentLobby, 'tournament-room')
	.then(set_g_username)
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
	return loadContent2(renderPlayground, 'tournament-room');
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

const start_online_tournament = () => {
    if (g_socket instanceof WebSocket && g_socket.readyState === WebSocket.OPEN) {
        g_socket.send(JSON.stringify({ event: 'load_game' }));
    } else {
        console.error('Cannot send message: WebSocket is not open');
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
	router("tournament_online");

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
			if (g_socket instanceof WebSocket && g_socket.readyState === WebSocket.OPEN) {
				g_socket.close();
				leaveRoomName(g_tournament_name);
			}
		});
	});

	// !!! not working
	// // Close the socket when the user leaves the page 
	// console.log("Enter listenerTournamentRoom");
	// window.addEventListener('beforeunload', () => {
	// 	window.alert('You have left the tournament room');

	// 	if (g_socket instanceof WebSocket && g_socket.readyState === WebSocket.OPEN) {
	// 		g_socket.close();
	// 		leaveRoomName(g_tournament_name);
	// 	}
	// });
}

async function loadTournamentRoom(tournament_name) {
	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];


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
