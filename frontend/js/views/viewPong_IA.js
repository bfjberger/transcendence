export default function renderPong_IA() {
	return `
<div class="row">
	<div class="col text-center fw-bold pt-3">
		<h1>1 Joueur VS IA</h1>
	</div>
	<p id="template_text" class="text-center h2 my-2"></p>
	<p id="instructions" class="text-center h4 my-2"></p>
</div>


<div class="row">

	<div class="col text-end align-self-center h3" id="pong_IA--left">
	</div>

	<div class="col d-flex justify-content-center align-items-center">

		<div class="position-absolute">
			<button class="btn btn-danger" type="button" id="startGame_IA">Commencer la partie</button>
		</div>

		<div class="text-bg-success border border-black border-5">
			<canvas id="board_two" width="650" height="480"></canvas>
		</div>

	</div>

	<div class="col text-start align-self-center h3" id="pong_IA--right">
	</div>

</div>

<div class="row">
	<div class="col-5">
	</div>
	<div class="col-2 text-center mt-3 h4">
		<p>Joue avec les touches W/S</p>
	</div>
	<div class="col-5">
	</div>
</div>
	`;
}