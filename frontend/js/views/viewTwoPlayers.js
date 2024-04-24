export default function renderTwoPlayers() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Pong mode 2 Joueurs</h1>
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2">
				<p id="template_text" class="text-center h4 my-2"></p>
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col text-end text-warning align-self-center h3">
				<p>Joueur Gauche: W/S</p>
			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<div class="position-absolute">
					<button class="btn btn-primary" type="button" id="startGame2">Commencer la partie</button>
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_two" width="650" height="480"></canvas>
				</div>
			</div>
			<div class="col text-start align-self-center text-primary h3">
				<p>Joueur Droit: Flèche Haut/Flèche Bas</p>
			</div>
		</div>

	`;
};
