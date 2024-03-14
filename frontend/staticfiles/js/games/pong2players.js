/*
    POOR ATTEMPT TO SPA
    NOT WORKING
*/

// import AbstractView from '../views/AbstractView.js';

// export default class extends AbstractView {
// 	constructor() {
// 		this.setTitle("Pong 2 Players");
// 	}

// 	async getHtml() {
// 		return "";
// 	}
// }

class PongGame2Players {
	constructor() {
		// board
		[this.boardWidth, this.boardHeight] = [700, 500];
		[this.board, this.context] = [null, null];
		this.ratio = 0.625;
		this.start = false;

		// players
		[this.playerWidth, this.playerHeight] = [10, 70];
		[this.playerVelocityY, this.playerSpeed] = [0, 3];
    	[this.player1Score, this.player2Score] = [0, 0];
		[this.player1, this.player2] = [{}, {}];
		this.keysPressed = {};

		// ball
		[this.ballSpeedMultiplierX, this.ballSpeedMultiplierY] = [1.1, 1.05];
		this.ballRadius = 10;
		this.ballSpeed = 2;
		this.ball = {};
	}

	init() {
		this.setBoard();

        // ask to press a key
        this.context.font = "15px sans-serif";
        this.context.fillText('Press space to start / Press escape to reload',
        this.board.width / 2 - 130,
        this.board.height / 2 + 15);

        document.addEventListener("keydown", this.pressKey.bind(this));
        document.addEventListener("keydown", this.handleKeyPress.bind(this));
        document.addEventListener("keyup", this.handleKeyPress.bind(this));
    }

    setBoard() {
		this.board = document.getElementsByName("board");
		this.context = this.board.getContext("2d"); //used for drawing on the board
        this.board.height = window.innerHeight * this.ratio;
        this.board.width = window.innerWidth * this.ratio;
        this.boardHeight = this.board.height;
        this.boardWidth = this.board.width;

		this.setPlayer();
		this.setBall();
    }

	setPlayer() {
		// set players colors
		[this.player1.color, this.player2.color] = ["orange", "blue"];

		// set players position
		this.player1.x = 10;
		this.player2.x = this.boardWidth - this.playerWidth - 10;
		this.player1.y = this.boardHeight / 2 - this.playerHeight / 2;
		this.player2.y = this.boardHeight / 2 - this.playerHeight / 2;

		// set players velocity
		this.playerSpeed = this.boardHeight / 100;
		this.player1.velocityY = this.player2.velocityY = 0;
	}

	setBall() {
		this.ball.x = this.boardWidth / 2;
		this.ball.y = 100 + Math.random() * (this.boardHeight - 200); //range of 100px to not have the ball spawn near a wall
		this.ball.radius = this.ballRadius;
		this.ball.velocityX = (Math.random() < 0.5 ? 1 : -1) * (0.75 + Math.random() * 0.25);
		this.ball.velocityY = (Math.random() < 0.5 ? 1 : -1) * (0.75 + Math.random() * 0.25);
		this.ballSpeed = this.boardWidth / 350;
	}

	pressKey(e) {
		if (e.key === ' ' && !this.start) { // ' ' is the key for space
			this.start = true;
			requestAnimationFrame(this.update.bind(this));
		}
		if (e.key === 'Escape') {
			location.reload();
		}
	}

	reloadPage() {
		location.reload();
	}

	handleKeyPress(e) {
		this.keysPressed[e.key] = e.type === "keydown";
	}

	movePlayer() {
		if (this.keysPressed["w"]) {
			this.player1.velocityY = -this.playerSpeed;
		}
		else if (this.keysPressed["s"]) {
			this.player1.velocityY = this.playerSpeed;
		}
		else {
			this.player1.velocityY = 0;
		}
		if (this.keysPressed["ArrowUp"]) {
			this.player2.velocityY = -this.playerSpeed;
		}
		else if (this.keysPressed["ArrowDown"]) {
			this.player2.velocityY = this.playerSpeed;
		}
		else {
			this.player2.velocityY = 0;
		}
		if (!this.outOfBounds(this.player1.y + this.player1.velocityY)) {
			this.player1.y += this.player1.velocityY;
		}
		if (!this.outOfBounds(this.player2.y + this.player2.velocityY)) {
			this.player2.y += this.player2.velocityY;
		}
	}

