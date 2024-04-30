export default function renderFourOnline() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Pong mode 4 Joueurs en Ligne</h1>
			</div>
			<p id="template_text" class="text-center h4 my-2"></p>
			<p id="instructions" class="text-center h4 my-2"></p>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center h3 mt-2" id="four__online--top">
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col-4 text-end text-primary align-self-center h3" id="four__online--left">
			</div>
			<div class="col-4 d-flex justify-content-center align-items-center">
				<div id="button_container" class="position-absolute">
					<button class="btn btn-danger" type="button" id="startGame4Online">Chercher une partie</button>
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_four" width="650" height="650"></canvas>
				</div>
			</div>
			<div class="col-4 text-start text-warning align-self-center h3" id="four__online--right">
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center text-danger mt-3 h3" id="four__online--bottom">
			</div>
			<div class="col-5"></div>
		</div>

	`;
};