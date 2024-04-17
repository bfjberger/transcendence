// LA LOGIQUE DU JEU ICI
import {Player} from './PlayerOnline.js';
import {Ball} from './BallOnline.js';
import * as constants from './Constants.js';

/**
 * Currently the pong game is working with 2 different browsers.
 * The game logic is in pong_online/gamelogic.py
 * The requests are handled in pong_online/consumers.py and also the room logic are handled there
 * The path to the websockets is /ws/game/ and is in pong_online/routing.py (+ nginx configuration)
 *
 * TODO:[] Add the score back to the game
 * TODO:[] Add the game over screen
 * TODO:[] Add a matchmaking placeholder
 *
 * !Bug: The ball is red
 */

const wsurl = 'ws://' + window.location.host + '/ws/game/'; // link to websocket
let ws; // websocket

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
 * - animate: animates the game
 * - render: renders the game
 *
 * - listenerTwoPlayersOnline: listens for the start button click
 * - loadTwoPlayersOnline: loads the game
 */

/* -------------------------------- Variables ------------------------------- */
var game_running, player_one, player_two, ball, winning_text;
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
	player_one = new Player(1, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_1_COLOR);
	player_two = new Player(2, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_2_COLOR);
	ball = new Ball();
	console.log("Ball color: ", ball.color);
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
		context.fillStyle = "white";
		context.font = "50px sans-serif";
		context.fillText(winning_text, constants.WIN_WIDTH / 2 - 50, constants.WIN_HEIGHT / 2);
	}
	else {
		winning_text = "Player 2 wins!";
		context.fillStyle = "white";
		context.font = "50px sans-serif";
		context.fillText(winning_text, constants.WIN_WIDTH / 2 - 50, constants.WIN_HEIGHT / 2);

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

/* -------------------------- Login Event Listeners ------------------------- */

function listenerTwoPlayersOnline() {

	document.getElementById("startGame2Online").addEventListener("click", e => {
		e.preventDefault();

		// hide the start button
		document.getElementById("startGame2Online").classList.add("d-none");
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

	
	// try {
	// 	const response = await fetch('http://localhost:7890/api/twoplayer/', init); // !! le lien devra changer

	// 	if (response.status === 403) {
	// 		const text = await response.text();
	// 		throw new Error(text);
	// 	}

	// 	return 1;
	// } catch (e) {
	// 	console.error("loadTwoPlayers: " + e);
	// 	return 0;
	// }
	
	return 1; // Added to get the game for now instead of the try catch block
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
