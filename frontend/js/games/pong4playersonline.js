import {Player} from './PlayerOnline.js'
import {Ball} from './BallOnline.js'
import * as constants from './Constants.js'

/**
 * Currently the pong game is working with 2 different browsers.
 * The game logic is in pong_online/gamelogic.py
 * The requests are handled in pong_online/consumers.py and also the room logic are handled there
 * The path to the websockets is /ws/gameFour/ and is in pong_online/routing.py (+ nginx configuration)
 *
 * TODO:[] Add a matchmaking placeholder
 *
*/

const wsurl = 'ws://' + window.location.host + '/ws/gameFour/'; // link to websocket
let ws; // websocket

/**
 * Outline of the functions:
 * - startGame: starts the game and initializes the websocket connection
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
 * - listenerFourPlayersOnline: listens for the start button click
 * - loadFourPlayersOnlie: loads the game
*/

/* ---------------------------- GLOBALS VARIABLES --------------------------- */
var g_ball;
var g_id = null;
var g_position = null;
let g_first_launch = true;
var g_game_running = false;
var g_player_one, g_player_two, g_player_three, g_player_four;
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
	ws.send(JSON.stringify(message));
};

function initDisplay() {
	g_board = document.getElementById("board_four");
	g_context = g_board.getContext("2d");
	g_board.width = constants.WIN_WIDTH;
	g_board.height = constants.FOUR_WIN_HEIGHT;
};

function initArena() {
	g_player_one = new Player(1, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_1_COLOR, 4);
	g_player_two = new Player(2, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_2_COLOR, 4);
	g_player_three = new Player(3, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_3_COLOR);
	g_player_four = new Player(4, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_4_COLOR);
	g_ball = new Ball(4);
};

function handle_scores(player) {
	console.log("handle_scores " + player);
	g_context.font = "20px sans-serif";
	g_context.fillStyle = "black";
	g_context.fillText(g_player_one.score, 10, constants.FOUR_WIN_HEIGHT / 2);
	g_context.fillText(g_player_two.score, constants.WIN_WIDTH - 20, constants.FOUR_WIN_HEIGHT / 2);
	g_context.fillText(g_player_three.score, constants.WIN_WIDTH / 2, 20);
	g_context.fillText(g_player_four.score, constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT - 20);
};

function display_winner(winning_player) {
	g_ball.stop();

	if (winning_player === 'player_one') {
		g_board_winning_text = "Player 1 wins!";
	}
	else if (winning_player === 'player_two') {
		g_board_winning_text = "Player 2 wins!";
	}
	else if (winning_player === 'player_three') {
		g_board_winning_text = "Player 3 wins!";
	}
	else if (winning_player === 'player_four') {
		g_board_winning_text = "Player 4 wins!";
	}
};

/* -------------------------------- Controls -------------------------------- */

function handleKeyDown(e) {
	if (g_game_running) {
		if (!g_keys[e.code] && (e.code == 'KeyW' || e.code == 'KeyS')) {
			var up = false;
			if (e.code == 'KeyW') {
				up = true;
			}
			g_keys[e.code] = true;
			sendMessageToServer({type: 'player_key_down', player: g_position, direction: up});
		}
		if (!g_keys[e.code] && (e.code == 'KeyJ' || e.code == 'KeyK')) {
			var left = false;
			if (e.code == 'KeyJ') {
				left = true;
			}
			g_keys[e.code] = true;
			sendMessageToServer({type: 'player_key_down', player: g_position, direction: left});
		}
	}
};

function handleKeyUp(e) {
	if (g_game_running) {
		if (e.code == 'KeyW' || e.code == 'KeyS') {
			g_keys[e.code] = false;
			sendMessageToServer({type: 'player_key_up', player: g_position});
		}
		if (e.code == 'KeyJ' || e.code == 'KeyK') {
			g_keys[e.code] = false;
			sendMessageToServer({type: 'player_key_up', player: g_position});
		}
	}
};

function initControls() {
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
};

/* -------------------------------- GameState ------------------------------- */

