import {Player} from './PlayerOnline.js';
import {Ball} from './BallOnline.js';
import * as constants from './Constants.js';

/**
 * The path to the websockets is /ws/game/ and is in pong_online/routing.py (+ nginx configuration)
 *
 * TODO:[] Add a matchmaking placeholder
 */

const wsurl = 'ws://' + window.location.host + '/ws/rooms/'; // link to websocket
let g_websocket; // websocket

/**
 * What is a websocket?
 * A WebSocket is a communication protocol that makes it possible to establish a two-way communication channel between a server and a client.
 * In our case, the server is the Django server and the client is the browser.
 * The server can send messages to the client and the client can send messages to the server.
 * The pong game will be played in the browser, so the client will send messages to the server to update the game state.
 * And the server will send messages to the client to update the game state.
 */

/**
 * Outline of the functions:
 * - start: starts the game and initializes the websocket connection
 * - initDisplay: initializes the canvas
 * - initArena: initializes the players and the ball
 * - handle_scores: handles the scores of the players
 * - display_winner: displays the winner of the game
 *
 * - handleKeyDown: handles the keydown event
 * - handleKeyUp: handles the keyup event
 * - initControls: initializes the controls
 *
 * - updateGameState: updates the game state
 *
 * - drawBall: draws the ball
 * - drawScoreAndLine: draws the score and the line
 * - animate: animates the game
 * - render: renders the game
 *
 * - listenerTwoPlayersOnline: listens for the start button click
 * - loadTwoPlayersOnline: loads the game
 */

/* ---------------------------- GLOBALS VARIABLES --------------------------- */
var g_ball;
var g_id = null;
var g_position = null;
let g_first_launch = true;
var g_game_running = false;
var g_winner = null;
var g_player_left, g_player_right;
var g_template_text, g_button_container, g_startButton;
const g_keys = {};

// Boards
var g_board = null;
var g_context = null;
var g_board_winning_text;

/* ------------------------------ Utils & Inits ----------------------------- */

function intToHexColor(value) {
	// Convert the integer value to hexadecimal format
	var hexValue = value.toString(16);
	// Pad the string with zeros if necessary to ensure it has 6 digits
	var hexColor = '#' + hexValue.padStart(6, '0');
	return hexColor;
};

function sendMessageToServer(message) {
	g_websocket.send(JSON.stringify(message));
};

function initDisplay() {
	g_board = document.getElementById("board_two");
	g_context = g_board.getContext("2d");
	g_board.width = constants.WIN_WIDTH;
	g_board.height = constants.WIN_HEIGHT;
};

function initArena() {
	g_player_left = new Player(1, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_LEFT_COLOR, 2);
	g_player_right = new Player(2, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_RIGHT_COLOR, 2);
	g_ball = new Ball(2);
};

function handle_scores(player) {
	g_context.font = "50px sans-serif";
	g_context.fillStyle = "white";
	g_context.fillText(g_player_left.score, constants.WIN_WIDTH / 2 - 50, 50);
	g_context.fillText(g_player_right.score, constants.WIN_WIDTH / 2 + 25, 50);
};

function display_winner(winning_player) {
	g_ball.stop();

	if (winning_player === 'player_left') {
		g_winner = g_player_left.name;
		g_board_winning_text = g_player_left.name + " a gagné!";
	}
	else {
		g_winner = g_player_right.name;
		g_board_winning_text = g_player_right.name + " a gagné!";
	}
};

/* -------------------------------- Controls -------------------------------- */

/*
The event parameter contains information about the key that was pressed or released.
The function checks if the key was already in g_keys and if the key is 'W' or 'S'.
If the key was not in g_keys (key is pressed) and the key is 'W' or 'S',
	the function checks which one was pressed and sets the value of up accordingly.
If the key was in g_keys (key is released) and the key is 'W' or 'S',
	the function sets the value of the key in g_keys to false.
*/

function handleKeyDown(e) {
	if (g_game_running) {
		if (!g_keys[e.code] && (e.code == 'KeyW' || e.code == 'KeyS')) {
			var up = false;
			if (e.code == 'KeyW') {
				up = true;
			}
			g_keys[e.code] = true;
			sendMessageToServer({type: 'set_player_movement', player: g_position, is_moving: true, direction_v: up});
		}
	}
};

function handleKeyUp(e) {
	if (g_game_running) {
		if (e.code == 'KeyW' || e.code == 'KeyS') {
			g_keys[e.code] = false;
			sendMessageToServer({type: 'set_player_movement', player: g_position, is_moving: false, direction_v: 0});
		}
	}
};

function initControls() {
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
};

/* -------------------------------- GameState ------------------------------- */

function updateGameState(data) {
	g_player_left.y = data.player_left_y;
	g_player_right.y = data.player_right_y;
	g_ball.x = data.ball_x;
	g_ball.y = data.ball_y;

	if (g_ball.color != data.ball_color) {
		g_ball.setcolor(data.ball_color);
	}

	if (data.player_left_score != g_player_left.score) {
		g_player_left.score += 1;
		handle_scores('player_one');
	}

	if (data.player_right_score != g_player_right.score) {
		g_player_right.score += 1;
		handle_scores('player_two');
	}

	g_ball.get_update(data.ball_x, data.ball_y, data.ball_x_vel, data.ball_y_vel, data.ball_color);
};

/* ------------------------------ Draw the game ----------------------------- */

