// Class for player object

let default_paddle_width = 10;
let default_paddle_height = 70;
let default_paddle_speed = 3;

class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
        this.pos = ""; // 'left' or 'right'
        this.hasWon = false;
        this.wins = 0;
		this.width = default_paddle_width;
		this.height = default_paddle_height;
		this.speed = default_paddle_speed;
		this.coords = {x: 0, y: 0};
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

	getSpeed() {
		return this.speed;
	}

	getCoords() {
		return this.coords;
	}

    setName(name) {
        this.name = name;
    }

    setScore(score) {
        this.score = score;
    }

	updateScore(pts) {
		this.score += pts;
	}

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