/*
	ATTEMPT TO SPA NOT WORKING
*/

// import AbstractView from '../views/AbstractView.js';

// export default class extends AbstractView {
// 	constructor() {
// 		this.setTitle("Pong 4 Players");
// 	}

// 	async getHtml() {
// 		return "";
// 	}
// }

import Player, {
  default_paddle_height,
  default_paddle_width,
} from "./Player.js"; // Import the Player class from Player

class PongGame4Players {
  constructor(player1Name, player2Name, player3Name, player4Name) {
	// board
	[this.boardWidth, this.boardHeight] = [650, 650];
	[this.board, this.context] = [null, null]; // defined in setBoard()
	this.start = false;

	// players
	[this.playerVelocityY, this.paddleSpeed] = [0, 3]; // overriden by movePlayer()
	[this.player1, this.player2, this.player3, this.player4] = [new Player(player1Name, "orange", false), new Player(player2Name, "blue", false), new Player(player3Name, "violet", true), new Player(player4Name, "red", true),];
	this.keysPressed = {};

	// ball
	[this.ballRadius, this.ballSpeed] = [10, 2]; // overriden by setBall()
	[this.ballSpeedMultiplierX, this.ballSpeedMultiplierY] = [1.1, 1.05]; // overriden by checkCollisions()
	this.ball = {};
	this.lastPlayerTouched = null;
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
	this.player3.setScore(0);
	this.player4.setScore(0);

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
	this.board = document.getElementById("board_four");
	this.context = this.board.getContext("2d");

	this.setPlayer();
	this.setBall();
  }

  setPlayer() {
	// set players position
	this.player1.setCoords(10, this.boardHeight / 2 - this.player1.height / 2);
	this.player2.setCoords(this.boardWidth - this.player2.width - 10, this.boardHeight / 2 - this.player2.height / 2);
	this.player3.setCoords(this.boardWidth / 2 - this.player3.width / 2, 10);
	this.player4.setCoords(this.boardWidth / 2 - this.player4.width / 2, this.boardHeight - this.player4.height - 10);

	// set velocity
	this.paddleSpeed = this.boardHeight / 100;
	this.player1.speed = this.player2.speed = this.player3.speed = this.player4.speed = this.paddleSpeed;
	this.player1.velocityY = this.player2.velocityY = this.player3.velocityX = this.player4.velocityX = 0;
  }

  setBall() {
	this.ball.color = "white";
	this.ball.radius = this.ballRadius;
	this.ballSpeed = this.boardWidth / 350;

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
	// ' ' is the key for space
	// if (e.key === " " && !this.start) {
	//   this.start = true;
	//   requestAnimationFrame(this.update.bind(this));
	// }
	if (e.key === "Escape") {
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
	// Player 1 and 2 movement
	if (this.keysPressed["q"]) {
	  this.player1.velocityY = -this.paddleSpeed;
	}
	else if (this.keysPressed["a"]) {
	  this.player1.velocityY = this.paddleSpeed;
	}
	else {
	  this.player1.velocityY = 0;
	}
	if (this.keysPressed["9"]) {
	  this.player2.velocityY = -this.paddleSpeed;
	}
	else if (this.keysPressed["6"]) {
	  this.player2.velocityY = this.paddleSpeed;
	}
	else {
	  this.player2.velocityY = 0;
	}
	// Player 3 and 4 movement
	if (this.keysPressed["n"]) {
	  this.player3.velocityX = -this.paddleSpeed;
	}
	else if (this.keysPressed["m"]) {
	  this.player3.velocityX = this.paddleSpeed;
	}
	else {
	  this.player3.velocityX = 0;
	}
	if (this.keysPressed["ArrowLeft"]) {
	  this.player4.velocityX = -this.paddleSpeed;
	}
	else if (this.keysPressed["ArrowRight"]) {
	  this.player4.velocityX = this.paddleSpeed;
	}
	else {
	  this.player4.velocityX = 0;
	}
	// Player 1 and 2 next movement
	if (!this.outOfBoundsY(this.player1.coords.y + this.player1.velocityY)) {
	  this.player1.coords.y += this.player1.velocityY;
	}
	if (!this.outOfBoundsY(this.player2.coords.y + this.player2.velocityY)) {
	  this.player2.coords.y += this.player2.velocityY;
	}
	// Player 3 and 4 next movement
	if (!this.outOfBoundsX(this.player3.coords.x + this.player3.velocityX)) {
	  this.player3.coords.x += this.player3.velocityX;
	}
	if (!this.outOfBoundsX(this.player4.coords.x + this.player4.velocityX)) {
	  this.player4.coords.x += this.player4.velocityX;
	}
  }

  outOfBoundsX(xPosition) {
	return (xPosition < 0 || xPosition > this.boardWidth - this.player3.width);
  }

  outOfBoundsY(yPosition) {
	return (yPosition < 0 || yPosition > this.boardHeight - default_paddle_height);
  }

  moveBall() {
	this.ball.x += this.ball.velocityX * this.ballSpeed;
	this.ball.y += this.ball.velocityY * this.ballSpeed;
	this.checkCollisions();
	if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.boardWidth || this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.boardHeight) {
	  if (this.lastPlayerTouched === "player1") {
		this.player1.score++;
	  }
	  else if (this.lastPlayerTouched === "player2") {
		this.player2.score++;
	  }
	  else if (this.lastPlayerTouched === "player3") {
		this.player3.score++;
	  }
	  else if (this.lastPlayerTouched === "player4") {
		this.player4.score++;
	  }
	  // reset the game
	  this.resetGame();
	}
  }