function drawBall(x, y, radius, color) {
	g_context.fillStyle = color;
	g_context.strokeStyle = "black";
	g_context.lineWidth = 2;
	g_context.beginPath();
	g_context.arc(x, y, radius, 0, Math.PI * 2, true);
	g_context.closePath();
	g_context.fill();
	g_context.stroke();
};

function drawScoreAndLine() {
	g_context.beginPath();
	g_context.setLineDash([5, 15]);
	g_context.moveTo(constants.WIN_WIDTH / 2, 0);
	g_context.lineTo(constants.WIN_WIDTH / 2, constants.WIN_HEIGHT);
	g_context.strokeStyle = "white";
	g_context.stroke();
	g_context.setLineDash([]);

	g_context.font = "50px sans-serif";
	g_context.fillStyle = "white";
	g_context.fillText(g_player_left.score, constants.WIN_WIDTH / 2 - 50, 50);
	g_context.fillText(g_player_right.score, constants.WIN_WIDTH / 2 + 25, 50);
};

function animate() {
	render();
	g_id = requestAnimationFrame(animate);
};

function render() {
	g_context.clearRect(0, 0, constants.WIN_WIDTH, constants.WIN_HEIGHT);

	// Draw the players
	g_context.fillStyle = g_player_left.color;
	g_context.fillRect(g_player_left.x, g_player_left.y, g_player_left.width, g_player_left.height);
	g_context.fillStyle = g_player_right.color;
	g_context.fillRect(g_player_right.x, g_player_right.y, g_player_right.width, g_player_right.height);

	// Draw the ball
	if (!g_ball.stop_flag) {
		drawBall(g_ball.x, g_ball.y, g_ball.radius, g_ball.color);
	}
	else {
		if (g_winner !== null) {
			if (g_winner === g_player_left.name) {
				g_context.fillStyle = g_player_left.color;
			}
			else {
				g_context.fillStyle = g_player_right.color;
			}
			g_context.font = "50px sans-serif";
			let text_width = g_context.measureText(g_board_winning_text).width;
			g_context.fillText(g_board_winning_text, (constants.WIN_WIDTH - text_width) / 2, constants.WIN_HEIGHT / 2);

			// lower the div button container
			g_button_container.style.top = "65%";
			g_startButton.innerHTML = "Chercher une autre partie";
			g_startButton.classList.remove("d-none");
		}
	}

	// Draw the score and the line
	drawScoreAndLine();
};

/* ---------------------------------- Main ---------------------------------- */

/**
 * Starts the game and initializes the WebSocket connection.
 */
export function start() {
	g_websocket = new WebSocket(wsurl);

	if (g_first_launch) {
		initDisplay();
		g_first_launch = false;
	}

	initArena();

	g_websocket.onopen = () => {
		console.log('Websocket connected');
	}

	g_websocket.onmessage = (e) => {
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
			g_position = data.position;
			if (g_position === "player_left") {
				g_player_left = new Player(g_position, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_LEFT_COLOR, 2);
				g_player_left.set_name(data.name);
				document.getElementById("two__online--left").classList.add("text-decoration-underline");
			}
			else {
				g_player_right = new Player(g_position, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_RIGHT_COLOR, 2);
				g_player_right.set_name(data.name);
				document.getElementById("two__online--right").classList.add("text-decoration-underline");
			}
			console.log('I am at position', g_position);
		}

		if (data.type === 'game_start') {
			console.log('Starting game . . .');

			// g_startButton.classList.add("d-none");
			g_template_text.innerHTML = "Adversaire trouvé! La partie commence . . .";

			if (g_position === "player_left") {
				g_player_right = new Player("player_right", constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_RIGHT_COLOR, 2);
				g_player_right.set_name(data.player_right);
			}
			else {
				g_player_left = new Player("player_left", constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_LEFT_COLOR, 2);
				g_player_left.set_name(data.player_left);
			}

			document.getElementById("two__online--left").textContent = g_player_left.name;
			document.getElementById("two__online--right").textContent = g_player_right.name;

			g_game_running = true;
			g_ball.get_update(constants.WIN_WIDTH / 2, constants.WIN_HEIGHT / 2, 1, 0, 0xffffff);
			initControls();
		}

		if (data.type === 'game_state') {
			updateGameState(data);
		}

		if (data.type === 'game_end') {
			g_game_running = false;
			console.log('Game over');
			display_winner(data.winner);
			g_websocket.close();
		}
	};

	g_websocket.onclose = () => {
		console.log('Websocket closed');
	}

	if (g_id !== null) {
		cancelAnimationFrame(g_id);
	}

	animate();
};

/* -------------------------- Login Event Listeners ------------------------- */

function listenerTwoPlayersOnline() {

	document.getElementById("startGame2Online").addEventListener("click", e => {
		e.preventDefault();

		// hide the start button
		document.getElementById("startGame2Online").classList.add("d-none");

		g_startButton = document.getElementById("startGame2Online");
		g_button_container = document.getElementById("button_container");

		g_template_text = document.getElementById("template_text");
		g_template_text.innerHTML = "En attente d'un adversaire";

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

	return 1; // Added to get the game for now instead of the try catch block
};

/* ------------------------ Leaving or reloading game ----------------------- */

window.addEventListener('unload', function() {
	if (g_websocket)
		sendMessageToServer({type: 'player_disconnect', player_pos: g_position})
});

function handlePageReload() {
	if (g_websocket)
		sendMessageToServer({type: 'player_disconnect', player_pos: g_position})
};

window.addEventListener('beforeunload', handlePageReload);

export default {
	listenerTwoPlayersOnline,
	loadTwoPlayersOnline
};
