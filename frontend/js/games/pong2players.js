import Player, {
	default_paddle_height,
	default_paddle_width,
} from "./Player.js"; // Import the Player class from Player

import * as constants from "./Constants.js"

import { updateStatus } from "../logic/utils.js";

var g_game;
var g_startButton;
var g_template_text;

// Some of the constructor default values are overriden by the different set functions
class PongGame2Players {
	constructor(player_leftName, player_rightName) {
		// board
		[this.boardWidth, this.boardHeight] = [constants.WIN_WIDTH, constants.WIN_HEIGHT];
		[this.board, this.context] = [null, null]; // defined in setBoard()
		this.start = false;

		// players
		[this.playerVelocityY, this.paddleSpeed] = [0, this.boardHeight / 100];
		[this.player_left, this.player_right] = [new Player(player_leftName, constants.PLAYER_LEFT_COLOR, false),
												new Player(player_rightName, constants.PLAYER_RIGHT_COLOR, false)];
		this.winner = null;
		this.keysPressed = {};

		// ball
		[this.ballRadius, this.ballSpeed] = [constants.BALL_RADIUS, this.boardWidth / 250];
		[this.ballSpeedMultiplierX, this.ballSpeedMultiplierY] = [1.1, 1.05];
		this.ball = {};
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
		this.board = document.getElementById("board_two");
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
		//set players position
		this.player_left.setCoords(10, (this.boardHeight - this.player_left.height) / 2);
		this.player_right.setCoords(this.boardWidth - this.player_right.width - 10,
									(this.boardHeight - this.player_right.height) / 2);

		// set velocity
		this.player_left.speed = this.player_right.speed = this.paddleSpeed;
		this.player_left.velocityY = this.player_right.velocityY = 0;
	}

	setBall() {
		this.ball.radius = this.ballRadius;

		// Position of the ball
		this.ball.x = this.boardWidth / 2;
		this.ball.y = 100 + Math.random() * (this.boardHeight - 200); //range of 100px to have a margin to the wall

		// Calculate a random angle within the range 160° to 200° in radians
		const minAngle = Math.PI - (Math.PI / 9);
		const maxAngle = Math.PI + (Math.PI / 9);
		let randomAngle = Math.random() * (maxAngle - minAngle) + minAngle;

		let direction = Math.random() < 0.5 ? -1 : 1;
		// Velocity of the ball
		this.ball.velocityX = (Math.cos(randomAngle) * this.ballSpeed) * direction;
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
		if (this.keysPressed["w"] || this.keysPressed["W"]) {
			this.player_left.velocityY = -this.paddleSpeed;
		}
		else if (this.keysPressed["s"] || this.keysPressed["S"]) {
			this.player_left.velocityY = this.paddleSpeed;
		}
		else {
			this.player_left.velocityY = 0;
		}
		if (this.keysPressed["o"] || this.keysPressed["O"]) {
			this.player_right.velocityY = -this.paddleSpeed;
		}
		else if (this.keysPressed["l"] || this.keysPressed["L"]) {
			this.player_right.velocityY = this.paddleSpeed;
		}
		else {
			this.player_right.velocityY = 0;
		}
		if (!this.outOfBounds(this.player_left.coords.y + this.player_left.velocityY)) {
			this.player_left.coords.y += this.player_left.velocityY;
		}
		if (!this.outOfBounds(this.player_right.coords.y + this.player_right.velocityY)) {
			this.player_right.coords.y += this.player_right.velocityY;
		}
	}

	outOfBounds(yPosition) {
		return (yPosition < 0 || yPosition > this.boardHeight - default_paddle_height);
	}

	moveBall() {
		this.checkCollisions();
		this.ball.x += this.ball.velocityX;
		this.ball.y += this.ball.velocityY;
		if (this.ball.x - this.ball.radius < 0) {
			this.player_right.score++;
			this.resetGame();
		}
		if (this.ball.x + this.ball.radius > this.boardWidth) {
			this.player_left.score++;
			this.resetGame();
		}
	}

	checkCollisions() {
		// Ball and wall collision
		if (this.ball.y + this.ball.radius >= this.boardHeight || this.ball.y - this.ball.radius <= 0) {
			this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
			this.ball.velocityX *= this.ballSpeedMultiplierX;
		}
		if (this.ball.y - this.ball.radius <= 0) {
			this.ball.y = this.ball.radius;
		}
		if (this.ball.y + this.ball.radius >= this.boardHeight) {
			this.ball.y = this.boardHeight - this.ball.radius;
		}

		var middle_y, difference_in_y, new_y_vel, reduction_factor;
		// Ball and paddle collision
		if (this.ball.velocityX < 0) {
			if (this.ball.y <= this.player_left.coords.y + default_paddle_height &&
				this.ball.y >= this.player_left.coords.y && this.ball.x > this.player_left.coords.x &&
				this.ball.x - this.ball.radius <= this.player_left.coords.x + default_paddle_width) {
					if (Math.abs(this.ball.velocityX) >= 20)
						this.ball.velocityX *= -1;
					else
						this.ball.velocityX *= -1 * this.ballSpeedMultiplierX;
					middle_y = this.player_left.coords.y + default_paddle_height / 2;
					difference_in_y = middle_y - this.ball.y;
					reduction_factor = default_paddle_height / 2;
					new_y_vel = difference_in_y / reduction_factor * this.ballSpeed;
					this.ball.velocityY = -1 * new_y_vel;

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
					// this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
					middle_y = this.player_right.coords.y + default_paddle_height / 2;
					difference_in_y = middle_y - this.ball.y;
					reduction_factor = default_paddle_height / 2;
					new_y_vel = difference_in_y / reduction_factor * this.ballSpeed;
					this.ball.velocityY = -1 * new_y_vel;

			}
		}
	};

