import Player, {
	default_paddle_height,
	default_paddle_width,
} from "./Player.js"; // Import the Player class from Player

import * as constants from './Constants.js'

import { updateStatus } from "../logic/utils.js";

var g_game;
var g_startButton;
var g_template_text;

var g_player_status;

class PongGame4Players {
	constructor(player_left_name, player_right_name, player_top_name, player_bottom_name) {
		// board
		[this.boardWidth, this.boardHeight] = [constants.WIN_WIDTH, constants.FOUR_WIN_HEIGHT];
		[this.board, this.context] = [null, null]; // defined in setBoard()
		this.start = false;

		// players
		[this.playerVelocityY, this.paddleSpeed] = [0, this.boardHeight / 100]; // overriden by movePlayer()
		[this.player_left, this.player_right, this.player_top, this.player_bottom] =
			[
				new Player(player_left_name, constants.FOUR_PLAYER_LEFT_COLOR, false),
				new Player(player_right_name, constants.FOUR_PLAYER_RIGHT_COLOR, false),
				new Player(player_top_name, constants.FOUR_PLAYER_TOP_COLOR, true),
				new Player(player_bottom_name, constants.FOUR_PLAYER_BOTTOM_COLOR, true)
			];
		this.winner = null;
		this.keysPressed = {};

		// ball
		[this.ballRadius, this.ballSpeed] = [constants.BALL_RADIUS, this.boardWidth / 250];
		[this.ballSpeedMultiplierX, this.ballSpeedMultiplierY] = [1.1, 1.05];
		this.ball = {};
		this.lastPlayerTouched = null;
	}

	init() {
		this.start = true;

		this.setBoard();

		requestAnimationFrame(this.update.bind(this));
		document.addEventListener("keydown", this.pressKey.bind(this));
		document.addEventListener("keydown", this.handleKeyPress.bind(this));
		document.addEventListener("keyup", this.handleKeyPress.bind(this));
	}

	setBoard() {
		// used for drawing on the board
		this.board = document.getElementById("board_four");
		this.context = this.board.getContext("2d");

		this.setPlayer();
		this.countdown();
	}

	countdown() {
		let count = 0;
		let interval = setInterval(() => {
			if (this.start === false)
				return;

			count++;

			if (document.getElementById("canvas--text"))
				document.getElementById("canvas--text").textContent = "La partie commence dans " + (5 - count);

			if (count === 5) {
				clearInterval(interval);

				if (document.getElementById("canvas--text"))
					document.getElementById("canvas--text").textContent = "";

				this.setBall();
			}
		}, 1000);
	}

	setPlayer() {
		// set players position
		this.player_left.setCoords(10, (this.boardHeight - this.player_left.height) / 2);
		this.player_right.setCoords(this.boardWidth - this.player_right.width - 10,
										(this.boardHeight - this.player_right.height) / 2);
		this.player_top.setCoords(this.boardWidth / 2 - this.player_top.width / 2, 10);
		this.player_bottom.setCoords(this.boardWidth / 2 - this.player_bottom.width / 2,
										this.boardHeight - this.player_bottom.height - 10);

		// set velocity
		this.player_left.speed = this.player_right.speed = this.player_top.speed = this.player_bottom.speed = this.paddleSpeed;
		this.player_left.velocityY = this.player_right.velocityY = this.player_top.velocityX = this.player_bottom.velocityX = 0;
	}

	setBall() {
		this.ball.color = "white";
		this.ball.radius = this.ballRadius;

		// Position of the ball
		// range of 250px on the sides to not have the ball spawn too close to a camp
		// means that the ball can spawn in a square of 150px
		// ball is either on the horizontal or vertical bar, if on one then his other position is random in the square of 150px
		const randomNum = Math.round(Math.random());
		if (randomNum === 0) {
			this.ball.x = 250 + Math.random() * (this.boardWidth - 500);
			this.ball.y = this.boardHeight / 2;
		}
		else {
			this.ball.x = this.boardWidth / 2;
			this.ball.y = 250 + Math.random() * (this.boardHeight - 500);
		}

		// Velocity of the ball
		let randomAngle = Math.random() * Math.PI * 2;
		this.ball.velocityX = Math.cos(randomAngle) * this.ballSpeed;
		this.ball.velocityY = Math.sin(randomAngle) * this.ballSpeed;
	}

	pressKey(e) {
		if (e.key === "Escape") {
			window.alert("Partie interrompue");
		}
	}

