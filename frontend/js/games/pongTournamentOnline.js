import {Player} from './PlayerOnline.js';
import {Ball} from './BallOnline.js';
import * as constants from './Constants.js';
import {g_socket, g_nickname} from './tournamentRoom.js';

const wsurl = 'wss://' + window.location.host + '/wss/game/'; // link to websocket
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

function initDisplay() {
	board = document.getElementById("board_two");
	context = board.getContext("2d");
	board.width = constants.WIN_WIDTH;
	board.height = constants.WIN_HEIGHT;
}

function initArena() {
	player_one = new Player("player_left", constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_LEFT_COLOR, 2);
	player_two = new Player("player_right", constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_RIGHT_COLOR, 2);
	ball = new Ball(2);
}

function handle_scores(player) {
	context.font = "50px sans-serif";
	context.fillStyle = "white";
	context.fillText(player_one.score, constants.WIN_WIDTH / 2 - 50, 50);
	context.fillText(player_two.score, constants.WIN_WIDTH / 2 + 25, 50);
}

function display_winner(winning_player) {
	ball.stop();

	winning_text = winning_player + ' has won the game!';
}

/* -------------------------------- Controls -------------------------------- */

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
	if (arg.players[0] === g_nickname)
		position = 'player_one';
	if (arg.players[1] === g_nickname)
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

			if (arg.players[0] === g_nickname)
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
