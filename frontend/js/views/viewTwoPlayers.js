export default function renderTwoPlayers() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Pong 1v1 Local</h1>
			</div>
		</div>
		<div class="row">
			<div class="col-4"></div>
			<div class="col-4">
				<p id="template_text" class="text-center h2 my-2"></p>
			</div>
			<div class="col-4"></div>
		</div>
		<div class="row">
			<div id="two__local--left" class="col text-end align-self-center h3" style="color: blue">
				Joueur Gauche: W/S
			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<div class="position-absolute">
					<button type="button" id="startGame2" class="btn btn-danger">Commencer une partie</button>
				</div>
				<div id="canvas--text" class="position-absolute h2">
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_two" width="650" height="480"></canvas>
				</div>
			</div>
			<div class="col text-start align-self-center h3" style="color: orange">
				Joueur Invité: O/L
			</div>
		</div>

	`;
};