	handleKeyPress(e) {
		this.keysPressed[e.key] = e.type === "keydown";
	}

	movePlayer() {
		// Player 1 and 2 movement
		if (this.keysPressed["q"] || this.keysPressed["Q"]) {
			this.player_left.velocityY = -this.paddleSpeed;
		}
		else if (this.keysPressed["a"] || this.keysPressed["A"]) {
			this.player_left.velocityY = this.paddleSpeed;
		}
		else {
			this.player_left.velocityY = 0;
		}
		if (this.keysPressed["9"]) {
			this.player_right.velocityY = -this.paddleSpeed;
		}
		else if (this.keysPressed["6"]) {
			this.player_right.velocityY = this.paddleSpeed;
		}
		else {
			this.player_right.velocityY = 0;
		}
		// Player 3 and 4 movement
		if (this.keysPressed["n"] || this.keysPressed["N"]) {
			this.player_top.velocityX = -this.paddleSpeed;
		}
		else if (this.keysPressed["m"] || this.keysPressed["M"]) {
			this.player_top.velocityX = this.paddleSpeed;
		}
		else {
			this.player_top.velocityX = 0;
		}
		if (this.keysPressed["ArrowLeft"]) {
			this.player_bottom.velocityX = -this.paddleSpeed;
		}
		else if (this.keysPressed["ArrowRight"]) {
			this.player_bottom.velocityX = this.paddleSpeed;
		}
		else {
			this.player_bottom.velocityX = 0;
		}
		// Player 1 and 2 next movement
		if (!this.outOfBoundsY(this.player_left.coords.y + this.player_left.velocityY)) {
			this.player_left.coords.y += this.player_left.velocityY;
		}
		if (!this.outOfBoundsY(this.player_right.coords.y + this.player_right.velocityY)) {
			this.player_right.coords.y += this.player_right.velocityY;
		}
		// Player 3 and 4 next movement
		if (!this.outOfBoundsX(this.player_top.coords.x + this.player_top.velocityX)) {
			this.player_top.coords.x += this.player_top.velocityX;
		}
		if (!this.outOfBoundsX(this.player_bottom.coords.x + this.player_bottom.velocityX)) {
			this.player_bottom.coords.x += this.player_bottom.velocityX;
		}
	}

	outOfBoundsX(xPosition) {
		return (xPosition < 0 || xPosition > this.boardWidth - this.player_top.width);
	}

	outOfBoundsY(yPosition) {
		return (yPosition < 0 || yPosition > this.boardHeight - default_paddle_height);
	}

	moveBall() {
		this.checkCollisions();
		this.ball.x += this.ball.velocityX;
		this.ball.y += this.ball.velocityY;
		if (this.ball.x - (this.ball.radius / 2) <= 0 || this.ball.x + (this.ball.radius / 2) >= this.boardWidth ||
				this.ball.y - (this.ball.radius / 2) <= 0 || this.ball.y + (this.ball.radius / 2) >= this.boardHeight) {
			if (this.lastPlayerTouched === "player_left") {
				this.player_left.score++;
			}
			else if (this.lastPlayerTouched === "player_right") {
				this.player_right.score++;
			}
			else if (this.lastPlayerTouched === "player_top") {
				this.player_top.score++;
			}
			else if (this.lastPlayerTouched === "player_bottom") {
				this.player_bottom.score++;
			}
			// reset the game
			this.resetGame();
		}
	}

