export default function renderFourOnline() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Pong mode 4 Joueurs en Ligne</h1>
			</div>
			<p id="template_text" class="text-center h2 my-2"></p>
			<p id="instructions" class="text-center h4 my-2"></p>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center h3 mt-2" style="color: violet">
				<p id="four__online--top--name" class="my-0"></p>
				<p id="four__online--top--score" class="my-0"></p>
			</div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col-4 text-end align-self-center h3" style="color: blue">
				<p id="four__online--left--name" class="my-0"></p>
				<p id="four__online--left--score" class="my-1"></p>
			</div>
			<div class="col-4 d-flex justify-content-center align-items-center">
				<div class="position-absolute">
					<button class="btn btn-danger" type="button" id="startGame4Online">Chercher une partie</button>
				</div>
				<div id="canvas--text" class="position-absolute h2">
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_four" width="650" height="650"></canvas>
				</div>
			</div>
			<div class="col-4 text-start align-self-center h3" style="color: orange">
				<p id="four__online--right--name" class="my-1"></p>
				<p id="four__online--right--score" class="my-0"></p>
			</div>
		</div>
		<div class="row">
			<div class="col-5"></div>
			<div class="col-2 text-center mt-3 h3" style="color: red">
				<p id="four__online--bottom--score" class="my-0"></p>
				<p id="four__online--bottom--name"></p>
			</div>
			<div class="col-5"></div>
		</div>

	`;
};