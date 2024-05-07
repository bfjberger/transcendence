import Player, {
	default_paddle_height,
	default_paddle_width,
} from "./Player.js"; // Import the Player class from Player

var g_game;
var g_startButton;
var g_template_text;

class PongGame4Players {
	constructor(player_left_name, player_right_name, player_top_name, player_bottom_name) {
		// board
		[this.boardWidth, this.boardHeight] = [650, 650];
		[this.board, this.context] = [null, null]; // defined in setBoard()
		this.start = false;

		// players
		[this.playerVelocityY, this.paddleSpeed] = [0, this.boardHeight / 100]; // overriden by movePlayer()
		[this.player_left, this.player_right, this.player_top, this.player_bottom] =
			[
				new Player(player_left_name, "orange", false),
				new Player(player_right_name, "blue", false),
				new Player(player_top_name, "violet", true),
				new Player(player_bottom_name, "red", true)
			];
		this.winner = null;
		this.keysPressed = {};

		// ball
		[this.ballRadius, this.ballSpeed] = [10, this.boardWidth / 250];
		[this.ballSpeedMultiplierX, this.ballSpeedMultiplierY] = [1.1, 1.05];
		this.ball = {};
		this.lastPlayerTouched = null;
	}

	init() {
		this.setBoard();

		this.start = true;
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
		this.setBall();
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
		if (this.keysPressed["q"]) {
			this.player_left.velocityY = -this.paddleSpeed;
		}
		else if (this.keysPressed["a"]) {
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
		if (this.keysPressed["n"]) {
			this.player_top.velocityX = -this.paddleSpeed;
		}
		else if (this.keysPressed["m"]) {
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
		// Ball and paddle collision (player_left and player_right)
		if (this.ball.velocityX < 0) {
			if (this.ball.y <= this.player_left.coords.y + default_paddle_height &&
				this.ball.y >= this.player_left.coords.y && this.ball.x > this.player_left.coords.x &&
				this.ball.x - this.ball.radius <= this.player_left.coords.x + default_paddle_width) {
					this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
					this.ball.velocityY *= this.ballSpeedMultiplierY;
					this.lastPlayerTouched = "player_left";
					this.ball.color = this.player_left.color;
			}
		}
		else if (this.ball.velocityX > 0) {
			if (this.ball.y <= this.player_right.coords.y + default_paddle_height &&
				this.ball.y >= this.player_right.coords.y && this.ball.x < this.player_right.coords.x &&
				this.ball.x + this.ball.radius >= this.player_right.coords.x) {
					this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
					this.ball.velocityY *= this.ballSpeedMultiplierY;
					this.lastPlayerTouched = "player_right";
					this.ball.color = this.player_right.color;
			}
		}

		// Ball and paddle collision (player_top and player_bottom)
		if (this.ball.velocityY < 0) {
			if (this.ball.x <= this.player_top.coords.x + default_paddle_height &&
				this.ball.x >= this.player_top.coords.x && this.ball.y > this.player_top.coords.y &&
				this.ball.y - this.ball.radius <= this.player_top.coords.y + default_paddle_width) {
					this.ball.velocityX *= this.ballSpeedMultiplierX;
					this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
					this.lastPlayerTouched = "player_top";
					this.ball.color = this.player_top.color;
			}
		}
		else if (this.ball.velocityY > 0) {
			if (this.ball.x <= this.player_bottom.coords.x + default_paddle_height &&
				this.ball.x >= this.player_bottom.coords.x && this.ball.y < this.player_bottom.coords.y &&
				this.ball.y + this.ball.radius >= this.player_bottom.coords.y) {
					this.ball.velocityX *= this.ballSpeedMultiplierX;
					this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
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
		this.context.strokeStyle = "white";
		this.context.stroke();
		this.context.setLineDash([]); // reset the line to be solid for other drawings

		this.context.beginPath();
		this.context.setLineDash([5, 15]); // set the line to be a dashed line
		this.context.moveTo(0, this.boardHeight / 2);
		this.context.lineTo(this.boardWidth, this.boardHeight / 2);
		this.context.strokeStyle = "white";
		this.context.stroke();
		this.context.setLineDash([]); // reset the line to be solid for other drawings

		this.context.font = "20px sans-serif";
		this.context.fillStyle = "black";
		this.context.fillText(this.player_left.score, 10, this.boardHeight / 2);
		this.context.fillText(this.player_right.score, this.boardWidth - 20, this.boardHeight / 2);
		this.context.fillText(this.player_top.score, this.boardWidth / 2, 20);
		this.context.fillText(this.player_bottom.score, this.boardWidth / 2, this.boardHeight - 20);
	}

	gameOver() {
		if (this.player_left.score === 3 || this.player_right.score === 3 ||
			this.player_top.score === 3 || this.player_bottom.score === 3) {

			if (this.player_left.score === 3) {
				this.winner = this.player_left;
			}
			else if (this.player_right.score === 3) {
				this.winner = this.player_right;
			}
			else if (this.player_top.score === 3) {
				this.winner = this.player_top;
			}
			else if (this.player_bottom.score === 3) {
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
			await updateStatus();
		}
		else {
			requestAnimationFrame(this.update.bind(this));
		}
	};
};

/*
	Event listener for reload
*/
window.addEventListener('unload', async function() {
	await updateStatus();
});

async function handlePageReload() {
	await updateStatus();
};

window.addEventListener('beforeunload', handlePageReload);

async function updateStatus() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'applications/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/changestatus/', init);

		if (!response.ok) {
			const error_text = await response.text();
			throw new Error(error_text);
		}

		if (response.status === 200) {
			const data = await response.json();
		}

	} catch (e) {
		console.error(e);
	}
};

function start4PlayerGame(p1_name, p2_name, p3_name, p4_name) {

	if (g_game != undefined)
		g_game = null;

	g_game = new PongGame4Players(p1_name, p2_name, p3_name, p4_name);
	g_game.init();
}

function listenerFourPlayers() {

	g_startButton = document.getElementById("startGame4");
	g_template_text = document.getElementById("template_text");

	document.getElementById("four__local--left").textContent = `${sessionStorage.getItem("nickname")}: Q/A`;

	g_startButton.addEventListener("click", e => {
		e.preventDefault();

		// hide the start button and reset some placeholder text
		g_startButton.classList.add("d-none");
		g_template_text.textContent = "";
		g_template_text.style.color = "";

		// updateStatus();
		start4PlayerGame(sessionStorage.getItem("nickname"), "Invité Droit", "Invité Haut", "Inivité Bas");
	});
};

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

		if (response.status === 403) {
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