	moveBall() {
		this.ball.x += this.ball.velocityX * this.ballSpeed;
		this.ball.y += this.ball.velocityY * this.ballSpeed;
		this.checkCollisions();
		if (this.ball.x - this.ball.radius < 0) {
			this.player2Score++;
			this.resetGame(1);
		}
		if (this.ball.x + this.ball.radius > this.boardWidth) {
			this.player1Score++;
			this.resetGame(-1);
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
			if (this.ball.x - this.ball.radius < this.player1.x + this.playerWidth && this.ball.y > this.player1.y && this.ball.y < this.player1.y + this.playerHeight) {
				this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
				this.ball.velocityY *= this.ballSpeedMultiplierY;
			}
		} else if (this.ball.velocityX > 0) {
			if (this.ball.x + this.ball.radius > this.player2.x && this.ball.y > this.player2.y && this.ball.y < this.player2.y + this.playerHeight) {
				this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
				this.ball.velocityY *= this.ballSpeedMultiplierY;
			}
		}
	}

	draw() {
		this.drawPlayer(this.player1.x, this.player1.y, this.player1.color);
		this.drawPlayer(this.player2.x, this.player2.y, this.player2.color);
		this.drawBall("white");
		this.drawScoreAndLine();
	}

	drawPlayer(x, y, color) {
		this.context.fillStyle = color;
		this.context.fillRect(x, y, this.playerWidth, this.playerHeight);
	}

	drawBall(color) {
		this.context.fillStyle = color;
		this.context.beginPath();
		this.context.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2, true);
		this.context.closePath();
		this.context.fill();
	}

	drawScoreAndLine() {
		this.context.beginPath();
		this.context.moveTo(this.boardWidth / 2, 0);
		this.context.lineTo(this.boardWidth / 2, this.boardHeight);
		this.context.strokeStyle = "white";
		this.context.stroke();
		this.context.font = "50px sans-serif";
		this.context.fillText(this.player1Score, this.boardWidth / 2 - 50, 50);
		this.context.fillText(this.player2Score, this.boardWidth / 2 + 25, 50);
	}

	gameOver() {
		if (this.player1Score === 3 || this.player2Score === 3) {
			if (this.player1Score === 3) {
				this.context.fillStyle = this.player1.color;
				this.context.fillText('Player 1 won!!',
					this.boardWidth / 2 - 130,
					this.boardHeight / 2 + 15);
				this.ball.velocityX = 0;
				this.ball.velocityY = 0;
			}
			else {
				this.context.fillStyle = this.player2.color;
				this.context.fillText('Player 2 won!!',
					this.boardWidth / 2 - 130,
					this.boardHeight / 2 + 15);
				this.ball.velocityX = 0;
				this.ball.velocityY = 0;
			}
		}
	}

	outOfBounds(yPosition) {
		return yPosition < 0 || yPosition > this.boardHeight - this.playerHeight;
	}

	resetGame(direction) {
		this.ball = {
			x: this.boardWidth / 2,
			y: this.boardHeight / 2,
			radius: this.ballRadius,
			velocityX: Math.random() * 2 - 1,
			velocityY: Math.random() * 2 - 1
		};
	}

	update() {
		this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);
		this.movePlayer();
		this.moveBall();
		this.draw();
		this.gameOver();
		requestAnimationFrame(this.update.bind(this));
	}

}

var game;

function start2PlayerGame() {
	if (!game) {
		game = new PongGame2Players();
		game.init();
		document.getElementById("controls").textContent = "Left Player: W/S || Right Player: UpArrow/DownArrow";
	}
}

function reload2PlayerGame() {
	if (game) {
		game.reloadPage();
	}
}

document.addEventListener('DOMContentLoaded', function() {
	const game = new PongGame2Players();
	game.init();
});