  checkCollisions() {
	// Ball and paddle collision (player1 and player2)
	if (this.ball.velocityX < 0) {
	  if (this.ball.x - this.ball.radius < this.player1.coords.x + default_paddle_width && this.ball.y > this.player1.coords.y && this.ball.y < this.player1.coords.y + default_paddle_height) {
		this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
		this.ball.velocityY *= this.ballSpeedMultiplierY;
		this.lastPlayerTouched = "player1";
		this.ball.color = this.player1.color;
	  }
	}
	else if (this.ball.velocityX > 0) {
	  if (this.ball.x + this.ball.radius > this.player2.coords.x && this.ball.y > this.player2.coords.y && this.ball.y < this.player2.coords.y + default_paddle_height) {
		this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
		this.ball.velocityY *= this.ballSpeedMultiplierY;
		this.lastPlayerTouched = "player2";
		this.ball.color = this.player2.color;
	  }
	}

	// Ball and paddle collision (player3 and player4)
	if (this.ball.velocityY < 0) {
	  if (this.ball.y - this.ball.radius < this.player3.coords.y + default_paddle_width && this.ball.x > this.player3.coords.x && this.ball.x < this.player3.coords.x + default_paddle_height) {
		this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
		this.ball.velocityX *= this.ballSpeedMultiplierX;
		this.lastPlayerTouched = "player3";
		this.ball.color = this.player3.color;
	  }
	}
	else if (this.ball.velocityY > 0) {
	  if (this.ball.y + this.ball.radius > this.player4.coords.y && this.ball.x > this.player4.coords.x && this.ball.x < this.player4.coords.x + default_paddle_height) {
		this.ball.velocityY *= -1 * this.ballSpeedMultiplierY; // reverse ball direction
		this.ball.velocityX *= this.ballSpeedMultiplierX;
		this.lastPlayerTouched = "player4";
		this.ball.color = this.player4.color;
	  }
	}
  }

  draw() {
	this.drawPlayer(this.player1);
	this.drawPlayer(this.player2);
	this.drawPlayerHorizontally(this.player3);
	this.drawPlayerHorizontally(this.player4);
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
	this.context.fillText(this.player1.getScore(), 10, this.boardHeight / 2);

	this.context.fillStyle = "black";
	this.context.fillText(this.player2.getScore(), this.boardWidth - 20, this.boardHeight / 2);

	this.context.fillStyle = "black";
	this.context.fillText(this.player3.getScore(), this.boardWidth / 2, 20);

	this.context.fillStyle = "black";
	this.context.fillText(this.player4.getScore(), this.boardWidth / 2, this.boardHeight - 20);
  }

  gameOver() {
	return new Promise((resolve) => {
	  const checkGameOver = () => {
		if (this.player1.getScore() === 3 || this.player2.getScore() === 3 || this.player3.getScore() === 3 || this.player4.getScore() === 3) {
		  let winner;

		  if (this.player1.getScore() === 3) {
			winner = this.player1;
		  }
		  else if (this.player2.getScore() === 3) {
			winner = this.player2;
		  }
		  else if (this.player3.getScore() === 3) {
			winner = this.player3;
		  }
		  else if (this.player4.getScore() === 3) {
			winner = this.player4;
		  }

		  if (winner.getHasWon() === false) {
			winner.setWins(winner.getWins() + 1);
			winner.setHasWon(true);
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
	// reset the position, velocity and color of the ball
	this.setBall();
	// reset the last player who touched the ball
	this.lastPlayerTouched = null;
  }

  update() {
	this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);
	this.movePlayer();
	this.moveBall();
	this.draw();
	let winner = this.gameOver();
	winner.then((winner) => {
	  if (winner) {
		let winnerText = winner.getName() + " won !!";
		this.context.fillStyle = winner.color;
		this.context.font = "50px sans-serif";
		const textWidth = this.context.measureText(winnerText).width;
		const textX = this.boardWidth / 2 - textWidth / 2;
		const textY = this.boardHeight / 2 + 15;
		this.context.fillText(winnerText, textX, textY);
		this.ball.velocityX = 0;
		this.ball.velocityY = 0;
	  }
	  else {
		requestAnimationFrame(this.update.bind(this));
	  }
	});
	requestAnimationFrame(this.update.bind(this));
  }
}

var game;

function start4PlayerGame() {
  if (!game) {
	game = new PongGame4Players("Player 1", "Player 2", "Player 3", "Player 4");
	game.init();
  }
}

function reload4PlayerGame() {
  if (game) {
	game.reloadPage();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("fourplayers.html")) {
	const game = new PongGame4Players("Player 1", "Player 2", "Player 3", "Player 4");
	game.init();
  }
});

document.querySelector("#startGame4").addEventListener("click", e => {
	start4PlayerGame();
});

export default {
  PongGame4Players,
  start4PlayerGame,
  reload4PlayerGame,
};
