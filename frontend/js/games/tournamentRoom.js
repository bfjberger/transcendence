import { 
	loadContent,
	loadContent2,
	leaveRoomName,
} from "./tournamentOnline.js";

import { renderTournamentOnline } from "../views/viewTournament.js";
import { renderTournamentRoom } from "../views/viewTournament.js";
import { renderTournamentLobby } from "../views/viewTournament.js";
import { renderPlayground } from "../views/viewTournament.js";

import {
	start,
	startTournamentOnline,
	on_set_position,
	on_game_start,
	on_game_state,
	on_game_end,
} from "./pongTournamentOnline.js";

/**
 * TODO:[] Debug the websocket connection
 * TODO:[] Need to add the game
 */

/* ----------------------------------- VAR ---------------------------------- */

const base_wsurl = `ws://${window.location.host}/ws/tournament/`;

let g_socket = {};
let g_tournament_name = '';
let g_username = '';
let g_alias = '';
let g_data = {};

export { g_alias, g_socket };

/* ----------------------------------- UI ----------------------------------- */

// To replace the current div that shows players later on
const create_player_div = (player, alias, is_owner) => {
	const div = document.createElement('div');
	
	if (is_owner) {
		div.classList.add('owner');
	}
	div.innerHTML = `
		<h3>PLAYER: ${player}</h3>
		<div>ALIAS: ${alias}</div>
	`
	return div;
}

// Added a listener in update_lobby_ui
const create_owner_btns = () => {
	const div = document.createElement('div');
	div.innerHTML = `
		<button id="start-btn">START</button>
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
		lobby_container.appendChild(create_player_div(player, room.aliases[i], is_owner));
	})

	if (room.owner === g_username) {
		lobby_container.appendChild(create_owner_btns());
		add_start_btn_listener();
	}
}

/* --------------------------------- SOCKET --------------------------------- */

const on_message = (msg) => {
	let handler = on_message_handlers.filter((e) => msg.type === e.type)
	// handler = on_message_handlers.filter((e) => msg.type === e.type)
	handler[0]?.handler(msg.arg);
}

const on_players_update = (arg) => {
	// console.log('on_players_update', arg);
	update_lobby_ui(arg);
}

const on_load_lobby = (arg) => {
	update_lobby_ui(arg);
}

const on_load_playground = (arg) => {
	console.log('on_load_playground', arg);
	load_playground().then(() => {
		g_socket.send(JSON.stringify({ event: 'tournament_start' }));
	});
	// load_playground();
	// g_socket.send(JSON.stringify({ event: 'tournament_start' }));
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

let on_message_handlers = [
	{ type: 'players_update', handler: on_players_update },
	{ type: 'load_lobby', handler: on_load_lobby },
	{ type: 'load_playground', handler: on_load_playground },
	{ type: 'tournament_start', handler: on_tournament_start },
	{ type: 'tournament_end', handler: on_tournament_end },
];



/* ------------------------------- Page loader ------------------------------ */

// need to add handlers for load playgrounds events

// function set_g_username() {
// 	g_username = g_data.username;
// 	// g_alias = g_data.player.nickname;
// 	g_alias = g_username;
// }

function set_g_username() {
    return new Promise((resolve, reject) => {
        try {
            if (!g_data || !g_data.username) {
                throw new Error('g_data or g_data.username is not defined');
            }
            g_username = g_data.username;
            g_alias = g_username;
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
			// g_tournament_name = g_data.tournaments[0].name;
			// let's say the tournament_name in the loader
			resolve(g_tournament_name);
		} catch (error) {
			reject(error);
		}
	});
}

// function load_create_online() {
// 	loadContent(renderTournamentLobby, 'tournament-room'); // !!! To change with another function
// 	set_g_username();
// 	// console.log("g_username: ", g_username);
// 	// console.log("g_alias: ", g_alias);
// 	g_tournament_name = g_data.tournaments[0].name;
// 	connect_socket(g_tournament_name);
// }

const load_create_online = () => {
	return loadContent2(renderTournamentLobby, 'tournament-room')
	.then(set_g_username)
	.then(set_g_tournament_name)
	.then(connect_socket)
	.catch(console.error)
}
				


const load_playground = () => {
	on_message_handlers = [...on_message_handlers,
		{ type: 'set_position', handler: window.tournamentEvents.on_set_position },
		{ type: 'game_start', handler: window.tournamentEvents.on_game_start },
		{ type: 'game_state', handler: window.tournamentEvents.on_game_state },
		{ type: 'game_end', handler: window.tournamentEvents.on_game_end },
	];
	return loadContent2(renderPlayground, 'tournament-room');
}

// const load_playground = () => {
// 	on_message_handlers = [...on_message_handlers,
// 		{ type: 'set_position', handler: window.tournamentEvents.on_set_position },
// 		{ type: 'game_start', handler: window.tournamentEvents.on_game_start },
// 		{ type: 'game_state', handler: window.tournamentEvents.on_game_state },
// 		{ type: 'game_end', handler: window.tournamentEvents.on_game_end },
// 	];
// 	loadContent(renderPlayground, 'tournament-room');
// }

/* -------------------------- Server communication -------------------------- */

const connect_socket = (tournament_name) => {
	// print("tournament_name: ", tournament_name);
	const wsurl = base_wsurl + tournament_name + '/';
	g_socket = new WebSocket(wsurl);

	// print("g_socket: ", g_socket);

	g_socket.onopen = function(event) {
		console.log('Socket opened: ', event);
	}

	g_socket.onmessage = function(event) {
		const msg = JSON.parse(event.data);
		on_message(msg);
	}

	g_socket.onclose = function(event) {
		console.log('Socket closed: ', event);
		// loadContent(renderTournamentOnline, 'main__content'); // maybe not ?
	}

	const on_page_change = () => {
		g_socket.close()
		window.removeEventListener('page_change', on_page_change)
		g_socket = {}
	}

	window.addEventListener('page_change', on_page_change)
}

const start_online_tournament = () => {
    // console.log('start_online_tournament');
    if (g_socket instanceof WebSocket && g_socket.readyState === WebSocket.OPEN) {
        g_socket.send(JSON.stringify({ event: 'load_playground' }));
    } else {
        console.error('Cannot send message: WebSocket is not open');
    }
}

function add_start_btn_listener() {
	const start_btn = document.getElementById('start-btn');
	start_btn.addEventListener('click', start_online_tournament);
}

/* ------------------------------- Page listener ---------------------------- */

function listenerTournamentRoom() {
	const navbarItems = document.querySelectorAll('.nav__link');
	navbarItems.forEach(item => {
		item.addEventListener('click', () => {
			if (g_socket instanceof WebSocket && g_socket.readyState === WebSocket.OPEN) {
				g_socket.close();
				leaveRoomName(g_tournament_name);
			}
		});
	});
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
		const response = await fetch('http://localhost:7890/api/tournamentOnline/', init); //! Change this to the correct URL
		
		if (!response.ok) {
			const text = await response.text();
			throw new Error(text);
		}
		
		const data = await response.json();
		g_data = data;
		// console.log("g_data: ", g_data);
		// !!! Attention, the tournament index may cause an error, would later be better to only allow 1 tournament in player's list
		console.log("g_data.tournaments[0].name: ", g_data.tournaments[0].name);
		// tournament_name
		console.log("tournament_name: ", tournament_name);
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