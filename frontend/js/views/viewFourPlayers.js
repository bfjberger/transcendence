export default function renderFourPlayers() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Pong mode 4 Joueurs</h1>
			</div>
			<p id="template_text" class="text-center h2 my-2"></p>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center h3 my-2" style="color: violet">
				<p class="my-0">Joueur Invité Haut: N/M</p>
				<p id="four__local--top--score" class="my-0"></p>
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col-4 text-end align-self-center h3" style="color: blue">
				<p id="four__local--left--name" class="my-1"></p>
				<p id="four__local--left--score" class="my-0"></p>
			</div>
			<div class="col-4 d-flex justify-content-center align-items-center">
				<div class="position-absolute">
					<button class="btn btn-danger" type="button" id="startGame4">Commencer une partie</button>
				</div>
				<div id="canvas--text" class="position-absolute h2">
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_four" width="650" height="650"></canvas>
				</div>
			</div>
			<div class="col-4 text-start align-self-center h3" style="color: orange">
				<p class="my-1">Joueur Invité Droit: 9/6</p>
				<p id="four__local--right--score" class="my-0"></p>
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center mt-3 h3" style="color: red">
				<p id="four__local--bottom--score" class="my-0"></p>
				<p>Joueur Invité Bas: Flèche Gauche/Flèche Droite</p>
			</div>
			<div class="col-5"></div>
		</div>

	`;
};
