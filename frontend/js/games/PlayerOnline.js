import * as constants from './Constants.js';

export class Player {
	constructor(side, width, height, color, game_mode) {
		switch (side) {
			case 1:
				this.x = 10;
				if (game_mode == 2)
					this.y = (constants.WIN_HEIGHT - constants.PADDLE_HEIGHT) / 2;
				else
					this.y = (constants.FOUR_WIN_HEIGHT - constants.PADDLE_HEIGHT) / 2;
				break;
			case 2:
				this.x = constants.WIN_WIDTH - constants.PADDLE_WIDTH - 10;
				if (game_mode == 2)
					this.y = (constants.WIN_HEIGHT - constants.PADDLE_HEIGHT) / 2;
				else
					this.y = (constants.FOUR_WIN_HEIGHT - constants.PADDLE_HEIGHT) / 2;
				break;
			case 3:
				this.x = (constants.WIN_WIDTH - constants.PADDLE_HEIGHT) / 2;
				this.y = 10;
				break;
			case 4:
				this.x = (constants.WIN_WIDTH - constants.PADDLE_HEIGHT) / 2;
				this.y = constants.FOUR_WIN_HEIGHT - constants.PADDLE_WIDTH - 10;
				break;
		}
		this.width = width;
		this.height = height;
		this.color = color;
		this.score = 0;
	}

	/*
	move(up) {
		if (up) {
			if ((this.y + this.height / 2) + constants.PLAYER_SPEED <= constants.WIN_HEIGHT)
				this.y += constants.PLAYER_SPEED;
		}

		else {
			if ((this.y - this.height / 2) - constants.PLAYER_SPEED > 0)
				this.y -= constants.PLAYER_SPEED;
		}
	}

	score_point() {
		if (this.score < constants.WINNING_SCORE)
			this.score += 1;
	}

	setcolor(newcolor) {
		this.color = newcolor;
	}

	to_dict() {
		return {
			x: this.x,
			y: this.y,
			color: this.color
		}
	}
	*/
}