	draw() {
		this.drawPlayer(this.player_left);
		this.drawPlayer(this.player_right);
		if (this.start)
			this.drawBall("white");
		this.drawScoreAndLine();
	}

	drawPlayer(player) {
		this.context.fillStyle = player.color;
		this.context.fillRect(player.coords.x, player.coords.y, default_paddle_width, default_paddle_height);
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
		this.context.setLineDash([5, 15]); // Set the line dash pattern to create a dotted line
		this.context.moveTo(this.boardWidth / 2, 0);
		this.context.lineTo(this.boardWidth / 2, this.boardHeight);
		this.context.strokeStyle = "white";
		this.context.stroke();
		this.context.setLineDash([]); // reset the line to be solid for other drawings

		this.context.font = "50px sans-serif";
		this.context.fillStyle = "white";
		this.context.fillText(this.player_left.score, this.boardWidth / 2 - 50, 50);
		this.context.fillText(this.player_right.score, this.boardWidth / 2 + 25, 50);
	}

	resetGame() {
		// reset the position and velocity of the ball
		this.setBall();
	};

	gameOver() {
		return new Promise((resolve) => {
			const checkGameOver = () => {
				if (this.player_left.score == constants.WINNING_SCORE || this.player_right.score == constants.WINNING_SCORE) {
					let winner = this.player_left.score == constants.WINNING_SCORE ? this.player_left : this.player_right;
					this.start = false;
					resolve(winner);
				}
				else {
					setTimeout(checkGameOver, 1000); // Check every second
				}
			};
			checkGameOver();
		});
	}

	async update() {
		if (this.start) {
			this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);
			this.movePlayer();
			this.moveBall();
			this.draw();
			var winner = this.gameOver();
			winner.then(async (winner) => {
				if (winner) {
					if (window.location.pathname === "/twoplayers/") {
						g_template_text.textContent = winner.name + " a gagné !!";
						g_template_text.style.color = winner.color;
						g_startButton.classList.remove("d-none");
					}
					this.ball.velocityX = 0;
					this.ball.velocityY = 0;
				}
				else {
					requestAnimationFrame(this.update.bind(this));
				}
			});
			requestAnimationFrame(this.update.bind(this));
		}
	};
};

async function start2PlayerGame(p1_name, p2_name) {

	if (g_game)
		g_game = null;

	g_game = new PongGame2Players(p1_name, p2_name);
	g_game.init();

	await g_game.gameOver();
	await updateStatus("ONLINE");

	g_game = null;
};

/* --------------------- Listener for navigation event ---------------------- */

async function handlePageReload() {
	if (window.location.pathname == "/twoplayers/") {
		await updateStatus("ONLINE");
		if (g_game)
			g_game = null;
	}
};

window.addEventListener('load', handlePageReload);

function handlePageChange() {
	if (window.location.pathname == "/twoplayers/") {
		updateStatus("ONLINE");
		if (g_game)
			g_game = null;
	}
};

window.addEventListener('popstate', handlePageChange);

/* -------------------------- Listener for the page ------------------------- */

function listenerTwoPlayers()
{

	g_startButton = document.getElementById("startGame2");
	g_template_text = document.getElementById("template_text");

	document.getElementById("two__local--left").textContent = `${sessionStorage.getItem("nickname")}: W/S`;

	g_startButton.addEventListener("click", e => {
		e.preventDefault();

		// hide the start button and reset some placeholder text
		g_startButton.classList.add("d-none");
		g_template_text.textContent = "";
		g_template_text.style.color = "";

		updateStatus("PLAYING");
		start2PlayerGame(sessionStorage.getItem("nickname"), "Joueur Invité");
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

async function loadTwoPlayers() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "https://" + window.location.host
		const response = await fetch(hostnameport +'/api/twoplayer/', init);

		if (response.status != 200) {
			throw new Error(response.status);
		}
		const data = await response.json();

		return 1;
	} catch (e)
	{
		console.error("loadTwoPlayers: error : " + e);
		return 0;
	}
};

export {
	PongGame2Players,
	updateStatus
};

export default {
	listenerTwoPlayers,
	loadTwoPlayers
};
