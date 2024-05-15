import {Player} from './PlayerOnline.js'
import {Ball} from './BallOnline.js'
import * as constants from './Constants.js'

/**
 * What is a websocket?
 * A WebSocket is a communication protocol that makes it possible to establish a two-way communication channel between a server and a client.
 * In our case, the server is the Django server and the client is the browser.
 * The server can send messages to the client and the client can send messages to the server.
 * The pong game will be played in the browser, so the client will send messages to the server to update the game state.
 * And the server will send messages to the client to update the game state.
 *
 * The path to the websockets is /ws/gameFour/ and is in pong_online/routing.py (+ nginx configuration)
*/

const wsurl = 'wss://' + window.location.host + '/wss/gameFour/'; // link to websocket

/**
 * Outline of the methods of the class PongGame4PlayersOnline:
 * - init: initialize some of the variables once the user clicked on the start button
 * - sendMessageToServer: sends a message to the server using the websocket
 * - closeHandler: might be deleted
 * - handleKeyDown: handles the keydown event
 * - handleKeyUp: handles the keyup event
 * - initKeysListener: add the event listeners for the keys
 * - updateSetPosition: updates some content of the page when receiving the 'set_position' message
 * - updateGameStart: updates some content of the page when receiving the 'game_start' message
 * - updateGameState: updates some content of the page when receiving the 'game_state' message
 * - updateScores: update the scores when a score is not up to date
 * - updateWinner: update some variable concerning the winner
 * - render: render the game
 * - drawBall: draws the ball
 * - drawScoreAndLine: draws the score and line
 * - messageHandler: will handle the parsing of messages received from the websocket
 */

var g_game;
var g_left_name, g_right_name, g_top_name, g_bottom_name;
var g_left_score, g_right_score, g_top_score, g_bottom_score;
var g_template_text, g_instructions, g_startButton;

class PongGame4PlayersOnline {
	constructor() {
		this.position = null;

		this.game_running = false;
		this.winner = null;

		this.keys = {};

		this.board = document.getElementById("board_four");
		this.context = this.board.getContext("2d");
		this.board.width = constants.WIN_WIDTH;
		this.board.height = constants.FOUR_WIN_HEIGHT;

		this.websocket = null;

		this.player_left = null;
		this.player_right = null;
		this.player_top = null;
		this.player_bottom = null;

		this.ball = null;
	}

	init() {
		g_template_text.textContent = "En attente d'adversaires";

		this.websocket = new WebSocket(wsurl);

		this.player_left = new Player("player_left", constants.PADDLE_WIDTH,
									constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_LEFT_COLOR);
		this.player_right = new Player("player_right", constants.PADDLE_WIDTH,
									constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_RIGHT_COLOR);
		this.player_top = new Player("player_top", constants.PADDLE_WIDTH,
									constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_TOP_COLOR);
		this.player_bottom = new Player("player_bottom", constants.PADDLE_WIDTH,
									constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_BOTTOM_COLOR);

		this.ball = new Ball(4);

		this.websocket.addEventListener("message", this.messageHandler.bind(this));

		this.websocket.addEventListener("close", this.closeHandler.bind(this));
	}

	sendMessageToServer(message) {
		this.websocket.send(JSON.stringify(message));
	}

	closeHandler(e) {
		console.log("websocket closed");
	}

	handleKeyDown(e) {
		if (this.game_running) {
			if (this.position == "player_left" || this.position == "player_right") {
				if (!this.keys[e.code] && (e.code == "KeyW" || e.code == "KeyS")) {
					var up = false;
					if (e.code == "KeyW")
						up = true;
					this.keys[e.code] = true;
					this.sendMessageToServer({type: 'set_player_movement', player: this.position, is_moving: true,
												direction_v: up, direction_h: false});
				}
			}
			else {
				if (!this.keys[e.code] && (e.code == "KeyJ" || e.code == "KeyK")) {
					var left = false;
					if (e.code == "KeyJ")
						left = true;
					this.keys[e.code] = true;
					this.sendMessageToServer({type: 'set_player_movement', player: this.position, is_moving: true,
												direction_h: left, direction_v: false});
				}
			}
		}
	}

