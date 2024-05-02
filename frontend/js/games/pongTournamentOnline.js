import {Player} from './PlayerOnline.js';
import {Ball} from './BallOnline.js';
import * as constants from './Constants.js';
import {g_socket, g_alias} from './tournamentRoom.js';

const wsurl = 'ws://' + window.location.host + '/ws/game/'; // link to websocket
let ws; // websocket

/* -------------------------------- Variables ------------------------------- */
var game_running, player_one, player_two, ball, winning_text, startButton;
var infoElement, button_container;
let playerField;

var position = null;
var id = null;
let first_launch = true;
const keys = {};

game_running = false;

// Boards
var board = null;
var context = null;

/* ------------------------------ Utils & Inits ----------------------------- */

function intToHexColor(value) {
    // Convert the integer value to hexadecimal format
    var hexValue = value.toString(16);
    // Pad the string with zeros if necessary to ensure it has 6 digits
    var hexColor = '#' + hexValue.padStart(6, '0');
    return hexColor;
}

function sendMessageToServer(message) {
	ws.send(JSON.stringify(message));

}

function initDisplay() {
	board = document.getElementById("board_two");
	context = board.getContext("2d");
	board.width = constants.WIN_WIDTH;
	board.height = constants.WIN_HEIGHT;
}

function initArena() {
	player_one = new Player(1, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_1_COLOR, 2);
	player_two = new Player(2, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_2_COLOR, 2);
	ball = new Ball(2);
	// console.log("Ball color: ", ball.color);
}

function handle_scores(player) {
	context.font = "50px sans-serif";
	context.fillStyle = "white";
	context.fillText(player_one.score, constants.WIN_WIDTH / 2 - 50, 50);
	context.fillText(player_two.score, constants.WIN_WIDTH / 2 + 25, 50);
}

function display_winner(winning_player) {
	ball.stop();

	if (winning_player === 'player_one') {
		winning_text = "Player 1 wins!";
	}
	else {
		winning_text = "Player 2 wins!";
	}
}

/* -------------------------------- Controls -------------------------------- */

function handleKeyDown(e) {
	if (game_running) {
		if (!keys[e.code] && (e.code == 'KeyW' || e.code == 'KeyS')) {
			var up = false;
			if (e.code == 'KeyW') {
				up = true;
			}
			keys[e.code] = true;
			sendMessageToServer({type: 'player_key_down', player: position, direction: up});
		}
	}
}

function handleKeyUp(e) {
	if (game_running) {
		if (e.code == 'KeyW' || e.code == 'KeyS') {
			keys[e.code] = false;
			sendMessageToServer({type: 'player_key_up', player: position});
		}
	}
}

let g_pressed = false;

const t_handleKeyDown = (e) => {
	if (!game_running && (e.code != "KeyW" && e.code != "KeyS")) {
		return;
	}
	if (g_pressed) {
		return;
	}

	if (e.code == "KeyW")
		g_socket.send(JSON.stringify({event: 'player_key_down', player: position, direction: true}));
	if (e.code == "KeyS")
		g_socket.send(JSON.stringify({event: 'player_key_down', player: position, direction: false}));
	g_pressed = true;
}

const t_handleKeyUp = (e) => {
	if (game_running && (e.code == "KeyW" || e.code == "KeyS")) {
		g_pressed = false;
		g_socket.send(JSON.stringify({event: 'player_key_up', player: position}));
	}
}

function initControls() {
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
}

/* -------------------------------- GameState ------------------------------- */

function updateGameState(data) {
	player_one.y = data.player_one_pos_y;
	player_two.y = data.player_two_pos_y;
	ball.x = data.ball_x;
	ball.y = data.ball_y;

	if (ball.color != data.ball_color) {
		ball.setcolor(data.ball_color);
	}

	if (data.player_one_score != player_one.score) {
		player_one.score += 1;
		handle_scores('player_one');
	}

	if (data.player_two_score != player_two.score) {
		player_two.score += 1;
		handle_scores('player_two');
	}

	ball.get_update(data.ball_x, data.ball_y, data.ball_x_vel, data.ball_y_vel, data.ball_color);
}

/* ------------------------------ Draw the game ----------------------------- */

function drawBall(x, y, radius, color) {
	context.fillStyle = color;
	context.strokeStyle = "black";
	context.lineWidth = 2;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();
	context.stroke();
}

function drawScoreAndLine() {
	context.beginPath();
	context.setLineDash([5, 15]);
	context.moveTo(constants.WIN_WIDTH / 2, 0);
	context.lineTo(constants.WIN_WIDTH / 2, constants.WIN_HEIGHT);
	context.strokeStyle = "white";
	context.stroke();
	context.setLineDash([]);

	context.font = "50px sans-serif";
	context.fillStyle = "white";
	context.fillText(player_one.score, constants.WIN_WIDTH / 2 - 50, 50);
	context.fillText(player_two.score, constants.WIN_WIDTH / 2 + 25, 50);
}

function animate() {
	render();
	id = requestAnimationFrame(animate);
}

