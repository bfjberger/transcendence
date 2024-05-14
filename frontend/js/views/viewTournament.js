export function renderTournamentOnline() {
	return `
		<div class="row py-3 border-bottom">
			<div id="create-tournament-form" class="col-6 border-end">
				<div class="col text-center pt-3 h2">
					<p class="mb-1">Créer un Tournoi</p>
				</div>
				<div class="text-center pt-1">
					<label for="name">Nom du tournoi:</label>
					<input type="text" id="name" name="name" class="w-auto" required>
				</div>
				<div class="text-center pt-3">
					<button id="create-tournament-button" class="btn btn-info">Créer un tournoi en ligne</button>
				</div>
			</div>
			<div class="col-6">
				<div class="col text-center pt-3 h2">
					<p class="mb-1">Rejoindre un tournoi existant</p>
				</div>
				<div id="tournament-list" class="pt-2">
				</div>
			</div>
		</div>
	`;
}

export function renderTournamentRoom() {
	return `
			<div id="tournament-room">
				<h1 id="tournament-name"></h1>
			</div>

			<br>
			<div id="infoElement"></div>
			<div id="playerField"></div>
			<div class="row">
				<div class="col d-flex justify-content-center align-items-center">
					<div class="text-bg-success border border-black border-5">
						<canvas id="board_two" width="650" height="480"></canvas>
					</div>
				</div>
			</div>
		`
}

function renderTournamentBracketsFour() {
	return `
			<div class="row">
				<div class="col d-flex justify-content-center align-items-center">
					<ul class="list-group font-monospace border rounded border-0" id="demi__brackets">
						<li id="demi__seed1--1--main" class="list-group-item border rounded PlayerBracket__1">
							<span id="demi__seed1--1--name">Demi-Finaliste 1 seed 1</span>
							<span>&nbsp;</span>
							<span id="demi__seed1--1--score">0</span>
						</li>
						<li id="demi__seed1--2--main" class="list-group-item border rounded PlayerBracket__2">
							<span id="demi__seed1--2--name">Demi-Finaliste 2 seed 1</span>
							<span>&nbsp;</span>
							<span id="demi__seed1--2--score">0</span>
						</li>
						<li class="list-group-item border-0 BracketSpacer"></li>
						<li id="demi__seed2--1--main" class="list-group-item border rounded PlayerBracket__3">
							<span id="demi__seed2--1--name">Demi-Finaliste 1 seed 2</span>
							<span>&nbsp;</span>
							<span id="demi__seed2--1--score">0</span>
						</li>
						<li id="demi__seed2--2--main" class="list-group-item border rounded PlayerBracket__4">
							<span id="demi__seed2--2--name">Demi-Finaliste 2 seed 2</span>
							<span>&nbsp;</span>
							<span id="demi__seed2--2--score">0</span>
						</li>
					</ul>
				</div>
				<div class="col d-flex justify-content-center align-items-center">
					<ul class="list-group font-monospace border rounded border-0" id="final__brackets">
						<li id="final__1--main" class="list-group-item border rounded PlayerBracket__1">
							<span id="final__1--name">Finaliste 1</span>
							<span>&nbsp;</span>
							<span id="final__1--score">0</span>
						</li>
						<li id="final__2--main" class="list-group-item border rounded PlayerBracket__2">
							<span id="final__2--name">Finaliste 2</span>
							<span>&nbsp;</span>
							<span id="final__2--score">0</span>
						</li>
					</ul>
				</div>
				<div class="col d-flex justify-content-center align-items-center">
					<ul class="list-group font-monospace border rounded border-0" id="winner__main">
						<li class="list-group-item border rounded PlayerBracket__1 bg-warning-subtle">
							<span id="winner__name">Vainqueur</span>
							<span>&nbsp;</span>
							<img src="/frontend/img/trophy-fill-Bootstrap.svg" alt="trophy" width="15" height="15" class="">
						</li>
					</ul>
				</div>
			</div>
		`;
}

/* ------------------------------- Components ------------------------------- */

export function renderTournamentLobby() {
	return `
		<div>
			TOURNAMENT LOBBY
			<div id='lobby-container'/>
		</div>
	`
}

export function renderPlayground() {
	return `
		<div id="playground">
			<h1>Tournament</h1>
			test
		</div>
	`
}

export default {
	renderTournamentOnline,
	// Components
	renderTournamentRoom,
	renderTournamentLobby
}