	handleKeyUp(e) {
		if (this.game_running) {
			if (this.position == "player_left" || this.position == "player_right") {
				if (e.code == 'KeyW' || e.code == 'KeyS') {
					this.keys[e.code] = false;
					this.sendMessageToServer({type: 'set_player_movement', player: this.position, is_moving: false,
												direction_v: 0, direction_h: false});
				}
			}
			else {
				if (e.code == 'KeyJ' || e.code == 'KeyK') {
					this.keys[e.code] = false;
					this.sendMessageToServer({type: 'set_player_movement', player: this.position, is_moving: false,
												direction_h: 0, direction_v: false});
				}
			}
		}
	}

	initKeysListener() {
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
		document.addEventListener("keyup", this.handleKeyUp.bind(this));
	}

	updateSetPosition(data) {
		if (this.position == "player_left") {
			this.player_left.set_name(data.name);
			g_left_name.classList.add("text-decoration-underline");
			g_instructions.textContent = "Ton camp est à gauche. Utilise les touches W et S pour bouger";
			g_instructions.style.color = constants.FOUR_PLAYER_LEFT_COLOR;
		}
		else if (this.position == "player_right") {
			this.player_right.set_name(data.player_right);
			g_right_name.classList.add("text-decoration-underline");
			g_instructions.textContent = "Ton camp est à droite. Utilise les touches W et S pour bouger";
			g_instructions.style.color = constants.FOUR_PLAYER_RIGHT_COLOR;
		}
		else if (this.position == "player_top") {
			this.player_top.set_name(data.player_top);
			g_top_name.classList.add("text-decoration-underline");
			g_instructions.textContent = "Ton camp est en haut. Utilise les touches J et K pour bouger";
			g_instructions.style.color = constants.FOUR_PLAYER_TOP_COLOR;
		}
		else if (this.position == "player_bottom") {
			this.player_bottom.set_name(data.player_bottom);
			g_bottom_name.classList.add("text-decoration-underline");
			g_instructions.textContent = "Ton camp est en bas. Utilise les touches J et K pour bouger";
			g_instructions.style.color = constants.FOUR_PLAYER_BOTTOM_COLOR;
		}
	}

	updateGameStart(data) {
		this.player_left.set_name(data.player_left);
		this.player_right.set_name(data.player_right);
		this.player_top.set_name(data.player_top);
		this.player_bottom.set_name(data.player_bottom);

		g_left_name.textContent = this.player_left.name;
		g_right_name.textContent = this.player_right.name;
		g_top_name.textContent = this.player_top.name;
		g_bottom_name.textContent = this.player_bottom.name;

		this.render();
	}

	updateGameState(data) {
		this.player_left.y = data.player_left_y;
		this.player_right.y = data.player_right_y;
		this.player_top.x = data.player_top_x;
		this.player_bottom.x = data.player_bottom_x;

		if (this.ball.color != data.ball_color)
			this.ball.setcolor(data.ball_color);

		if (data.player_left_score != this.player_left.score)
			this.player_left.score += 1;
		else if (data.player_right_score != this.player_right.score)
			this.player_right.score += 1;
		else if (data.player_top_score != this.player_top.score)
			this.player_top.score += 1;
		else if (data.player_bottom_score != this.player_bottom.score)
			this.player_bottom.score += 1;
		// updateScores();

		this.ball.get_update(data.ball_x, data.ball_y, data.ball_x_vel, data.ball_y_vel, data.ball_color);
	}

	updateScores() {
		g_top_score.textContent = this.player_top.score;
		g_left_score.textContent = this.player_left.score;
		g_right_score.textContent = this.player_right.score;
		g_bottom_score.textContent = this.player_bottom.score;
	}

