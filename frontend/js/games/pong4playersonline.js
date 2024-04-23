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

/* -------------------------------- Variables ------------------------------- */
var ball, winning_text;
var player_one, player_two, player_three, player_four;
var template_text, button_container, startButton;
var position = null;
var id = null;
let first_launch = true;
const keys = {};
var game_running = false;

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
};

function sendMessageToServer(message) {
	ws.send(JSON.stringify(message));
};

function initDisplay() {
	board = document.getElementById("board_four");
	context = board.getContext("2d");
	board.width = constants.WIN_WIDTH;
	board.height = constants.FOUR_WIN_HEIGHT;
};

function initArena() {
	player_one = new Player(1, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_1_COLOR, 4);
	player_two = new Player(2, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_2_COLOR, 4);
	player_three = new Player(3, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_3_COLOR);
	player_four = new Player(4, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_4_COLOR);
	ball = new Ball(4);
};

function handle_scores(player) {
	console.log("handle_scores " + player);
	context.font = "20px sans-serif";
	context.fillStyle = "black";
	context.fillText(player_one.score, 10, constants.FOUR_WIN_HEIGHT / 2);
	context.fillText(player_two.score, constants.WIN_WIDTH - 20, constants.FOUR_WIN_HEIGHT / 2);
	context.fillText(player_three.score, constants.WIN_WIDTH / 2, 20);
	context.fillText(player_four.score, constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT - 20);
};

function display_winner(winning_player) {
	ball.stop();

	if (winning_player === 'player_one') {
		winning_text = "Player 1 wins!";
	}
	else if (winning_player === 'player_two') {
		winning_text = "Player 2 wins!";
	}
	else if (winning_player === 'player_three') {
		winning_text = "Player 3 wins!";
	}
	else if (winning_player === 'player_four') {
		winning_text = "Player 4 wins!";
	}
};

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
		if (!keys[e.code] && (e.code == 'KeyJ' || e.code == 'KeyK')) {
			var left = false;
			if (e.code == 'KeyJ') {
				left = true;
			}
			keys[e.code] = true;
			sendMessageToServer({type: 'player_key_down', player: position, direction: left});
		}
	}
};

function handleKeyUp(e) {
	if (game_running) {
		if (e.code == 'KeyW' || e.code == 'KeyS') {
			keys[e.code] = false;
			sendMessageToServer({type: 'player_key_up', player: position});
		}
		if (e.code == 'KeyJ' || e.code == 'KeyK') {
			keys[e.code] = false;
			sendMessageToServer({type: 'player_key_up', player: position});
		}
	}
};

function initControls() {
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
};

/* -------------------------------- GameState ------------------------------- */

function updateGameState(data) {
	player_one.y = data.player_one_pos_y;
	player_two.y = data.player_two_pos_y;
	player_three.x = data.player_three_pos_x;
	player_four.x = data.player_four_pos_x;
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

	if (data.player_three_score != player_three.score) {
		player_three.score += 1;
		handle_scores('player_three');
	}

	if (data.player_four_score != player_four.score) {
		player_four.score += 1;
		handle_scores('player_four');
	}

	ball.get_update(data.ball_x, data.ball_y, data.ball_x_vel, data.ball_y_vel, data.ball_color);
};

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
};

function drawScoreAndLine() {
	// Draw the horizontal line
	context.beginPath();
	context.setLineDash([5, 15]);
	context.moveTo(constants.WIN_WIDTH / 2, 0);
	context.lineTo(constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT);
	context.strokeStyle = "white";
	context.stroke();
	context.setLineDash([]);

	// Draw the vertical line
	context.beginPath();
	context.setLineDash([5, 15]);
	context.moveTo(0, constants.FOUR_WIN_HEIGHT / 2);
	context.lineTo(constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT / 2);
	context.strokeStyle = "white";
	context.stroke();
	context.setLineDash([]);

	// Draw the scores
	context.font = "20px sans-serif";
	context.fillStyle = "black";
	context.fillText(player_one.score, 10, constants.FOUR_WIN_HEIGHT / 2);
	context.fillText(player_two.score, constants.WIN_WIDTH - 20, constants.FOUR_WIN_HEIGHT / 2);
	context.fillText(player_three.score, constants.WIN_WIDTH / 2, 20);
	context.fillText(player_four.score, constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT - 20);
};

