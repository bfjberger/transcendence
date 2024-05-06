export default function renderGameHistory() {

	return `
		<div class="text-center row mt-4 border-bottom border-warning game__historyTwo--holder">
			<h1>Historique des parties 1 v 1 jouée(s) : </h1>
			<div id="game__historyTwo--main" class="row mx-0">
			</div>
		</div>
		<br>
		<hr>
		<br>
		<div class="text-center row border-bottom border-primary game__historyFour--holder">
			<h1>Historique des parties Multi-Joueurs à 4 jouée(s) : </h1>
			<div id="game__historyFour--main" class="row mx-0">
			</div>
		</div>
	`;
};