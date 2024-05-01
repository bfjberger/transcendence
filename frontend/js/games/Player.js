// Class for player object

export let default_paddle_width = 10;
export let default_paddle_height = 70;
let default_paddle_speed = 3;

class Player {
	constructor(name, color, pos) {
		this.name = name;
		this.score = 0;
		this.pos = ""; // 'left' or 'right'
		this.hasWon = false;
		this.wins = 0;
		if (!pos) {
			this.width = default_paddle_width;
			this.height = default_paddle_height;
		}
		else {
			this.width = default_paddle_height;
			this.height = default_paddle_width;
		}
		this.speed = default_paddle_speed;
		this.coords = { x: 0, y: 0 };
		this.color = color;
	}

	getScore() {
		return this.score;
	}

	getName() {
		return this.name;
	}

	getPos() {
		return this.pos;
	}

	getHasWon() {
		return this.hasWon;
	}

	getWins() {
		return this.wins;
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}

	getSpeed() {
		return this.speed;
	}

	getCoords() {
		return this.coords;
	}

	getColor() {
		return this.color;
	}

	setName(name) {
		this.name = name;
	}

	setScore(score) {
		this.score = score;
	}

	// updateScore(pts) {
	// 	this.score += pts;
	// }

	setPos(pos) {
		this.pos = pos;
	}

	setHasWon(hasWon) {
		this.hasWon = hasWon;
	}

	setWins(wins) {
		this.wins = wins;
	}

	setPaddle(width, height) {
		this.width = width;
		this.height = height;
	}

	setCoords(x, y) {
		this.coords.x = x;
		this.coords.y = y;
	}

	setSpeed(speed) {
		this.speed = speed;
	}
}

export default Player;