function animate() {
	render();
	id = requestAnimationFrame(animate);
};

function render() {
	context.clearRect(0, 0, constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT);

	// Draw the players
	context.fillStyle = player_one.color;
	context.fillRect(player_one.x, player_one.y, player_one.width, player_one.height);
	context.fillStyle = player_two.color;
	context.fillRect(player_two.x, player_two.y, player_two.width, player_two.height);
	context.fillStyle = player_three.color;
	context.fillRect(player_three.x, player_three.y, player_three.height, player_three.width);
	context.fillStyle = player_four.color;
	context.fillRect(player_four.x, player_four.y, player_four.height, player_four.width);

	// Draw the ball
	if (!ball.stop_flag) {
		drawBall(ball.x, ball.y, ball.radius, intToHexColor(ball.color));
	}
	else {
		if (winning_text) {
			context.fillStyle = "white";
			context.font = "50px sans-serif";
			let text_width = context.measureText(winning_text).width;
			context.fillText(winning_text, (constants.WIN_WIDTH - text_width) / 2, constants.FOUR_WIN_HEIGHT / 2);
		}

		// lower the div button container
		button_container.style.top = "65%";
		startButton.innerHTML = "Look for another game";
		startButton.classList.remove("d-none");
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
			gameUpdateListener();
		}

		if (data.type === 'game_start') {
			console.log('Starting game . . .');

			// startButton.classList.add("d-none");
			template_text.innerHTML = "Found player! Game starting . . .";
			game_running = true;
			ball.get_update(constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT / 2, 1, 0, 0xffffff);
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
};

/* ------------------------ Leaving or reloading game ----------------------- */

window.addEventListener('unload', function() {
	if (ws)
		sendMessageToServer({type: 'player_left', player: position});
});

function handlePageReload() {
	if (ws)
		sendMessageToServer({type: 'player_left', player: position});
};

window.addEventListener('beforeunload', handlePageReload);

/* -------------------------- Event Listeners ------------------------- */

function listenerFourPlayersOnline() {

	startButton = document.getElementById("startGame4Online");
	template_text = document.getElementById("template_text");
	button_container = document.getElementById("button_container");

	startButton.addEventListener("click", e => {
		e.preventDefault();

		startButton.classList.add("d-none");

		template_text.innerHTML = "En attente d'autres joueurs. . .";

		startGame();

		gameUpdateListener();
	});
};

function gameUpdateListener() {

	const instructions = document.getElementById("instructions");

	if (position === "player_one") {
		template_text.innerHTML = "Vous êtes le joueur Gauche";
		document.getElementById("four__online--leftPlayer").style.color = constants.FOUR_PLAYER_1_COLOR;
		document.getElementById("four__online--leftPlayer").classList.replace("h4", "h3");
		instructions.innerHTML = "Utilisez les touches W et S pour bouger";
		instructions.style.color = constants.FOUR_PLAYER_1_COLOR;
	}
	else if (position === "player_two") {
		template_text.innerHTML = "Vous êtes le joueur Droit";
		document.getElementById("four__online--rightPlayer").style.color = constants.FOUR_PLAYER_2_COLOR;
		document.getElementById("four__online--leftPlayer").classList.replace("h4", "h3");
		instructions.innerHTML = "Utilisez les touches W et S pour bouger";
		instructions.style.color = constants.FOUR_PLAYER_2_COLOR;
	}
	else if (position === "player_three") {
		template_text.innerHTML = "Vous êtes le joueur Haut";
		document.getElementById("four__online--topPlayer").style.color = constants.FOUR_PLAYER_3_COLOR;
		document.getElementById("four__online--leftPlayer").classList.replace("h4", "h3");
		instructions.innerHTML = "Utilisez les touches J et K pour bouger";
		instructions.style.color = constants.FOUR_PLAYER_3_COLOR;
	}
	else if (position === "player_four") {
		template_text.innerHTML = "Vous êtes le joueur Bas";
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
		const response = await fetch('http://localhost:7890/api/fourplayeronline/', init);

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