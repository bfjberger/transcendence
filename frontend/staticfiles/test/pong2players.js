// pong2players.js

import Player from "./Player.js"; // Import the Player class from Player


// Some of the constructor default values are overriden by the different set functions
class PongGame2Players {
    constructor(player1Name, player2Name, canvas) {
        // board
        [this.boardwidth, this.boardHeight] = [700, 500]; // overriden by setBoard
        this.start = false;
        [this.board, this.context] = [canvas, null]; // overriden by setBoard
        this.ratio = 0.625;

        // players
        [this.paddleWidth, this.paddleHeight] = [10, 70]; // overriden by setPlayer
        [this.playerVelocityY, this.paddleSpeed] = [0, 3]; // overriden by movePlayer
        [this.player1, this.player2] = [new Player(player1Name), new Player(player2Name)]
        this.keysPressed = {};

        // ball
        [this.ballRadius, this.ballSpeed] = [10, 2]; // overriden by setBall
        [this.ballSpeedMultiplierX, this.ballSpeedMultiplierY] = [1.1, 1.05]; // overriden by checkCollisions
        this.ball = {};
    }

    init() {
        this.setBoard();

        // ask to press a key
        this.context.font = "15px sans-serif";
        this.context.fillText("Press space to start / Press escape to reload", this.board.width / 2 - 130, this.board.height / 2 + 15);

        // this.ballStartVelocity();

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
        // this.board = document.getElementById("board");
        this.context = this.board.getContext("2d"); //used for drawing on the board
        this.board.height = window.innerHeight * this.ratio;
        this.board.width = window.innerWidth * this.ratio;
        this.boardHeight = this.board.height;
        this.boardWidth = this.board.width;

        this.setPlayer();
        this.setBall();
    }

    setPlayer() {
		this.player1.setCoords(10, this.boardHeight / 2);
		this.player2.setCoords(this.boardWidth - this.player2.width - 10, this.boardHeight / 2);
        this.paddleSpeed = this.boardHeight / 100;
		this.player1.speed = this.paddleSpeed;
		this.player2.speed = this.paddleSpeed;
		this.player1.width = this.paddleWidth;
		this.player1.height = this.paddleHeight;
        this.player1.velocityY = 0;
        this.player2.velocityY = 0;
    }

    setBall() {
        this.ball.x = this.boardWidth / 2;
        // this.ball.y = this.boardHeight / 2;
        this.ball.y = 100 + Math.random() * (this.boardHeight - 200);
        this.ball.radius = this.ballRadius;
        this.ball.velocityX = (Math.random() < 0.5 ? 1 : -1) * (0.75 + Math.random() * 0.25) * this.ballSpeed;
        this.ball.velocityY = (Math.random() < 0.5 ? 1 : -1) * (0.75 + Math.random() * 0.25) * (this.ballSpeed/2);  
        this.ballSpeed = this.boardWidth / 350;
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
        if (e.key === " " && !this.start) {
            // ' ' is the key for space
            this.start = true;
            requestAnimationFrame(this.update.bind(this));
        }
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
        if (this.keysPressed["w"]) {
            this.player1.velocityY = -this.paddleSpeed;
        } else if (this.keysPressed["s"]) {
            this.player1.velocityY = this.paddleSpeed;
        } else {
            this.player1.velocityY = 0;
        }
        if (this.keysPressed["ArrowUp"]) {
            this.player2.velocityY = -this.paddleSpeed;
        } else if (this.keysPressed["ArrowDown"]) {
            this.player2.velocityY = this.paddleSpeed;
        } else {
            this.player2.velocityY = 0;
        }
        if (!this.outOfBounds(this.player1.coords.y + this.player1.velocityY)) {
            this.player1.coords.y += this.player1.velocityY;
        }
        if (!this.outOfBounds(this.player2.coords.y + this.player2.velocityY)) {
            this.player2.coords.y += this.player2.velocityY;
        }
    }

    moveBall() {
        this.ball.x += this.ball.velocityX * this.ballSpeed;
        this.ball.y += this.ball.velocityY * this.ballSpeed;
        this.checkCollisions();
        if (this.ball.x - this.ball.radius < 0) {
            this.player2.setScore(this.player2.getScore() + 1);
            this.resetGame(1);
        }
        if (this.ball.x + this.ball.radius > this.boardWidth) {
            this.player1.setScore(this.player1.getScore() + 1);
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
            if (this.ball.x - this.ball.radius < this.player1.coords.x + this.paddleWidth && this.ball.y > this.player1.coords.y && this.ball.y < this.player1.coords.y + this.paddleHeight) {
                this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
                this.ball.velocityY *= this.ballSpeedMultiplierY;
            }
        } else if (this.ball.velocityX > 0) {
            if (this.ball.x + this.ball.radius > this.player2.coords.x && this.ball.y > this.player2.coords.y && this.ball.y < this.player2.coords.y + this.paddleHeight) {
                this.ball.velocityX *= -1 * this.ballSpeedMultiplierX; // reverse ball direction
                this.ball.velocityY *= this.ballSpeedMultiplierY;
            }
        }
    }

    draw() {
        this.drawPlayer(this.player1.coords.x, this.player1.coords.y, "blue");
        this.drawPlayer(this.player2.coords.x, this.player2.coords.y, "red");
        this.drawBall("white");
        this.drawScoreAndLine();
    }

    drawPlayer(x, y, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, this.paddleWidth, this.paddleHeight);
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
					}
                    resolve(winner);
                } else {
                    setTimeout(checkGameOver, 1000); // Check every second
                }
            };
            checkGameOver();
        });
    }

    outOfBounds(yPosition) {
        return yPosition < 0 || yPosition > this.boardHeight - this.paddleHeight;
    }

    resetGame(direction) {
        this.ball = {
            x: this.boardWidth / 2,
            y: this.boardHeight / 2,
            radius: this.ballRadius,
            velocityX: direction,
            velocityY: 2,
        };
    }

    update() {
        this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);
        this.movePlayer();
        this.moveBall();
        this.draw();
        let winner = this.gameOver();
        winner.then((winner) => {
            if (winner) {
                this.context.fillStyle = "white";
                this.context.fillText(winner.getName() + " won!!", this.boardWidth / 2 - 130, this.boardHeight / 2 + 15);
                this.ball.velocityX = 0;
                this.ball.velocityY = 0;
            } else {
                requestAnimationFrame(this.update.bind(this));
            }
        });

        requestAnimationFrame(this.update.bind(this));
    }
}

var game;

function start2PlayerGame() {
    if (!game) {
        let canvas = document.getElementById("board");
        game = new PongGame2Players("Player 1", "Player 2", canvas);
        game.init();
        document.getElementById("controls").textContent = "Left Player: W/S || Right Player: UpArrow/DownArrow";
    }
}

function reload2PlayerGame() {
    if (game) {
        game.reloadPage();
    }
}

export default {
    PongGame2Players,
    start2PlayerGame,
    reload2PlayerGame,
};
