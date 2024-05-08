import {Player} from './PlayerOnline.js';
import {Ball} from './BallOnline.js';
import * as constants from './Constants.js';
import {g_socket, g_alias} from './tournamentRoom.js';

/**
 * The path to the websockets is /ws/gameTwo/ and is in pong_online/routing.py (+ nginx configuration)
 *
 * TODO:[] Add a matchmaking placeholder
 */

const wsurl = 'wss://' + window.location.host + '/wss/gameTwo/'; // link to websocket
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
 * - sendMessageToServer: sends a message to the server
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
 * - setPositionStyleUpdate: updates some content of the page when receiving the 'set_position' message
 * - gameStartStyleUpdate: updates some content of the page when receiving the 'game_start' message
 * - start: starts the game and initializes the websocket connection
 *
 * - Listeners for page reload and unload
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
var g_template_text, g_instructions, g_startButton;
var g_left_container, g_right_container;
const g_keys = {};

// Boards
var g_board = null;
var g_context = null;
var g_board_winning_text;

/* ------------------------------ Utils & Inits ----------------------------- */

function sendMessageToServer(message) {
	g_websocket.send(JSON.stringify(message));
};

function initDisplay() {

	if (g_board != null) {
		g_board = null;
		g_context = null;
	}

	g_board = document.getElementById("board_two");
	g_context = g_board.getContext("2d");
	g_board.width = constants.WIN_WIDTH;
	g_board.height = constants.WIN_HEIGHT;
};

function initArena() {
	g_player_left = new Player("player_left", constants.PADDLE_WIDTH,
								constants.PADDLE_HEIGHT, constants.PLAYER_LEFT_COLOR, 2);
	g_player_right = new Player("player_right", constants.PADDLE_WIDTH,
								constants.PADDLE_HEIGHT, constants.PLAYER_RIGHT_COLOR, 2);
	g_ball = new Ball(2);
};

function handle_scores() {
	g_context.font = "50px sans-serif";
	g_context.fillStyle = "white";
	g_context.fillText(g_player_left.score, constants.WIN_WIDTH / 2 - 50, 50);
	g_context.fillText(g_player_right.score, constants.WIN_WIDTH / 2 + 25, 50);
};

