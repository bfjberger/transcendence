export default function renderFourPlayers() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Pong mode 4 Joueurs</h1>
			</div>
			<p id="template_text" class="text-center h4 my-2">Template text for later on</p>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center h3 my-2" style="color: violet">
				<p>Joueur Invité Haut: N/M</p>
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col text-end text-warning align-self-center h3" id="four__local--left">
				<p>Joueur Gauche: Q/A</p>
			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<div class="position-absolute" id="button_container">
					<button class="btn btn-danger" type="button" id="startGame4">Commencer la partie</button>
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_four" width="650" height="650"></canvas>
				</div>
			</div>
			<div class="col text-start text-primary align-self-center h3">
				<p>Joueur Invité Droit: 9/6</p>
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center mt-3 h3" style="color: red">
				<p>Joueur Invité Bas: Flèche Gauche/Flèche Droite</p>
			</div>
			<div class="col-5"></div>
		</div>

	`;
};
