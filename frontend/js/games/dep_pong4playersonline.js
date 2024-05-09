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
 * - listenerFourPlayersOnline: listens for the start button click
 * - loadFourPlayersOnline: loads the game
*/

/* ---------------------------- GLOBALS VARIABLES --------------------------- */
var g_ball;
var g_id = null;
var g_position = null;
let g_first_launch = true;
var g_game_running = false;
var g_winner = null;
var g_player_left, g_player_right, g_player_top, g_player_bottom;
var g_template_text, g_startButton, g_instructions;
var g_left_name, g_right_name, g_top_name, g_bottom_name;
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

	g_board = document.getElementById("board_four");
	g_context = g_board.getContext("2d");
	g_board.width = constants.WIN_WIDTH;
	g_board.height = constants.FOUR_WIN_HEIGHT;
};

function initArena() {
	g_player_left = new Player("player_left", constants.PADDLE_WIDTH,
								constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_LEFT_COLOR);
	g_player_right = new Player("player_right", constants.PADDLE_WIDTH,
								constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_RIGHT_COLOR);
	g_player_top = new Player("player_top", constants.PADDLE_WIDTH,
								constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_TOP_COLOR);
	g_player_bottom = new Player("player_bottom", constants.PADDLE_WIDTH,
								constants.PADDLE_HEIGHT, constants.FOUR_PLAYER_BOTTOM_COLOR);
	g_ball = new Ball(4);
};

function handle_scores() {
	g_context.font = "20px sans-serif";
	g_context.fillStyle = "black";
	g_context.fillText(g_player_left.score, 10, constants.FOUR_WIN_HEIGHT / 2);
	g_context.fillText(g_player_right.score, constants.WIN_WIDTH - 20, constants.FOUR_WIN_HEIGHT / 2);
	g_context.fillText(g_player_top.score, constants.WIN_WIDTH / 2, 20);
	g_context.fillText(g_player_bottom.score, constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT - 20);

	document.getElementById("four__online--top--score").textContent = g_player_top.score;
	document.getElementById("four__online--left--score").textContent = g_player_left.score;
	document.getElementById("four__online--right--score").textContent = g_player_right.score;
	document.getElementById("four__online--bottom--score").textContent = g_player_bottom.score;
};

function display_winner(winning_player) {
	g_ball.stop();

	if (winning_player === 'player_left') {
		g_winner = g_player_left;
	}
	else if (winning_player === 'player_right') {
		g_winner = g_player_right;
	}
	else if (winning_player === 'player_top') {
		g_winner = g_player_top;
	}
	else if (winning_player === 'player_bottom') {
		g_winner = g_player_bottom;
	}
	g_board_winning_text = g_winner.name + " a gagné!";
};

/* -------------------------------- Controls -------------------------------- */

function handleKeyDown(e) {
	if (g_game_running) {
		if (g_position === "player_left" || g_position === "player_right") {
			if (!g_keys[e.code] && (e.code == 'KeyW' || e.code == 'KeyS')) {
				var up = false;
				if (e.code == 'KeyW') {
					up = true;
				}
				g_keys[e.code] = true;
				sendMessageToServer({type: 'set_player_movement', player: g_position, is_moving: true,
										direction_v: up, direction_h: false});
			}
		}
		else {
			if (!g_keys[e.code] && (e.code == 'KeyJ' || e.code == 'KeyK')) {
				var left = false;
				if (e.code == 'KeyJ') {
					left = true;
				}
				g_keys[e.code] = true;
				sendMessageToServer({type: 'set_player_movement', player: g_position, is_moving: true,
										direction_h: left, direction_v: false});
			}
		}
	}
};

