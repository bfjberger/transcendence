export default function renderTwoOnline() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Pong mode 2 Joueurs en Ligne</h1>
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2">
				<p id="template_text" class="text-center h4 my-2">Template text for later on</p>
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col text-end text-warning align-self-center h3" id="online__two--domicile">

			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<div id="button_container" class="position-absolute">
					<button class="btn btn-primary" type="button" id="startGame2Online">Chercher une partie</button>
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_two" width="650" height="480"></canvas>
				</div>
			</div>
			<div class="col text-start align-self-center text-primary h3">
				<p id="two__online--adversary"></p>
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center mt-3 h4">
				<p>Joue avec les touches W/S</p>
			</div>
			<div class="col-5"></div>
		</div>

	`;
};