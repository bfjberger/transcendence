export default function renderTwoOnline() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Two Players Online Pong Game</h1>
			</div>
			<p id="template_text" class="text-center"> Template text for later on</p>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-white" style="visibility: hidden">
				<p>Top Player: N/M</p>
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col text-end text-warning align-self-center" style="visibility: hidden">
				<p>Left Player: W/S</p>
			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<div id="button_container" class="position-absolute">
					<button class="btn btn-primary" type="button" id="startGame2Online">Look for a game</button>
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_two" width="650" height="480"></canvas>
				</div>
			</div>
			<div class="col text-start align-self-center text-primary" style="visibility: hidden">
				<p>Right Player: UpArrow/DownArrow</p>
			</div>
		</div>

	`;
};