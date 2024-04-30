export default function renderFourOnline() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Pong mode 4 Joueurs en Ligne</h1>
			</div>
			<p id="template_text" class="text-center h4 my-2">Template text for later on</p>
			<p id="instructions" class="text-center h4 my-2"></p>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center h4 mt-2" id="four__online--topPlayer" style="color: black">
				Joueur Haut
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col-4 text-end align-self-center h4" id="four__online--leftPlayer" style="color: black">
				Joueur Gauche
			</div>
			<div class="col-4 d-flex justify-content-center align-items-center">
				<div id="button_container" class="position-absolute">
					<button class="btn btn-danger" type="button" id="startGame4Online">Chercher une partie</button>
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_four" width="650" height="650"></canvas>
				</div>
			</div>
			<div class="col-4 text-start align-self-center h4" id="four__online--rightPlayer" style="color: black">
				Joueur Droit
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center mt-3 h4" id="four__online--bottomPlayer" style="color: black">
				Joueur Bas
			</div>
			<div class="col-5"></div>
		</div>

	`;
};