function updateGameState(data) {
	g_player_one.y = data.player_one_pos_y;
	g_player_two.y = data.player_two_pos_y;
	g_player_three.x = data.player_three_pos_x;
	g_player_four.x = data.player_four_pos_x;
	g_ball.x = data.ball_x;
	g_ball.y = data.ball_y;

	if (g_ball.color != data.ball_color) {
		g_ball.setcolor(data.ball_color);
	}

	if (data.player_one_score != g_player_one.score) {
		g_player_one.score += 1;
		handle_scores('player_one');
	}

	if (data.player_two_score != g_player_two.score) {
		g_player_two.score += 1;
		handle_scores('player_two');
	}

	if (data.player_three_score != g_player_three.score) {
		g_player_three.score += 1;
		handle_scores('player_three');
	}

	if (data.player_four_score != g_player_four.score) {
		g_player_four.score += 1;
		handle_scores('player_four');
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
	// Draw the horizontal line
	g_context.beginPath();
	g_context.setLineDash([5, 15]);
	g_context.moveTo(constants.WIN_WIDTH / 2, 0);
	g_context.lineTo(constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT);
	g_context.strokeStyle = "white";
	g_context.stroke();
	g_context.setLineDash([]);

	// Draw the vertical line
	g_context.beginPath();
	g_context.setLineDash([5, 15]);
	g_context.moveTo(0, constants.FOUR_WIN_HEIGHT / 2);
	g_context.lineTo(constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT / 2);
	g_context.strokeStyle = "white";
	g_context.stroke();
	g_context.setLineDash([]);

	// Draw the scores
	g_context.font = "20px sans-serif";
	g_context.fillStyle = "black";
	g_context.fillText(g_player_one.score, 10, constants.FOUR_WIN_HEIGHT / 2);
	g_context.fillText(g_player_two.score, constants.WIN_WIDTH - 20, constants.FOUR_WIN_HEIGHT / 2);
	g_context.fillText(g_player_three.score, constants.WIN_WIDTH / 2, 20);
	g_context.fillText(g_player_four.score, constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT - 20);
};

function animate() {
	render();
	g_id = requestAnimationFrame(animate);
};

function render() {
	g_context.clearRect(0, 0, constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT);

	// Draw the players
	g_context.fillStyle = g_player_one.color;
	g_context.fillRect(g_player_one.x, g_player_one.y, g_player_one.width, g_player_one.height);
	g_context.fillStyle = g_player_two.color;
	g_context.fillRect(g_player_two.x, g_player_two.y, g_player_two.width, g_player_two.height);
	g_context.fillStyle = g_player_three.color;
	g_context.fillRect(g_player_three.x, g_player_three.y, g_player_three.height, g_player_three.width);
	g_context.fillStyle = g_player_four.color;
	g_context.fillRect(g_player_four.x, g_player_four.y, g_player_four.height, g_player_four.width);

	// Draw the ball
	if (!g_ball.stop_flag) {
		drawBall(g_ball.x, g_ball.y, g_ball.radius, intToHexColor(g_ball.color));
	}
	else {
		if (g_board_winning_text) {
			g_context.fillStyle = "white";
			g_context.font = "50px sans-serif";
			let text_width = g_context.measureText(g_board_winning_text).width;
			g_context.fillText(g_board_winning_text, (constants.WIN_WIDTH - text_width) / 2, constants.FOUR_WIN_HEIGHT / 2);
		}

		// lower the div button container
		g_button_container.style.top = "65%";
		g_startButton.innerHTML = "Look for another game";
		g_startButton.classList.remove("d-none");
	}

	// Draw the score and the line
	drawScoreAndLine();
};

/* ---------------------------------- Main ---------------------------------- */

/**
 * Starts the game and initializes the WebSocket connection.
 */
export function startGame() {
	ws = new WebSocket(wsurl);

	if (g_first_launch) {
		initDisplay();
		g_first_launch = false;
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
		 * game_end_left: the server sends a message to end the game because a player left
		 */
		const data = JSON.parse(e.data);

		if (data.type === 'set_position') {
			g_position = data.value;
			console.log('I am at position', g_position);
			gameUpdateListener();
		}

		if (data.type === 'game_start') {
			console.log('Starting game . . .');

			// g_startButton.classList.add("d-none");
			g_template_text.innerHTML = "Found player! Game starting . . .";
			g_game_running = true;
			g_ball.get_update(constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT / 2, 1, 0, 0xffffff);
			initControls();
		}

		if (data.type === 'game_state') {
			updateGameState(data);
		}

		if (data.type === 'game_end') {
			g_game_running = false;
			console.log('Game over');
			display_winner(data.winner);
			ws.close();
		}

		if (data.type === 'game_end_left') {
			g_game_running = false;
			console.log('Game over');
			g_ball.stop();
			g_board_winning_text = "Player left the game";
			ws.close();
		}
	};

	ws.onclose = () => {
		console.log('Websocket closed');
	}

	if (g_id !== null) {
		cancelAnimationFrame(g_id);
	}

	animate();
};

/* ------------------------ Leaving or reloading game ----------------------- */

window.addEventListener('unload', function() {
	if (ws)
		sendMessageToServer({type: 'player_left', player: g_position});
});

function handlePageReload() {
	if (ws)
		sendMessageToServer({type: 'player_left', player: g_position});
};

window.addEventListener('beforeunload', handlePageReload);

/* -------------------------- Event Listeners ------------------------- */

function listenerFourPlayersOnline() {

	g_startButton = document.getElementById("startGame4Online");
	g_template_text = document.getElementById("template_text");
	g_button_container = document.getElementById("button_container");

	g_startButton.addEventListener("click", e => {
		e.preventDefault();

		g_startButton.classList.add("d-none");

		g_template_text.innerHTML = "En attente d'autres joueurs. . .";

		startGame();

		gameUpdateListener();
	});
};

function gameUpdateListener() {

	const instructions = document.getElementById("instructions");

	if (g_position === "player_one") {
		g_template_text.innerHTML = "Vous êtes le joueur Gauche";
		document.getElementById("four__online--leftPlayer").style.color = constants.FOUR_PLAYER_1_COLOR;
		document.getElementById("four__online--leftPlayer").classList.replace("h4", "h3");
		instructions.innerHTML = "Utilisez les touches W et S pour bouger";
		instructions.style.color = constants.FOUR_PLAYER_1_COLOR;
	}
	else if (g_position === "player_two") {
		g_template_text.innerHTML = "Vous êtes le joueur Droit";
		document.getElementById("four__online--rightPlayer").style.color = constants.FOUR_PLAYER_2_COLOR;
		document.getElementById("four__online--leftPlayer").classList.replace("h4", "h3");
		instructions.innerHTML = "Utilisez les touches W et S pour bouger";
		instructions.style.color = constants.FOUR_PLAYER_2_COLOR;
	}
	else if (g_position === "player_three") {
		g_template_text.innerHTML = "Vous êtes le joueur Haut";
		document.getElementById("four__online--topPlayer").style.color = constants.FOUR_PLAYER_3_COLOR;
		document.getElementById("four__online--leftPlayer").classList.replace("h4", "h3");
		instructions.innerHTML = "Utilisez les touches J et K pour bouger";
		instructions.style.color = constants.FOUR_PLAYER_3_COLOR;
	}
	else if (g_position === "player_four") {
		g_template_text.innerHTML = "Vous êtes le joueur Bas";
		document.getElementById("four__online--bottomPlayer").style.color = constants.FOUR_PLAYER_4_COLOR;
		document.getElementById("four__online--leftPlayer").classList.replace("h4", "h3");
		instructions.innerHTML = "Utilisez les touches J et K pour bouger";
		instructions.style.color = constants.FOUR_PLAYER_4_COLOR;
	}
};

async function loadFourPlayersOnline() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "http://" + window.location.host

		const response = await fetch(hostnameport + '/api/fourplayeronline/', init);

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}

		return 1;
	} catch (e) {
		console.error(e);
		return 0;
	}
};

export default {
	listenerFourPlayersOnline,
	loadFourPlayersOnline
};