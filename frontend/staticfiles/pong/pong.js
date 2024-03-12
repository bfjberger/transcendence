class PongGame {
	constructor() {
		// board
		[this.boardWidth, this.boardHeight] = [700, 500];
		[this.board, this.context] = [null, null];
		this.ratio = 0.8;
		this.start = false;

		// players
		[this.playerWidth, this.playerHeight] = [10, 70];
		[this.playerVelocityY, this.playerSpeed] = [0, 3];
		[this.player1Score, this.player2Score, this.player3Score, this.player4Score] = [0, 0, 0, 0];
		[this.player1, this.player2, this.player3, this.player4] = [{}, {}, {}, {}];	
		this.playerSizeMultiplier = 1.1;
		this.keysPressed = {};

		// ball
		[this.ballSpeedMultiplierX, this.ballSpeedMultiplierY, this.ballSizeMultiplier] = [1.1, 1.05, 1.1];
		this.ballRadius = 10;
		this.ballSpeed = 2;
		this.lastPlayerTouched = null;
		this.ball = {};

		window.onload = this.init.bind(this);
	}

	init() {
		this.setBoard();

		// ask to press a key
		this.context.font = "15px sans-serif";
		this.context.fillText('Press space to start / Press escape to reload',
		this.board.width / 2 - 130,
		this.board.height / 2 + 15);

		this.ballStartVelocity();

		document.addEventListener("keydown", this.pressKey.bind(this));
		document.addEventListener("keydown", this.handleKeyPress.bind(this));
		document.addEventListener("keyup", this.handleKeyPress.bind(this));
	}

	setBoard() {
		this.board = document.getElementById("board");
		this.context = this.board.getContext("2d"); //used for drawing on the board
		this.board.height = window.innerHeight * this.ratio;
		// this.board.width = window.innerWidth * this.ratio;
		this.board.width = this.board.height;
		this.boardHeight = this.board.height;
		this.boardWidth = this.board.width;

		this.setPlayer();
		this.setBall();
	}

	setPlayer() {
		// set player size multiplier based on the board height
		this.playerSizeMultiplier = this.boardHeight / 500;

		// set players colors
		this.player1.color = "blue";
		this.player2.color = "red";
		this.player3.color = "green";
		this.player4.color = "yellow";

		// increase player size based on playerSizeMultiplier
		this.playerWidth *= this.playerSizeMultiplier;
		this.playerHeight *= this.playerSizeMultiplier;

		// invert player 3 and 4 width and height
		this.player3.width = this.playerHeight;
		this.player3.height = this.playerWidth;
		this.player4.width = this.playerHeight;
		this.player4.height = this.playerWidth;

		// set player 1 and 2 height and width
		this.player1.width = this.playerWidth;
		this.player1.height = this.playerHeight;
		this.player2.width = this.playerWidth;
		this.player2.height = this.playerHeight;

		// set players position
		this.player1.x = 0;
		this.player2.x = this.boardWidth - this.player2.width;
		this.player3.x = this.boardWidth / 2 - this.player3.width / 2;
		this.player4.x = this.boardWidth / 2 - this.player4.width / 2;
		this.player1.y = this.boardHeight / 2;
		this.player2.y = this.boardHeight / 2;
		this.player3.y = 0;
		this.player4.y = this.boardHeight - this.player4.height;

		// set players velocity
		this.playerSpeed = this.boardHeight / 100;
		this.player1.velocityY = 0;
		this.player2.velocityY = 0;
		this.player3.velocityX = 0;
		this.player4.velocityX = 0;
	}

	setBall() {
		this.ballSizeMultiplier = this.boardHeight / 500;
		this.ballRadius *= this.ballSizeMultiplier;
		this.ball.x = this.boardWidth / 2;
		this.ball.y = this.boardHeight / 2;
		this.ball.radius = this.ballRadius;
		this.ball.velocityX = 0;
		this.ball.velocityY = 0;
		this.ballSpeed = this.boardWidth / 350;
		this.ball.color = "white";
	}

	ballStartVelocity() {
		let random = this.randomNumber();
		switch (random) {
			case 0:
				this.ball.velocityX = 1;
				this.ball.velocityY = 1;
				break;
			case 1:
				this.ball.velocityX = -1;
				this.ball.velocityY = 1;
				break;
			case 2:
				this.ball.velocityX = 1;
				this.ball.velocityY = -1;
				break;
			case 3:
				this.ball.velocityX = -1;
				this.ball.velocityY = -1;
				break;
		}
	}

	randomNumber() {
		return Math.floor(Math.random() * 4);
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
	
	handleKeyPress(e) {
		this.keysPressed[e.key] = e.type === "keydown";
	}


	movePlayer() {
		// Player 1 and 2 movement
		if (this.keysPressed["q"]) {
			this.player1.velocityY = -this.playerSpeed;
		}
		else if (this.keysPressed["a"]) {
			this.player1.velocityY = this.playerSpeed;
		}
		else {
			this.player1.velocityY = 0;
		}
		if (this.keysPressed["9"]) {
			this.player2.velocityY = -this.playerSpeed;
		}
		else if (this.keysPressed["6"]) {
			this.player2.velocityY = this.playerSpeed;
		}
		else {
			this.player2.velocityY = 0;
		}
		// Player 3 and 4 movement
		if (this.keysPressed["n"]) {
			this.player3.velocityX = -this.playerSpeed;
		}
		else if (this.keysPressed["m"]) {
			this.player3.velocityX = this.playerSpeed;
		}
		else {
			this.player3.velocityX = 0;
		}
		if (this.keysPressed["ArrowLeft"]) {
			this.player4.velocityX = -this.playerSpeed;
		}
		else if (this.keysPressed["ArrowRight"]) {
			this.player4.velocityX = this.playerSpeed;
		}
		else {
			this.player4.velocityX = 0;
		}
		// Player 1 and 2 next movement
		if (!this.outOfBoundsY(this.player1.y + this.player1.velocityY)) {
			this.player1.y += this.player1.velocityY;
		}
		if (!this.outOfBoundsY(this.player2.y + this.player2.velocityY)) {
			this.player2.y += this.player2.velocityY;
		}
		// Player 3 and 4 next movement
		if (!this.outOfBoundsX(this.player3.x + this.player3.velocityX)) {
			this.player3.x += this.player3.velocityX;
		}   
		if (!this.outOfBoundsX(this.player4.x + this.player4.velocityX)) {
			this.player4.x += this.player4.velocityX;
		}
	}

	outOfBoundsX(xPosition) {
		return xPosition < 0 || xPosition > this.boardWidth - this.player3.width;
	}

	outOfBoundsY(yPosition) {
		return yPosition < 0 || yPosition > this.boardHeight - this.playerHeight;
	}

	moveBall() {
		this.ball.x += this.ball.velocityX * this.ballSpeed;
		this.ball.y += this.ball.velocityY * this.ballSpeed;
		this.checkCollisions();
		if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.boardWidth || this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.boardHeight) {
			if (this.lastPlayerTouched === 'player1') {
				this.player1Score++;
			} else if (this.lastPlayerTouched === 'player2') {
				this.player2Score++;
			} else if (this.lastPlayerTouched === 'player3') {
				this.player3Score++;
			} else if (this.lastPlayerTouched === 'player4') {
				this.player4Score++;
			}
			// reset the game with the direction opposite to the last player who touched the ball
			this.resetGame(-this.ball.velocityX, -this.ball.velocityY);
		}
	}

	checkCollisions() {
		// // Ball and wall collision
		// if (this.ball.y + this.ball.radius > this.boardHeight || this.ball.y - this.ball.radius < 0) {
		// 	this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
		// 	this.ball.velocityX *= this.ballSpeedMultiplierX;
		// }

		// Ball and paddle collision (player1 and player2)
		if (this.ball.velocityX < 0) {
			if (this.ball.x - this.ball.radius < this.player1.x + this.playerWidth && this.ball.y > this.player1.y && this.ball.y < this.player1.y + this.playerHeight) {
				this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
				this.ball.velocityY *= this.ballSpeedMultiplierY;
				this.lastPlayerTouched = "player1";
				this.ball.color = this.player1.color;
			}
		} else if (this.ball.velocityX > 0) {
			if (this.ball.x + this.ball.radius > this.player2.x && this.ball.y > this.player2.y && this.ball.y < this.player2.y + this.playerHeight) {
				this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
				this.ball.velocityY *= this.ballSpeedMultiplierY;
				this.lastPlayerTouched = "player2";
				this.ball.color = this.player2.color;
			}
		}

		// Ball and paddle collision (player3 and player4)
		if (this.ball.velocityY < 0) {
			if (this.ball.y - this.ball.radius < this.player3.y + this.player3.height && this.ball.x > this.player3.x && this.ball.x < this.player3.x + this.player3.width) {
				this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
				this.ball.velocityX *= this.ballSpeedMultiplierX;
				this.lastPlayerTouched = "player3";
				this.ball.color = this.player3.color;
			}
		} else if (this.ball.velocityY > 0) {
			if (this.ball.y + this.ball.radius > this.player4.y && this.ball.x > this.player4.x && this.ball.x < this.player4.x + this.player4.width) {
				this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
				this.ball.velocityX *= this.ballSpeedMultiplierX;
				this.lastPlayerTouched = "player4";
				this.ball.color = this.player4.color;
			}
		}
	}

	draw() {
		this.drawPlayer(this.player1.x, this.player1.y, this.player1.color);
		this.drawPlayer(this.player2.x, this.player2.y, this.player2.color);
		this.drawPlayerHorizontally(this.player3.x, this.player3.y, this.player3.color);
		this.drawPlayerHorizontally(this.player4.x, this.player4.y, this.player4.color);
		this.drawBall(this.ball.color);
		this.drawScoreAndLine();
	}

	drawPlayer(x, y, color) {
		this.context.fillStyle = color;
		this.context.fillRect(x, y, this.playerWidth, this.playerHeight);
	}

	drawPlayerHorizontally(x, y, color) {
		this.context.fillStyle = color;
		this.context.fillRect(x, y, this.playerHeight, this.playerWidth);
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
		this.context.font = "20px sans-serif";

		this.context.fillStyle = this.player1.color;
		this.context.fillText(this.player1Score, this.boardWidth / 2 - 50, 30);

		this.context.fillStyle = this.player2.color;
		this.context.fillText(this.player2Score, this.boardWidth / 2 + 25, 30);

		this.context.fillStyle = this.player3.color;
		this.context.fillText(this.player3Score, this.boardWidth / 2 - 50, this.boardHeight - 30);

		this.context.fillStyle = this.player4.color;
		this.context.fillText(this.player4Score, this.boardWidth / 2 + 25, this.boardHeight - 30);
	}

	gameOver() {
		if (this.player1Score === 3 || this.player2Score === 3 || this.player3Score === 3 || this.player4Score === 3) {
			this.ball.velocityX = 0;
			this.ball.velocityY = 0;
			this.context.fillStyle = "white";
			if (this.player1Score === 3) {
				this.context.fillText('Player 1 won!!', this.boardWidth / 2 - 30, this.boardHeight / 2 + 15);
			}
			else if (this.player2Score === 3) {
				this.context.fillText('Player 2 won!!', this.boardWidth / 2 - 30, this.boardHeight / 2 + 15);
			}
			else if (this.player3Score === 3) {
				this.context.fillText('Player 3 won!!', this.boardWidth / 2 - 30, this.boardHeight / 2 + 15);
			}
			else if (this.player4Score === 3) {
				this.context.fillText('Player 4 won!!', this.boardWidth / 2 - 30, this.boardHeight / 2 + 15);
			}
		}
	}

	resetGame(directionx, directiony) {
		this.ball = {
			x: this.boardWidth / 2,
			y: this.boardHeight / 2,
			radius: this.ballRadius,
			velocityX: directionx,
			velocityY: directiony,
			color: "white"
		};
		// reset the last player who touched the ball
		this.lastPlayerTouched = null;
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

const game = new PongGame();