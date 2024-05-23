import {Player} from './PlayerOnline.js';
import {Ball} from './BallOnline.js';
import * as constants from './Constants.js';
import {g_socket, g_nickname, g_username } from './tournamentRoom.js';

const wsurl = 'wss://' + window.location.host + '/wss/game/'; // link to websocket
let ws; // websocket

/* -------------------------------- Variables ------------------------------- */
var game_running, player_one, player_two, ball, winning_text, startButton;
var infoElement, button_container;
let playerField;

var position = null;
var id = null;
var MAX_TIMER = 60;
var g_timer = MAX_TIMER;
var g_nicknames = []; // this is set in set_position, it is the player left and right
let first_launch = true;
var keys = {};

game_running = false;

// Boards
var board = null;
var context = null;

var g_left_placeholder, g_right_placeholder;
var g_template, g_template_next;
var g_canvas_text;

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

	winning_text = winning_player + ' a gagné!';
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
	g_timer = MAX_TIMER - Math.floor(data.game_time);
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

	// Draw the timer
	context.fillStyle = "white";
	context.font = "50px sans-serif";
	context.fillText(g_timer, constants.WIN_WIDTH / 2 - 25, 100);

	// Draw the players
	context.fillStyle = player_one.color;
	context.fillRect(player_one.x, player_one.y, player_one.width, player_one.height);
	context.fillStyle = player_two.color;
	context.fillRect(player_two.x, player_two.y, player_two.width, player_two.height);

	// Draw the ball
	if (!ball.stop_flag) {
		drawBall(ball.x, ball.y, ball.radius, "white");
	}
	else {
		if (winning_text) {
			// context.fillStyle = "white";
			// context.font = "50px sans-serif";
			// let text_width = context.measureText(winning_text).width;
			// context.fillText(winning_text, (constants.WIN_WIDTH - text_width) / 2, constants.WIN_HEIGHT / 2);
			g_canvas_text.textContent = winning_text;
		}
	}

	// Draw the score and the line
	drawScoreAndLine();

}

/* -------------------------------- Update UI ------------------------------- */

function updateNextMatch(arg) {

	if (arg.state == "QUARTER_FINALS1") {
		let next_top, next_bottom, next_state;
		next_state = "QUARTS SEED 2";
		next_top = document.getElementById("quarter__seed2--1--name").innerText;
		next_bottom = document.getElementById("quarter__seed2--2--name").innerText;
		g_template_next.textContent = "Le prochain match sera " + next_state + " avec " + next_top + " vs " + next_bottom;
	}
	if (arg.state == "QUARTER_FINALS2") {
		let next_top, next_bottom, next_state;
		next_state = "QUARTS SEED 3";
		next_top = document.getElementById("quarter__seed3--1--name").innerText;
		next_bottom = document.getElementById("quarter__seed3--2--name").innerText;
		g_template_next.textContent = "Le prochain match sera " + next_state + " avec " + next_top + " vs " + next_bottom;
	}
	if (arg.state == "QUARTER_FINALS3") {
		let next_top, next_bottom, next_state;
		next_state = "QUARTS SEED 4";
		next_top = document.getElementById("quarter__seed4--1--name").innerText;
		next_bottom = document.getElementById("quarter__seed4--2--name").innerText;
		g_template_next.textContent = "Le prochain match sera " + next_state + " avec " + next_top + " vs " + next_bottom;
	}
	if (arg.state == "QUARTER_FINALS4") {
		let next_top, next_bottom, next_state;
		next_state = "DEMI SEED 1";
		next_top = document.getElementById("demi__seed1--1--name").innerText;
		next_bottom = document.getElementById("demi__seed1--2--name").innerText;
		g_template_next.textContent = "Le prochain match sera " + next_state + " avec " + next_top + " vs " + next_bottom;
	}
	if (arg.state == "DEMI_FINALS1") {
		let next_top, next_bottom, next_state;
		next_state = "DEMI SEED 2";
		next_top = document.getElementById("demi__seed2--1--name").innerText;
		next_bottom = document.getElementById("demi__seed2--2--name").innerText;
		g_template_next.textContent = "Le prochain match sera " + next_state + " avec " + next_top + " vs " + next_bottom;
	}
	if (arg.state == "DEMI_FINALS2") {
		let next_top, next_bottom, next_state;
		next_state = "FINALE";
		next_top = document.getElementById("final__1--name").innerText;
		next_bottom = "le vainqueur de ce match.";
		g_template_next.textContent = "Le prochain match sera " + next_state + " avec " + next_top + " vs " + next_bottom;
	}
	if (arg.state == "FINALS")
		g_template_next.textContent = "Ce match est le dernier du tournoi. Enjoy !";
};

/* ----------------------------- Main Tournament ---------------------------- */

export function startTournamentOnline() {
	// infoElement = document.getElementById("infoElement");
	// playerField = document.getElementById("playerField");

	g_left_placeholder = document.getElementById("tournament__left");
	g_right_placeholder = document.getElementById("tournament__right");
	g_template = document.getElementById("template__text");
	g_template_next = document.getElementById("template__text--next");
	g_canvas_text = document.getElementById("canvas--text");
	g_canvas_text.textContent = "";

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
	if (arg.players[0] === g_username)
		position = 'player_one';
	if (arg.players[1] === g_username)
		position = 'player_two';

	// console.log('Position set to', position);
	g_nicknames = arg.nicknames;

	g_left_placeholder.textContent = arg.nicknames[0];
	g_right_placeholder.textContent = arg.nicknames[1];

	if (arg.players[0] == g_username)
		g_left_placeholder.classList.add("text-decoration-underline");
	else if (arg.players[1] == g_username)
		g_right_placeholder.classList.add("text-decoration-underline");

	var state = arg.state.replace("_", " ");
	state = state.slice(0, -1) + " " + state.slice(-1);
	g_template.textContent = state + " : " + arg.nicknames[0] + " vs " + arg.nicknames[1];

	updateNextMatch(arg);

	let count = 0;
	let interval = setInterval(() => {
		count++;

		g_canvas_text.textContent = "La partie commence dans " + (5 - count);
		if (count === 5) {
			clearInterval(interval);

			g_canvas_text.textContent = "";

			if (arg.players[0] === g_username)
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

	g_left_placeholder.textContent = "";
	g_right_placeholder.textContent = "";
	g_left_placeholder.classList.remove("text-decoration-underline");
	g_right_placeholder.classList.remove("text-decoration-underline");

	id = null;
}

export { on_set_position, on_game_start, on_game_state, on_game_end }
