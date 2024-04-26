import Player, {
	default_paddle_height,
	default_paddle_width,
} from "./Player.js"; // Import the Player class from Player

import router from "../logic/router.js" // Import the router for reload MIGHT LEAVE

// Some of the constructor default values are overriden by the different set functions
class PongGame2Players {
	constructor(player1Name, player2Name) {
		// board
		[this.boardWidth, this.boardHeight] = [650, 480];
		[this.board, this.context] = [null, null]; // defined in setBoard()
		this.start = false;

		// players
		[this.playerVelocityY, this.paddleSpeed] = [0, 3]; // overriden by movePlayer()
		[this.player1, this.player2] = [new Player(player1Name, "orange", false), new Player(player2Name, "blue", false),];
		this.keysPressed = {};

		// ball
		[this.ballRadius, this.ballSpeed] = [10, 2]; // overriden by setBall()
		[this.ballSpeedMultiplierX, this.ballSpeedMultiplierY] = [1.1, 1.05]; // overriden by checkCollisions()
		this.ball = {};
	}

	init() {
		this.setBoard();

		// ask to press a key
		// this.context.font = "15px sans-serif";
		// this.context.fillText("Press space to start / Press escape to reload", this.board.width / 2 - 130, this.board.height / 2 + 15);

		this.start = true;
		requestAnimationFrame(this.update.bind(this));
		document.addEventListener("keydown", this.pressKey.bind(this));
		document.addEventListener("keydown", this.handleKeyPress.bind(this));
		document.addEventListener("keyup", this.handleKeyPress.bind(this));
	}

	restartGame() {
		// Reset player scores
		this.player1.setScore(0);
		this.player2.setScore(0);

		// Reset player and ball positions
		this.setPlayer();
		this.setBall();

		// Reset game start flag
		this.start = false;

		// Initialize the game again
		this.init();
	}

	setBoard() {
		// used for drawing on the board
		this.board = document.getElementById("board_two");
		this.context = this.board.getContext("2d");

		this.setPlayer();
		this.setBall();
	}

	setPlayer() {
		//set players position
		this.player1.setCoords(10, this.boardHeight / 2 - this.player1.height / 2);
		this.player2.setCoords(this.boardWidth - this.player2.width - 10, this.boardHeight / 2 - this.player2.height / 2);

		// set velocity
		this.paddleSpeed = this.boardHeight / 100;
		this.player1.speed = this.player2.speed = this.paddleSpeed;
		this.player1.velocityY = this.player2.velocityY = 0;
	}

	setBall() {
		this.ball.radius = this.ballRadius;
		this.ballSpeed = this.boardWidth / 350;

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

		// DEBUG
		if (this.player1.getName().substr(0, 4) === "test" && this.player2.getName().substr(0, 4) === "test") {
			this.player1.setCoords(10, 10);
			this.player2.setCoords(this.boardWidth - this.player2.width - 10, 10);
			this.ball.y = this.boardHeight / 2;
			this.ball.velocityX = 180 * this.ballSpeed * -1; // player 1 gagne (gauche)
			// this.ball.velocityX = 180 * this.ballSpeed; // player 2 gagne (droite)
		}
	}

	pressKey(e) {
		// ' ' is the key for space
		// if (e.key === " " && !this.start) {
		// 	this.start = true;
		// 	requestAnimationFrame(this.update.bind(this));
		// }
		if (e.key === "Escape") {
			// router("twoplayers");
			window.alert("You can't stop the game.");
		}
	}

	handleKeyPress(e) {
		this.keysPressed[e.key] = e.type === "keydown";
	}

	movePlayer() {
		if (this.keysPressed["w"]) {
			this.player1.velocityY = -this.paddleSpeed;
		}
		else if (this.keysPressed["s"]) {
			this.player1.velocityY = this.paddleSpeed;
		}
		else {
			this.player1.velocityY = 0;
		}
		if (this.keysPressed["o"]) {
			this.player2.velocityY = -this.paddleSpeed;
		}
		else if (this.keysPressed["l"]) {
			this.player2.velocityY = this.paddleSpeed;
		}
		else {
			this.player2.velocityY = 0;
		}
		if (!this.outOfBounds(this.player1.coords.y + this.player1.velocityY)) {
			this.player1.coords.y += this.player1.velocityY;
		}
		if (!this.outOfBounds(this.player2.coords.y + this.player2.velocityY)) {
			this.player2.coords.y += this.player2.velocityY;
		}
	}

