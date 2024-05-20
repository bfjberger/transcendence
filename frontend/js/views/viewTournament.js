export function renderTournamentOnline() {
	return `
		<div class="row py-3 border-bottom">
			<div id="create-tournament-form" class="col-6 border-end">
				<div class="col text-center pt-3 h2">
					<p class="mb-1">Créer un Tournoi</p>
				</div>
				<div id="create__tournament--errorMsg" class="text-center pt-1 h5 text-danger">
				</div>
				<div class="text-center pt-1">
					<label for="name">Nom du tournoi:</label>
					<input type="text" id="name" name="name" class="w-auto" required>
				</div>
				<div class="text-center pt-3">
					<button id="create-tournament-button" class="btn btn-info" type="submit">Créer un tournoi en ligne</button>
				</div>
			</div>
			<div class="col-6">
				<div class="col text-center pt-3 h2">
					<p class="mb-1">Rejoindre un tournoi existant</p>
				</div>
				<div id="tournament__list--errorMsg" class="text-center pt-1 h5 text-danger"></div>
				<div id="tournament-list" class="pt-2 text-primary">
				</div>
			</div>
		</div>
	`;
}

function renderTournamentOnlineLobby() {
	return `
		<div class="row pt-3">
			<div class="col-4"></div>
			<div id="tournament__room--name" class="col-4 text-center h2" style="text-decoration: underline"></div>
			<div class="col-4"></div>
		</div>
		<div id="tournament__room--main" class="row">
			<div id="tournament__room--errorMsg" class="text-center text-danger h4">
			</div>
			<div class="text-center text-warning h4 pb-3 border-info border-bottom">
				Joueurs dans le tournoi: <span id="tournament__room--list--nb" class="text-decoration-underline"></span> sur 4 ou 8
			</div>
			<div id="tournament__room--list">
			</div>
		</div>
		<div id="tournament__room--brackets" class="container py-3">
		</div>
	`;
};

// to be put in tournament__room--main instead of the list of the players once the tournament is started
function renderTournamentOnlineGame() {
	return `
		<div class="row pt-3">
			<div class="col-4"></div>
			<div id="template__text" class="col-4 text-center h2" style="color: red"></div>
			<div id="template__text--next" class="col-4 text-center text-dark h4"></div>
		</div>
		<div class="row">
			<div id="tournament__left" class="col text-end align-self-center h3" style="color: blue">
			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<div id="canvas--text" class="position-absolute h2">
				</div>
				<div class="text-bg-success border border-black border-5">
					<canvas id="board_two" width="650" height="480"></canvas>
				</div>
			</div>
			<div id="tournament__right" class="col text-start align-self-center h3" style="color: orange">
			</div>
		</div>
	`;
};

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

function renderTournamentBracketsEight() {
	return `
		<div class="row">
			<div class="col d-flex justify-content-center align-items-center">
				<ul class="list-group font-monospace border rounded border-0" id="quarter__brackets">
					<li id="quarter__seed1--1--main" class="list-group-item border rounded PlayerBracket__1">
						<span id="quarter__seed1--1--name"></span>
						<span>&nbsp;</span>
						<span id="quarter__seed1--1--score">0</span>
					</li>
					<li id="quarter__seed1--2--main" class="list-group-item border rounded PlayerBracket__2">
						<span id="quarter__seed1--2--name"></span>
						<span>&nbsp;</span>
						<span id="quarter__seed1--2--score">0</span>
					</li>
					<li class="list-group-item border-0 BracketSpacer"></li>
					<li id="quarter__seed2--1--main" class="list-group-item border rounded PlayerBracket__3">
						<span id="quarter__seed2--1--name"></span>
						<span>&nbsp;</span>
						<span id="quarter__seed2--1--score">0</span>
					</li>
					<li id="quarter__seed2--2--main" class="list-group-item border rounded PlayerBracket__4">
						<span id="quarter__seed2--2--name"></span>
						<span>&nbsp;</span>
						<span id="quarter__seed2--2--score">0</span>
					</li>
					<li class="list-group-item border-0 BracketSpacer"></li>
					<li id="quarter__seed3--1--main" class="list-group-item border rounded PlayerBracket__5">
						<span id="quarter__seed3--1--name"></span>
						<span>&nbsp;</span>
						<span id="quarter__seed3--1--score">0</span>
					</li>
					<li id="quarter__seed3--2--main" class="list-group-item border rounded PlayerBracket__6">
						<span id="quarter__seed3--2--name"></span>
						<span>&nbsp;</span>
						<span id="quarter__seed3--2--score">0</span>
					</li>
					<li class="list-group-item border-0 BracketSpacer"></li>
					<li id="quarter__seed4--1--main" class="list-group-item border rounded PlayerBracket__7">
						<span id="quarter__seed4--1--name"></span>
						<span>&nbsp;</span>
						<span id="quarter__seed4--1--score">0</span>
					</li>
					<li id="quarter__seed4--2--main" class="list-group-item border rounded PlayerBracket__8">
						<span id="quarter__seed4--2--name"></span>
						<span>&nbsp;</span>
						<span id="quarter__seed4--2--score">0</span>
					</li>
				</ul>
			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<ul class="list-group font-monospace border rounded border-0" id="demi__brackets">
					<li id="demi__seed1--1--main" class="list-group-item border rounded PlayerBracket__1">
						<span id="demi__seed1--1--name">Demi-Finaliste 1 seed 1</span>
						<span>&nbsp;</span>
						<span id="demi__seed1--1--score"></span>
					</li>
					<li id="demi__seed1--2--main" class="list-group-item border rounded PlayerBracket__2">
						<span id="demi__seed1--2--name">Demi-Finaliste 2 seed 1</span>
						<span>&nbsp;</span>
						<span id="demi__seed1--2--score"></span>
					</li>
					<li class="list-group-item border-0 BracketSpacer"></li>
					<li id="demi__seed2--1--main" class="list-group-item border rounded PlayerBracket__3">
						<span id="demi__seed2--1--name">Demi-Finaliste 1 seed 2</span>
						<span>&nbsp;</span>
						<span id="demi__seed2--1--score"></span>
					</li>
					<li id="demi__seed2--2--main" class="list-group-item border rounded PlayerBracket__4">
						<span id="demi__seed2--2--name">Demi-Finaliste 2 seed 2</span>
						<span>&nbsp;</span>
						<span id="demi__seed2--2--score"></span>
					</li>
				</ul>
			</div>
			<div class="col d-flex justify-content-center align-items-center">
				<ul class="list-group font-monospace border rounded border-0" id="final__brackets">
					<li id="final__1--main" class="list-group-item border rounded PlayerBracket__1">
						<span id="final__1--name">Finaliste 1</span>
						<span>&nbsp;</span>
						<span id="final__1--score"></span>
					</li>
					<li id="final__2--main" class="list-group-item border rounded PlayerBracket__2">
						<span id="final__2--name">Finaliste 2</span>
						<span>&nbsp;</span>
						<span id="final__2--score"></span>
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
};

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

export {
	renderTournamentBracketsEight,
	renderTournamentBracketsFour,
	renderTournamentOnlineLobby,
	renderTournamentOnlineGame
};