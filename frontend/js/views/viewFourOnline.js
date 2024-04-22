export default function renderFourOnline() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Four Players Pong Game</h1>
			</div>
			<p id="template_text" class="text-center"> Template text for later on</p>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center" style="color: violet">
				<p>Top Player: N/M</p>
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col text-end text-warning align-self-center">
				<p>Left Player: Q/A</p>
			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<div id="button_container" class="position-absolute">
					<button class="btn btn-primary" type="button" id="startGame4Online">Start the game</button>
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_four" width="650" height="480"></canvas>
				</div>
			</div>
			<div class="col text-start text-primary align-self-center">
				<p>Right Player: 9/6</p>
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center mt-3" style="color: red">
				<p>Bottom Player: LeftArrow/RightArrow</p>
			</div>
			<div class="col-5"></div>
		</div>

	`;
};