	updateWinner(winning_player_pos) {
		this.ball.stop();

		if (winning_player_pos == "player_left")
			this.winner = this.player_left;
		else if (winning_player_pos == "player_right")
			this.winner = this.player_right;
		else if (winning_player_pos == "player_top")
			this.winner = this.player_top;
		else if (winning_player_pos == "player_bottom")
			this.winner = this.player_bottom;
	}

	render() {

		this.context.clearRect(0, 0, constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT);

		// Draw the players
		this.context.fillStyle = this.player_left.color;
		this.context.fillRect(this.player_left.x, this.player_left.y, this.player_left.width, this.player_left.height);
		this.context.fillStyle = this.player_right.color;
		this.context.fillRect(this.player_right.x, this.player_right.y, this.player_right.width, this.player_right.height);
		this.context.fillStyle = this.player_top.color;
		this.context.fillRect(this.player_top.x, this.player_top.y, this.player_top.height, this.player_top.width);
		this.context.fillStyle = this.player_bottom.color;
		this.context.fillRect(this.player_bottom.x, this.player_bottom.y, this.player_bottom.height, this.player_bottom.width);

		this.drawScoreAndLine();
		if (this.game_running)
			this.drawBall(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);

		if (this.winner != null) {
			g_instructions.textContent = "";
			g_instructions.style.color = "";
			g_template_text.textContent = this.winner.name + " a gagné !";
			g_template_text.style.color = this.winner.color;
			g_startButton.classList.remove("d-none");
		}
		else if (this.game_running)
			requestAnimationFrame(this.render.bind(this));
	}

	drawBall(x, y, radius, color) {
		if (!this.ball.stop_flag) {
			this.context.fillStyle = color;
			this.context.strokeStyle = "black";
			this.context.lineWidth = 2;
			this.context.beginPath();
			this.context.arc(x, y, radius, 0, Math.PI * 2, true);
			this.context.closePath();
			this.context.fill();
			this.context.stroke();
		}
	}

	drawScoreAndLine() {
		// Draw the vertical line
		this.context.beginPath();
		this.context.setLineDash([5, 15]);
		this.context.moveTo(constants.WIN_WIDTH / 2, 0);
		this.context.lineTo(constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT);
		this.context.strokeStyle = "lightgray";
		this.context.stroke();
		this.context.setLineDash([]);

		// Draw the horizontal line
		this.context.beginPath();
		this.context.setLineDash([5, 15]);
		this.context.moveTo(0, constants.FOUR_WIN_HEIGHT / 2);
		this.context.lineTo(constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT / 2);
		this.context.strokeStyle = "lightgray";
		this.context.stroke();
		this.context.setLineDash([]);

		// Update the scores on the page
		g_top_score.textContent = this.player_top.score;
		g_left_score.textContent = this.player_left.score;
		g_right_score.textContent = this.player_right.score;
		g_bottom_score.textContent = this.player_bottom.score;
	}

	messageHandler(e) {
		const data = JSON.parse(e.data);

		if (data.type == "set_position") {
			this.position = data.position;
			this.updateSetPosition(data);
		}

		if (data.type == "ready") {
			g_template_text.textContent = "Adversaire trouvé ...";
			this.updateGameStart(data);

			let count = 0;
			let interval = setInterval(() => {
				count++;

				document.getElementById("canvas--text").textContent = "La partie commence dans " + (5 - count);

				if (count === 5) {
					clearInterval(interval);
					document.getElementById("canvas--text").textContent = "";

					if (this.position === "player_left" && this.websocket.readyState == 1)
						this.websocket.send(JSON.stringify({type: 'start_game'}));
				}
			}, 1000);
		}

		if (data.type == "game_start") {
			g_template_text.textContent = "C'est parti !";

			this.game_running = true;

			requestAnimationFrame(this.render.bind(this));

			this.ball.get_update(constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT / 2, 1, 0, "white");
			this.initKeysListener();
		}

		if (data.type == "game_state") {
			this.updateGameState(data);
		}

		if (data.type == "player_disconnect") {
			this.game_running = false;
			this.ball.stop();
			g_template_text.style.color = "black";
			g_template_text.textContent = data.player_name + " a quitté la partie. La partie est terminée.";
			g_template_text.textContent = data.player_name + " a quitté la partie. La partie est terminée.";
			g_startButton.classList.remove("d-none");
			this.websocket.close();
		}

		if (data.type == "game_end") {
			this.game_running = false;
			this.updateWinner(data.winner);
			this.websocket.close();
		}
	}
};

