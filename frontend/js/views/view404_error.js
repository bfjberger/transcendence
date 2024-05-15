export default function render404_error() {

	return `

		<div class="row">
			<div class="col text-center fw-bold pt-3">
				<h1>Erreur 404</h1>
				<p>La page demandé n'existe pas. Mais bon...</p>
			</div>
			<p id="template_text" class="text-center h2 my-2"></p>
			<p id="instructions" class="text-center h4 my-2"></p>
		</div>

	`;
};