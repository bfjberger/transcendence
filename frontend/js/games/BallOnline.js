import * as constants from './Constants.js';

export class Ball {
	constructor(game_mode) {
		this.speed = constants.BALL_SPEED
		this.x_vel = 0;
		this.y_vel = 0;
		this.color = "white";
		this.x = constants.WIN_WIDTH / 2;
		if (game_mode == 2)
			this.y = constants.WIN_HEIGHT / 2;
		else
			this.y = constants.FOUR_WIN_HEIGHT / 2;
		this.radius = constants.BALL_RADIUS;
		this.stop_flag = false;
	}

	setcolor(color) {
		this.color = color;
	}

	stop() {
		this.x_vel = 0;
		this.y_vel = 0;
		this.stop_flag = true;
	}

	get_update(x, y, x_vel, y_vel, color) {
		this.x = x;
		this.y = y;
		this.x_vel = x_vel;
		this.y_vel = y_vel;
		this.color = color;
	}
}