	checkCollisions() {

		var middle_y, difference_in_y, new_y_vel, reduction_factor;
		// Ball and paddle collision (player_left and player_right)
		if (this.ball.velocityX < 0) {
			if (this.ball.y <= this.player_left.coords.y + default_paddle_height &&
				this.ball.y >= this.player_left.coords.y && this.ball.x > this.player_left.coords.x &&
				this.ball.x - this.ball.radius <= this.player_left.coords.x + default_paddle_width) {
					if (Math.abs(this.ball.velocityX) >= 20)
						this.ball.velocityX *= -1;
					else
						this.ball.velocityX *= -1 * this.ballSpeedMultiplierX;
					// middle_y = this.player_left.coords.y + default_paddle_height / 2;
					// difference_in_y = middle_y - this.ball.y;
					// reduction_factor = default_paddle_height / 2;
					// new_y_vel = difference_in_y / reduction_factor * this.ballSpeed;
					// this.ball.velocityY = -1 * new_y_vel;
					this.ball.velocityY *= -1;
					this.lastPlayerTouched = "player_left";
					this.ball.color = this.player_left.color;
			}
		}
		else {
			if (this.ball.y <= this.player_right.coords.y + default_paddle_height &&
				this.ball.y >= this.player_right.coords.y && this.ball.x < this.player_right.coords.x &&
				this.ball.x + this.ball.radius >= this.player_right.coords.x) {
					if (Math.abs(this.ball.velocityX) >= 20)
						this.ball.velocityX *= -1;
					else
						this.ball.velocityX *= -1 * this.ballSpeedMultiplierX;
					// middle_y = this.player_right.coords.y + default_paddle_height / 2;
					// difference_in_y = middle_y - this.ball.y;
					// reduction_factor = default_paddle_height / 2;
					// new_y_vel = difference_in_y / reduction_factor * this.ballSpeed;
					// this.ball.velocityY = -1 * new_y_vel;
 					this.ball.velocityY *= -1;
					this.lastPlayerTouched = "player_right";
					this.ball.color = this.player_right.color;

			}
		}

		var middle_x, difference_in_x, new_x_vel;
		// Ball and paddle collision (player_top and player_bottom)
		if (this.ball.velocityY < 0) {
			if (this.ball.x <= this.player_top.coords.x + default_paddle_height &&
				this.ball.x >= this.player_top.coords.x && this.ball.y > this.player_top.coords.y &&
				this.ball.y - this.ball.radius <= this.player_top.coords.y + default_paddle_width) {
					if (Math.abs(this.ball.velocityY) >= 20)
						this.ball.velocityY *= -1;
					else
						this.ball.velocityY *= -1 * this.ballSpeedMultiplierY;
					// middle_x = this.player_top.coords.x + default_paddle_height / 2;
					// difference_in_x = middle_x - this.ball.x;
					// reduction_factor = default_paddle_height / 2;
					// new_x_vel = difference_in_x / reduction_factor * this.ballSpeed;
					// this.ball.velocityX = -1 * new_x_vel;
					this.ball.velocityX *= -1;
					 // reverse ball direction
					this.lastPlayerTouched = "player_top";
					this.ball.color = this.player_top.color;
			}
		}
		else {
			if (this.ball.x <= this.player_bottom.coords.x + default_paddle_height &&
				this.ball.x >= this.player_bottom.coords.x && this.ball.y < this.player_bottom.coords.y &&
				this.ball.y + this.ball.radius >= this.player_bottom.coords.y) {
					if (Math.abs(this.ball.velocityY) >= 20)
						this.ball.velocityY *= -1;
					else
						this.ball.velocityY *= -1 * this.ballSpeedMultiplierY;
					// middle_x = this.player_bottom.coords.x + default_paddle_height / 2;
					// difference_in_x = middle_x - this.ball.x;
					// reduction_factor = default_paddle_height / 2;
					// new_x_vel = difference_in_x / reduction_factor * this.ballSpeed;
					// this.ball.velocityX = -1 * new_x_vel;
					this.ball.velocityX *= -1;
					 // reverse ball direction
					this.lastPlayerTouched = "player_bottom";
					this.ball.color = this.player_bottom.color;
			}
		}
	}

	draw() {
		this.drawPlayer(this.player_left);
		this.drawPlayer(this.player_right);
		this.drawPlayerHorizontally(this.player_top);
		this.drawPlayerHorizontally(this.player_bottom);
		this.drawBall(this.ball.color);
		this.drawScoreAndLine();
	}

	drawPlayer(player) {
		this.context.fillStyle = player.color;
		this.context.fillRect(player.coords.x, player.coords.y, default_paddle_width, default_paddle_height);
	}

	drawPlayerHorizontally(player) {
		this.context.fillStyle = player.color;
		this.context.fillRect(player.coords.x, player.coords.y, default_paddle_height, default_paddle_width);
	}