function handleKeyUp(e) {
	if (g_game_running) {
		if (g_position === "player_left" || g_position === "player_right") {
			if (e.code == 'KeyW' || e.code == 'KeyS') {
				g_keys[e.code] = false;
				sendMessageToServer({type: 'set_player_movement', player: g_position, is_moving: false,
										direction_v: 0, direction_h: false});
			}
		}
		else {
			if (e.code == 'KeyJ' || e.code == 'KeyK') {
				g_keys[e.code] = false;
				sendMessageToServer({type: 'set_player_movement', player: g_position, is_moving: false,
										direction_h: 0, direction_v: false});
			}
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
	g_player_top.x = data.player_top_x;
	g_player_bottom.x = data.player_bottom_x;

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

	if (data.player_top_score != g_player_top.score) {
		g_player_top.score += 1;
		handle_scores();
	}

	if (data.player_bottom_score != g_player_bottom.score) {
		g_player_bottom.score += 1;
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
	// Draw the horizontal line
	g_context.beginPath();
	g_context.setLineDash([5, 15]);
	g_context.moveTo(constants.WIN_WIDTH / 2, 0);
	g_context.lineTo(constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT);
	g_context.strokeStyle = "lightgray";
	g_context.stroke();
	g_context.setLineDash([]);

	// Draw the vertical line
	g_context.beginPath();
	g_context.setLineDash([5, 15]);
	g_context.moveTo(0, constants.FOUR_WIN_HEIGHT / 2);
	g_context.lineTo(constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT / 2);
	g_context.strokeStyle = "lightgray";
	g_context.stroke();
	g_context.setLineDash([]);

	// Change the scores on the page
	document.getElementById("four__online--top--score").textContent = g_player_top.score;
	document.getElementById("four__online--left--score").textContent = g_player_left.score;
	document.getElementById("four__online--right--score").textContent = g_player_right.score;
	document.getElementById("four__online--bottom--score").textContent = g_player_bottom.score;
};

function animate() {
	render();
	g_id = requestAnimationFrame(animate);
};

function render() {
	g_context.clearRect(0, 0, constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT);

	// Draw the players
	g_context.fillStyle = g_player_left.color;
	g_context.fillRect(g_player_left.x, g_player_left.y, g_player_left.width, g_player_left.height);
	g_context.fillStyle = g_player_right.color;
	g_context.fillRect(g_player_right.x, g_player_right.y, g_player_right.width, g_player_right.height);
	g_context.fillStyle = g_player_top.color;
	g_context.fillRect(g_player_top.x, g_player_top.y, g_player_top.height, g_player_top.width);
	g_context.fillStyle = g_player_bottom.color;
	g_context.fillRect(g_player_bottom.x, g_player_bottom.y, g_player_bottom.height, g_player_bottom.width);

	// Draw the ball
	if (!g_ball.stop_flag && g_game_running) {
		drawBall(g_ball.x, g_ball.y, g_ball.radius, g_ball.color);
	}
	else {
		if (g_winner !== null) {
			g_instructions.textContent = "";
			g_instructions.style.color = "";
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
		g_left_name.classList.add("text-decoration-underline");
		g_instructions.textContent = "Ton camp est à gauche. Utilise les touches W et S pour bouger";
		g_instructions.style.color = constants.FOUR_PLAYER_LEFT_COLOR;
	}
	else if (g_position === "player_right") {
		g_player_right.set_name(data.name);
		g_right_name.classList.add("text-decoration-underline");
		g_instructions.textContent = "Ton camp est à droite. Utilise les touches W et S pour bouger";
		g_instructions.style.color = constants.FOUR_PLAYER_RIGHT_COLOR;
	}
	else if (g_position === "player_top") {
		g_player_top.set_name(data.name);
		g_top_name.classList.add("text-decoration-underline");
		g_instructions.textContent = "Ton camp est en haut. Utilise les touches J et K pour bouger";
		g_instructions.style.color = constants.FOUR_PLAYER_TOP_COLOR;
	}
	else if (g_position === "player_bottom") {
		g_player_bottom.set_name(data.name);
		g_bottom_name.classList.add("text-decoration-underline");
		g_instructions.textContent = "Ton camp est en bas. Utilise les touches J et K pour bouger";
		g_instructions.style.color = constants.FOUR_PLAYER_BOTTOM_COLOR;
	}
};

function gameStartStyleUpdate(data) {

	g_player_left.set_name(data.player_left);
	g_player_right.set_name(data.player_right);
	g_player_top.set_name(data.player_top);
	g_player_bottom.set_name(data.player_bottom);

	g_left_name.textContent = g_player_left.name;
	g_right_name.textContent = g_player_right.name;
	g_top_name.textContent = g_player_top.name;
	g_bottom_name.textContent = g_player_bottom.name;
};

function resetVarStyle() {
	g_player_bottom = null;
	g_player_left = null;
	g_player_right = null;
	g_player_top = null;
	// g_template_text.style.color = "";
	g_winner = null;
	g_board = null;
	g_context = null;
}

/**
 * Starts the game and initializes the WebSocket connection.
 */
export function startGame() {
	if (g_websocket != undefined)
		resetVarStyle();

	g_websocket = new WebSocket(wsurl);

	// Remove a possible underline from the player's name
	g_top_name.classList.remove("text-decoration-underline");
	g_bottom_name.classList.remove("text-decoration-underline");
	g_left_name.classList.remove("text-decoration-underline");
	g_right_name.classList.remove("text-decoration-underline");

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
			g_ball.get_update(constants.WIN_WIDTH / 2, constants.FOUR_WIN_HEIGHT / 2, 1, 0, "white");
			initControls();
		}

		if (data.type === 'game_state') {
			updateGameState(data);
		}

		if (data.type === 'player_disconnect') {
			g_game_running = false;
			g_template_text.style.color = "black";
			g_template_text.textContent = data.player_name + " a quitté la partie. La partie est terminée.";
			g_startButton.classList.remove("d-none");
			g_websocket.close();
			g_board = null;
			g_context = null;
			setTimeout(() => {
				cancelAnimationFrame(g_id);
			}, 500);
		}

		if (data.type === 'game_end') {
			g_game_running = false;
			console.log('Game over');
			display_winner(data.winner);
			setTimeout(() => {
				cancelAnimationFrame(g_id);
			}, 500);
			g_websocket.close();
			g_board = null;
			g_context = null;
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
		g_context = null;
	}

	animate();
};