function display_winner(winning_player) {
	g_ball.stop();

	if (winning_player === 'player_left') {
		g_winner = g_player_left;
		g_board_winning_text = g_winner.name + " a gagné!";
	}
	else {
		g_winner = g_player_right;
		g_board_winning_text = g_winner.name + " a gagné!";
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
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
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
		handle_scores();
	}

	if (data.player_right_score != g_player_right.score) {
		g_player_right.score += 1;
		handle_scores();
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
	// Draw the vertical line
	g_context.beginPath();
	g_context.setLineDash([5, 15]);
	g_context.moveTo(constants.WIN_WIDTH / 2, 0);
	g_context.lineTo(constants.WIN_WIDTH / 2, constants.WIN_HEIGHT);
	g_context.strokeStyle = "white";
	g_context.stroke();
	g_context.setLineDash([]);

	// Draw the scores
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
	if (!g_ball.stop_flag && g_game_running) {
		drawBall(g_ball.x, g_ball.y, g_ball.radius, g_ball.color);
	}
	else {
		if (g_winner !== null) {
			g_template_text.textContent = g_board_winning_text;
			g_template_text.style.color = g_winner.color;
			g_startButton.classList.remove("d-none");
		}
	}

	// Draw the score and the line
	drawScoreAndLine();
};

/* ---------------------------------- Main ---------------------------------- */

function setPositionStyleUpdate(data) {

	if (g_position === "player_left") {
		g_player_left.set_name(data.name);
		g_left_container.classList.add("text-decoration-underline");
		g_left_container.style.color = constants.PLAYER_LEFT_COLOR;
		g_instructions.textContent = "Ton camp est à gauche";
		g_instructions.style.color = constants.PLAYER_LEFT_COLOR;
	}
	else {
		g_player_right.set_name(data.name);
		g_right_container.classList.add("text-decoration-underline");
		g_right_container.style.color = constants.PLAYER_RIGHT_COLOR;
		g_instructions.textContent = "Ton camp est à droite";
		g_instructions.style.color = constants.PLAYER_RIGHT_COLOR;
	}
};

function gameStartStyleUpdate(data) {

	g_player_right.set_name(data.player_right);
	g_player_left.set_name(data.player_left);

	g_left_container.textContent = g_player_left.name;
	g_left_container.style.color = constants.PLAYER_LEFT_COLOR;
	g_right_container.textContent = g_player_right.name;
	g_right_container.style.color = constants.PLAYER_RIGHT_COLOR;
};

function resetVarStyle() {
	g_player_left = null;
	g_player_right = null;
	g_websocket = null;
	g_template_text.style.color = "";
	g_winner = null;
	g_board = null;
	g_context = null;
}

/**
 * Starts the game and initializes the WebSocket connection.
 */
export function start() {
	if (g_websocket != undefined)
		resetVarStyle();

	g_websocket = new WebSocket(wsurl);

	// Remove a possible underline from the player's name
	g_left_container.classList.remove("text-decoration-underline");
	g_right_container.classList.remove("text-decoration-underline");

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
			console.log('I am at position', g_position);
			setPositionStyleUpdate(data);
		}

		if (data.type === 'ready') {

			g_template_text.textContent = "Adversaire trouvé ...";
			gameStartStyleUpdate(data);

			let count = 0;
			let interval = setInterval(() => {
				count++;

				document.getElementById("canvas--text").textContent = "La partie commence dans " + (5 - count);

				if (count === 5) {
					clearInterval(interval);
					document.getElementById("canvas--text").textContent = "";

					if (g_position === "player_left" && g_websocket.readyState == 1)
						g_websocket.send(JSON.stringify({type: 'start_game'}));
				}
			}, 1000);
		}

		if (data.type === 'game_start') {
			console.log('Starting game . . .');

			g_template_text.textContent = "C'est parti !";

			g_game_running = true;
			g_ball.get_update(constants.WIN_WIDTH / 2, constants.WIN_HEIGHT / 2, 1, 0, 0xffffff);
			initControls();
		}

		if (data.type === 'game_state') {
			updateGameState(data);
		}

		if (data.type === 'player_disconnect') {
			g_game_running = false;
			g_template_text.style.color = "black";
			g_template_text.textContent = data.player_name + " a quitté la partie. Tu gagne cette partie.";
			g_startButton.classList.remove("d-none");
			g_websocket.close();
			g_board = null;
			g_context = null;;
			setTimeout(() => {
				cancelAnimationFrame(g_id);
			}, 500);
		}

		if (data.type === 'game_end') {
			g_game_running = false;
			console.log('Game over ' + data.winner);
			display_winner(data.winner);
			g_websocket.close();
			g_board = null;
			g_context = null;;
			setTimeout(() => {
				cancelAnimationFrame(g_id);
			}, 500);
		}
	};

	g_websocket.onclose = () => {
		console.log('Websocket closed');
		g_board = null;
		g_context = null;
		setTimeout(() => {
			cancelAnimationFrame(g_id);
		}, 500);
		return;
	}

	if (g_id !== null) {
		cancelAnimationFrame(g_id);
		g_board = null;
		g_context = null;;
	}

	animate();
};

/* ------------------------ Leaving or reloading game ----------------------- */

function handlePageReload() {
	cancelAnimationFrame(g_id);
	resetVarStyle();
};

window.addEventListener('beforeunload', handlePageReload);

/* ----------------------------- Event Listeners ---------------------------- */

function listenerTwoPlayersOnline() {

	g_startButton = document.getElementById("startGame2Online");
	g_template_text = document.getElementById("template_text");
	g_instructions = document.getElementById("instructions");
	g_left_container = document.getElementById("two__online--left");
	g_right_container = document.getElementById("two__online--right");

	// Reset the content and color of placeholder text
	g_template_text.textContent = "";
	g_template_text.style.color = "";
	g_instructions.textContent = "";
	g_instructions.style.color = "";

	g_startButton.addEventListener("click", e => {
		e.preventDefault();

		// hide the start button and reset some placeholder text
		g_startButton.classList.add("d-none");
		g_template_text.textContent = "En attente d'un adversaire";
		g_template_text.style.color = "";

		start();
	});

	// Listen for a button from the menu bar being clicked
	const navbarItems = document.querySelectorAll('.nav__item');
	navbarItems.forEach(item => {
		item.addEventListener('click', () => {
			if (g_websocket instanceof WebSocket && g_websocket.readyState === WebSocket.OPEN) {
				g_websocket.close();
				cancelAnimationFrame(g_id);
				resetVarStyle();
			}
		});
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
		let hostnameport = "https://" + window.location.host;

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

export default {
	listenerTwoPlayersOnline,
	loadTwoPlayersOnline
};