	drawBall(color) {
		this.context.fillStyle = color;
		this.context.strokeStyle = "black"; // Set the stroke color to black
		this.context.lineWidth = 2; // Set the line width to 2 pixels
		this.context.beginPath();
		this.context.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2, true);
		this.context.closePath();
		this.context.fill();
		this.context.stroke(); // Draw the stroke around the ball
	}

	drawScoreAndLine() {
		this.context.beginPath();
		this.context.setLineDash([5, 15]); // set the line to be a dashed line
		this.context.moveTo(this.boardWidth / 2, 0);
		this.context.lineTo(this.boardWidth / 2, this.boardHeight);
		this.context.strokeStyle = "lightrgray";
		this.context.stroke();
		this.context.setLineDash([]); // reset the line to be solid for other drawings

		this.context.beginPath();
		this.context.setLineDash([5, 15]); // set the line to be a dashed line
		this.context.moveTo(0, this.boardHeight / 2);
		this.context.lineTo(this.boardWidth, this.boardHeight / 2);
		this.context.strokeStyle = "lightrgray";
		this.context.stroke();
		this.context.setLineDash([]); // reset the line to be solid for other drawings

		// Change the scores on the page
		document.getElementById("four__local--top--score").textContent = this.player_top.score;
		document.getElementById("four__local--right--score").textContent = this.player_right.score;
		document.getElementById("four__local--bottom--score").textContent = this.player_bottom.score;
		document.getElementById("four__local--left--score").textContent = this.player_left.score;
	}

	gameOver() {
		if (this.player_left.score == constants.WINNING_SCORE || this.player_right.score == constants.WINNING_SCORE ||
			this.player_top.score == constants.WINNING_SCORE || this.player_bottom.score == constants.WINNING_SCORE) {

			if (this.player_left.score == constants.WINNING_SCORE) {
				this.winner = this.player_left;
			}
			else if (this.player_right.score == constants.WINNING_SCORE) {
				this.winner = this.player_right;
			}
			else if (this.player_top.score == constants.WINNING_SCORE) {
				this.winner = this.player_top;
			}
			else if (this.player_bottom.score == constants.WINNING_SCORE) {
				this.winner = this.player_bottom;
			}
			this.start = false;
		}
	};

	resetGame() {
		// reset the position, velocity and color of the ball
		this.setBall();
		// reset the last player who touched the ball
		this.lastPlayerTouched = null;
	};

	async update() {
		if (this.start) {
			this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);
			this.movePlayer();
			this.moveBall();
			this.draw();
			this.gameOver();
			if (this.winner != null) {
				this.ball.velocityX = 0;
				this.ball.velocityY = 0;
				g_template_text.textContent = this.winner.name + " a gagné !!";
				g_template_text.style.color = this.winner.color;
				g_startButton.classList.remove("d-none");
				await updateStatus("ONLINE");
			}
			else {
				requestAnimationFrame(this.update.bind(this));
			}
		}
	};
};

function start4PlayerGame(p1_name, p2_name, p3_name, p4_name) {

	if (g_game)
		g_game = null;

	g_game = new PongGame4Players(p1_name, p2_name, p3_name, p4_name);
	g_game.init();
};

/* --------------------- Listener for navigation event ---------------------- */

async function handlePageReload() {
	if (window.location.pathname == "/fourplayers/") {
		await updateStatus("ONLINE");
	}
};

window.addEventListener('load', handlePageReload);

function handlePageChange() {
	if (window.location.pathname == "/fourplayers/") {
		updateStatus("ONLINE");
	}
};

window.addEventListener('popstate', handlePageChange);

/* -------------------------- Listener for the page ------------------------- */

function listenerFourPlayers() {

	g_startButton = document.getElementById("startGame4");
	g_template_text = document.getElementById("template_text");

	document.getElementById("four__local--left--name").textContent = `${sessionStorage.getItem("nickname")}: Q/A`;

	g_startButton.addEventListener("click", e => {
		e.preventDefault();

		// hide the start button and reset some placeholder text
		g_startButton.classList.add("d-none");
		g_template_text.textContent = "";
		g_template_text.style.color = "";

		updateStatus("PLAYING");
		start4PlayerGame(sessionStorage.getItem("nickname"), "Invité Droit", "Invité Haut", "Inivité Bas");
	});

	// Listen for a button from the menu bar being clicked
	const navbarItems = document.querySelectorAll('.nav__item');
	navbarItems.forEach(item => {
		item.addEventListener('click', e => {
			e.preventDefault();

			if (g_game) {
				g_game.context.reset();
				g_game.start = false;
				g_game = null;
			}
			updateStatus("ONLINE");
		});
	});
};

/* --------------------------- Loader for the page -------------------------- */

async function loadFourPlayers() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {

		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/fourplayer/', init);

		if (response.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}

		return 1;
	} catch (e) {
		console.error("loadFourPlayers: " + e);
		return 0;
	}
};

export default {
	listenerFourPlayers,
	loadFourPlayers
};