function render() {
	context.clearRect(0, 0, constants.WIN_WIDTH, constants.WIN_HEIGHT);

	// Draw the players
	context.fillStyle = player_one.color;
	context.fillRect(player_one.x, player_one.y, player_one.width, player_one.height);
	context.fillStyle = player_two.color;
	context.fillRect(player_two.x, player_two.y, player_two.width, player_two.height);

	// Draw the ball
	if (!ball.stop_flag) {
		drawBall(ball.x, ball.y, ball.radius, intToHexColor(ball.color));
	}
	else {
		if (winning_text) {
			context.fillStyle = "white";
			context.font = "50px sans-serif";
			let text_width = context.measureText(winning_text).width;
			context.fillText(winning_text, (constants.WIN_WIDTH - text_width) / 2, constants.WIN_HEIGHT / 2);
		}
	}

	// Draw the score and the line
	drawScoreAndLine();

}

/* ---------------------------------- Main ---------------------------------- */

/**
 * Starts the game and initializes the WebSocket connection.
 */
export function start() {
	ws = new WebSocket(wsurl);

	if (first_launch) {
		initDisplay();
		first_launch = false;
	}

	initArena();

	ws.onopen = () => {
		console.log('Websocket connected');
	}

	ws.onmessage = (e) => {
		/**
		 * Possible types: set_position, game_start, game_state, game_end
		 *
		 * set_position: the server sends the position of the player
		 * game_start: the server sends a message to start the game
		 * game_state: the server sends the game state (positions of the players and the ball)
		 * game_end: the server sends a message to end the game
		 */
		const data = JSON.parse(e.data);

		if (data.type === 'set_position') {
			position = data.value;
			console.log('I am at position', position);
		}

		if (data.type === 'game_start') {
			console.log('Starting game . . .');

			// startButton.classList.add("d-none");
			infoElement.innerHTML = "Found player! Game starting . . .";
			game_running = true;
			ball.get_update(constants.WIN_WIDTH / 2, constants.WIN_HEIGHT / 2, 1, 0, 0xffffff);
			initControls();
		}

		if (data.type === 'game_state') {
			updateGameState(data);
		}

		if (data.type === 'game_end') {
			game_running = false;
			console.log('Game over');
			display_winner(data.winner);
			ws.close();
		}
	};

	ws.onclose = () => {
		console.log('Websocket closed');
	}

	if (id !== null) {
		cancelAnimationFrame(id);
	}

	animate();
}

/* ----------------------------- Main Tournament ---------------------------- */

export function startTournamentOnline() {
	infoElement = document.getElementById("infoElement");
	playerField = document.getElementById("playerField");

	if (first_launch) {
		initDisplay();
		first_launch = false;
		initArena();
	}
	else {
		initArena();
		first_launch = false;
	}

	if (id !== null) {
		cancelAnimationFrame(id);
	}
	animate();
}

/* ---------------------------- TournamentEvents ---------------------------- */

const on_set_position = (arg) => {
	initArena();
	// console.log('Setting position', arg);
	position = null;
	if (arg.players[0] === g_alias)
		position = 'player_one';
	if (arg.players[1] === g_alias)
		position = 'player_two';

	// console.log('Position set to', position);

	if (infoElement === null) {
		infoElement = document.getElementById("InfoElement");
		playerField = document.getElementById("playerField");
	}
	infoElement.innerHTML = 'BE READY, ' + arg.state + ' WILL START IN 5'
	playerField.innerHTML = '<span style="color: cyan;">' + arg.players[0] + '</span> VS <span style="color: red;">' + arg.players[1] + '</span>';

	let count = 0;
	let interval = setInterval(() => {
		count++;
		infoElement.innerHTML = 'BE READY, ' + arg.state + ' WILL START IN ' + (5 - count);
		if (count === 5) {
			clearInterval(interval);
			infoElement.innerHTML = 'Go !';

			if (arg.players[0] === g_alias)
				g_socket.send(JSON.stringify({event: 'game_start'}));

		}
	}, 1000);
}

const on_game_start = () => {
	game_running = true;
	ball.get_update(constants.WIN_WIDTH / 2, constants.WIN_HEIGHT / 2, 1, 0, 0xffffff);

	if (position) {
		window.addEventListener('keydown', t_handleKeyDown);
		window.addEventListener('keyup', t_handleKeyUp);
	}
}

const on_game_state = (arg) => {
	updateGameState(arg);
}

const on_game_end = (arg) => {
	game_running = false;
	display_winner(arg.winner);
}

export { on_set_position, on_game_start, on_game_state, on_game_end }

/* -------------------------- Login Event Listeners ------------------------- */

function listenerTwoPlayersOnline() {

	document.getElementById("startGame2Online").addEventListener("click", e => {
		e.preventDefault();

		// hide the start button
		document.getElementById("startGame2Online").classList.add("d-none");


		startButton = document.getElementById("startGame2Online");
		button_container = document.getElementById("button_container");

		infoElement = document.getElementById("infoElement");
		infoElement.innerHTML = "Waiting for other player";

		start();
	});
};

async function loadTwoPlayersOnline() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "http://" + window.location.host;

		const response = await fetch(hostnameport + '/api/twoplayeronline/', init);

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}

		return 1;
	} catch (e) {
		console.error("loadTwoPlayers: " + e);
		return 0;
	}
};

/* ------------------------ Leaving or reloading game ----------------------- */

window.addEventListener('unload', function() {
	if (ws)
		sendMessageToServer({type: 'player_left', player: position})
})

function handlePageReload() {
	if (ws)
		sendMessageToServer({type: 'player_left', player: position})
}

window.addEventListener('beforeunload', handlePageReload);

export default {
	listenerTwoPlayersOnline,
	loadTwoPlayersOnline
};
