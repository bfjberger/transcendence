
import {Player} from './PlayerOnline.js';
import {Ball} from './BallOnline.js';
import * as constants from './Constants.js';


const wsurl = 'wss://' + window.location.host + '/wss/gameIA/';
let g_websocket

var g_ball;
var g_id = null;
var g_position = null; // se charge de determiner quel côté il faut faire bouger (droite ou gauche)
let g_first_launch = true;
var g_game_running = false;
var g_winner = null;
var g_player_left, g_player_right;
var g_template_text, g_startButton;
var g_left_container, g_right_container;
const g_keys = {};

// Boards
var g_board = null;
var g_context = null;
var g_board_winning_text;


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
			g_template_text.textContent = g_board_winning_text;
			g_template_text.style.color = g_winner.color;
			g_startButton.classList.remove("d-none");
		}
	}

	// Draw the score and the line
	drawScoreAndLine();
};

function animate() {
	render();
	g_id = requestAnimationFrame(animate);
};

function display_winner(winning_player) {
	g_ball.stop();

	if (winning_player === 'player_left') {
		g_winner = g_player_left;
		g_board_winning_text = g_player_left.name + " a gagné!";
	}
	else {
		g_winner = g_player_right;
		g_board_winning_text = g_player_right.name + " a gagné!";
	}
};

function handle_scores() {
	g_context.font = "50px sans-serif";
	g_context.fillStyle = "white";
	g_context.fillText(g_player_left.score, constants.WIN_WIDTH / 2 - 50, 50);
	g_context.fillText(g_player_right.score, constants.WIN_WIDTH / 2 + 25, 50);
};

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

function sendMessageToServer(message) {
	g_websocket.send(JSON.stringify(message));
};

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

function gameStartStyleUpdate(data) {

	g_left_container.textContent = g_player_left.name;
	g_left_container.style.color = constants.PLAYER_LEFT_COLOR;
	g_right_container.textContent = g_player_right.name;
	g_right_container.style.color = constants.PLAYER_RIGHT_COLOR;
};

function setPositionStyleUpdate(data) {

	const instructions = document.getElementById("instructions");

	g_player_left.set_name(data.name);
	g_left_container.classList.add("text-decoration-underline");
	g_left_container.style.color = constants.PLAYER_LEFT_COLOR;
	instructions.textContent = "Ton camp est à gauche";
	instructions.style.color = constants.PLAYER_LEFT_COLOR;

	g_player_right.set_name("bot");
};


function initArena() {
	g_player_left = new Player("player_left", constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_LEFT_COLOR, 2);
	g_player_right = new Player("player_right", constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_RIGHT_COLOR, 2);
	g_ball = new Ball(2);
};

function initDisplay() {
	g_board = document.getElementById("board_two");
	g_context = g_board.getContext("2d");
	g_board.width = constants.WIN_WIDTH;
	g_board.height = constants.WIN_HEIGHT;
};

export function start() {
	g_websocket = new WebSocket(wsurl);

	g_left_container.classList.remove("text-decoration-underline");
	g_right_container.classList.remove("text-decoration-underline");

	// Pour l'affichage
	if (g_first_launch) {
		initDisplay();
		g_first_launch = false;
	}

	// Pour l'affichage
	initArena();

	// evenement pour s'assurer que la socket s'est ouverte
	g_websocket.onopen = () => {
		console.log('Websocket connected');
	}

	g_websocket.onmessage = (e) => {

		const data = JSON.parse(e.data);

		if (data.type === 'set_position') {
			g_position = data.position;
			setPositionStyleUpdate(data);
		}

		if (data.type === 'game_start') {

			g_template_text.textContent = "IA prête à jouer . . .";

			gameStartStyleUpdate(data);

			g_game_running = true;
			g_ball.get_update(constants.WIN_WIDTH / 2, constants.WIN_HEIGHT / 2, 1, 0, 0xffffff);
			initControls(); // permet d'envoyer les messages au serveur
		}

		if (data.type === 'game_state') {
			updateGameState(data);
		}

		if (data.type === 'game_end') {
			g_game_running = false;
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

function listenerPong_IA() {
	g_startButton = document.getElementById("startGame_IA");
	g_template_text = document.getElementById("template_text");
	g_left_container = document.getElementById("pong_IA--left");
	g_right_container = document.getElementById("pong_IA--right");

	g_startButton.addEventListener("click", e => {
		e.preventDefault();

		// hide the start button and reset some placeholder text
		g_startButton.classList.add("d-none");
		g_template_text.textContent = "En attente d'un adversaire";
		g_template_text.style.color = "";

		start();
	});
};


async function loadPong_IA() {
	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/pong_IA/', init);

		if (response.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}

		const resp = await response.text()
		console.log("loadPong_IA : ", resp)


		return 1;
	} catch (e) {
		console.error("loadPong_IA: " + e);
		return 0;
	}

	return 1

};

export default {
	listenerPong_IA,
	loadPong_IA
};