	outOfBounds(yPosition) {
		return (yPosition < 0 || yPosition > this.boardHeight - default_paddle_height);
	}

	moveBall() {
		this.ball.x += this.ball.velocityX * this.ballSpeed;
		this.ball.y += this.ball.velocityY * this.ballSpeed;
		this.checkCollisions();
		if (this.ball.x - this.ball.radius < 0) {
			this.player2.score++;
			this.resetGame();
		}
		if (this.ball.x + this.ball.radius > this.boardWidth) {
			this.player1.score++;
			this.resetGame();
		}
	}

	checkCollisions() {
		// Ball and wall collision
		if (this.ball.y + this.ball.radius > this.boardHeight || this.ball.y - this.ball.radius < 0) {
			this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
			this.ball.velocityX *= this.ballSpeedMultiplierX;
		}
		// Ball and paddle collision
		if (this.ball.velocityX < 0) {
			if (this.ball.x - this.ball.radius < this.player1.coords.x + default_paddle_width && this.ball.y > this.player1.coords.y &&
					this.ball.y < this.player1.coords.y + default_paddle_height) {
				this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
				this.ball.velocityY *= this.ballSpeedMultiplierY;
			}
		}
		else if (this.ball.velocityX > 0) {
			if (this.ball.x + this.ball.radius > this.player2.coords.x && this.ball.y > this.player2.coords.y &&
					this.ball.y < this.player2.coords.y + default_paddle_height) {
				this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
				this.ball.velocityY *= this.ballSpeedMultiplierY;
			}
		}
	}

	draw() {
		this.drawPlayer(this.player1);
		this.drawPlayer(this.player2);
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
		this.context.fillText(this.player1.getScore(), this.boardWidth / 2 - 50, 50);
		this.context.fillText(this.player2.getScore(), this.boardWidth / 2 + 25, 50);
	}

	gameOver() {
		return new Promise((resolve) => {
			const checkGameOver = () => {
				if (this.player1.getScore() === 3 || this.player2.getScore() === 3) {
					let winner = this.player1.getScore() === 3 ? this.player1 : this.player2;

					if (winner.getHasWon() === false) {
						winner.setWins(winner.getWins() + 1);
						winner.setHasWon(true);
						this.start = false;
					}
					resolve(winner);
				}
				else {
					setTimeout(checkGameOver, 1000); // Check every second
				}
			};
			checkGameOver();
		});
	}

	resetGame() {
		// reset the position and velocity of the ball
		this.setBall();
	}

	update() {
		this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);
		this.movePlayer();
		this.moveBall();
		this.draw();
		let winner = this.gameOver();
		winner.then((winner) => {
			if (winner) {
				if (window.location.pathname === "/twoplayers/") {
					let winnerText = winner.getName() + " à gagner !!";
					this.context.fillStyle = winner.color;
					this.context.font = "50px sans-serif";
					const textWidth = this.context.measureText(winnerText).width;
					const textX = this.boardWidth / 2 - textWidth / 2;
					const textY = this.boardHeight / 2 + 15;
					this.context.fillText(winnerText, textX, textY);
				}
				this.ball.velocityX = 0;
				this.ball.velocityY = 0;
				if (window.location.pathname === "/tournament/") {
					this.context.reset();
				}
			}
			else {
				requestAnimationFrame(this.update.bind(this));
			}
		});
		requestAnimationFrame(this.update.bind(this));
	}
}

var game;

function start2PlayerGame(p1_name, p2_name) {
	if (!game) {
		game = new PongGame2Players(p1_name, p2_name);
		game.init();
	}
}

function listenerTwoPlayers() {

	document.getElementById("two__local--left").textContent = `${sessionStorage.getItem("nickname")}: W/S`;

	document.getElementById("startGame2").addEventListener("click", e => {
		e.preventDefault();

		// hide the start button
		document.getElementById("startGame2").classList.add("d-none");

		start2PlayerGame(sessionStorage.getItem("nickname"), "Joueur Invité");
	});
};

async function loadTwoPlayers() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {

		let hostnameport = "http://" + window.location.host

		const response = await fetch(hostnameport +'/api/twoplayer/', init);

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}

		return 1;
	} catch (e) {
		console.error("loadTwoPlayers: " + e);
		return 0;
	}
};

export {
	PongGame2Players
};

export default {
	listenerTwoPlayers,
	loadTwoPlayers
};
