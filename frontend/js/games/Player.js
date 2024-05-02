// Class for player object

export let default_paddle_width = 10;
export let default_paddle_height = 70;
let default_paddle_speed = 3;

class Player {
	constructor(name, color, side) {
		this.name = name;
		this.score = 0;
		if (!side) { // for players left and right
			this.width = default_paddle_width;
			this.height = default_paddle_height;
		}
		else { // for players top and bottom
			this.width = default_paddle_height;
			this.height = default_paddle_width;
		}
		this.speed = default_paddle_speed;
		this.coords = { x: 0, y: 0 };
		this.color = color;
	}

	setCoords(x, y) {
		this.coords.x = x;
		this.coords.y = y;
	}
}

export default Player;