function start4PlayerGameOnline() {

	if (g_game)
		g_game = null;

	g_game = new PongGame4PlayersOnline();
	g_game.init();
};

function setGlobals() {
	g_startButton = document.getElementById("startGame4Online");
	g_template_text = document.getElementById("template_text");
	g_instructions = document.getElementById("instructions");
	g_left_name = document.getElementById("four__online--left--name");
	g_right_name = document.getElementById("four__online--right--name");
	g_top_name = document.getElementById("four__online--top--name");
	g_bottom_name = document.getElementById("four__online--bottom--name");
	g_left_score = document.getElementById("four__online--left--score");
	g_right_score = document.getElementById("four__online--right--score");
	g_top_score = document.getElementById("four__online--top--score");
	g_bottom_score = document.getElementById("four__online--bottom--score");
}

function resetContent() {
	// Reset some text placeholder to no content and no style
	g_template_text.textContent = "";
	g_template_text.style.color = "";
	g_instructions.textContent = "";
	g_instructions.style.color = "";

	g_left_name.textContent = "";
	g_left_name.classList.remove("text-decoration-underline");
	g_right_name.textContent = "";
	g_right_name.classList.remove("text-decoration-underline");
	g_top_name.textContent = "";
	g_top_name.classList.remove("text-decoration-underline");
	g_bottom_name.textContent = "";
	g_bottom_name.classList.remove("text-decoration-underline");

	g_left_score.textContent = "";
	g_right_score.textContent = "";
	g_top_score.textContent = "";
	g_bottom_score.textContent = "";

	// Hide the start button
	g_startButton.classList.add("d-none");

	if (g_game) {
		g_game.context.clearRect(0, 0, constants.WIN_WIDTH, constants.WIN_HEIGHT);
		g_game.websocket.close();
		g_game = null;
	}
};

/* ------------------------ Leaving or reloading game ----------------------- */

function handlePageReload() {
	// Wait for the HTML to be parsed before getting the globals and resetting them
	window.addEventListener("DOMContentLoaded", (e) => {
		setGlobals();
		resetContent();
	});
};

window.addEventListener('beforeunload', handlePageReload);

/* ------------------------- Listeners for the page ------------------------- */

function listenerFourPlayersOnline() {

	setGlobals();

	// Reset the content and color of placeholder text
	g_template_text.textContent = "";
	g_template_text.style.color = "";
	g_instructions.textContent = "";
	g_instructions.style.color = "";

	g_startButton.addEventListener("click", e => {
		e.preventDefault();

		// hide the start button and reset some placeholder text
		g_startButton.classList.add("d-none");
		g_template_text.textContent = "En attente d'autres joueurs. . .";
		g_template_text.style.color = "";
		g_left_name.textContent = "";
		g_right_name.textContent = "";
		g_top_name.textContent = "";
		g_bottom_name.textContent = "";

		resetContent();

		start4PlayerGameOnline();
	});

	// Listen for a button from the menu bar being clicked
	const navbarItems = document.querySelectorAll('.nav__item');
	navbarItems.forEach(item => {
		item.addEventListener('click', () => {
			if (g_game) {
				g_game.websocket.close();
				g_game = null;
			}
		});
	});
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
		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/fourplayeronline/', init);

		if (response.status != 200) {
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