function renderTournament() {

	return `
		<div class="row text-center pt-3">
			<button id="tournament__four--create" class="btn btn-outline-secondary col-2 offset-3">
				Créer un tournoi pour 4 Joueurs
			</button>
			<button id="tournament__eight--create" class="btn btn-outline-secondary offset-2 col-2">
				Créer un tournoi pour 8 Joueurs
			</button>
		</div>
		<div class="row text-center pt-3">
			<div id="tournament__main">
			</div>
		</div>
	`;
};

function renderTournamentCreationFour() {
	return `
		<p class="h2">Tournoi à 4 Joueurs</p>
		<div class="pt-3">
			<p class="h3">Entrez les noms de 4 joueurs</p>
			<p id="tournament__four--errorMsg" class="text-danger h4"></p>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--1" class="form-control w-auto" placeholder="Joueur 1" value="a"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--2" class="form-control w-auto" placeholder="Joueur 2" value="b"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--3" class="form-control w-auto" placeholder="Joueur 3" value="c"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--4" class="form-control w-auto" placeholder="Joueur 4" value="d"/>
		</div>
		<div class="d-flex justify-content-center pt-2">
			<button id="startTournamentFour" class="btn btn-info">Démarrer le tournoi</button>
		</div>
	`;
};

function renderTournamentCreationEight() {
	return `
		<p class="h2">Tournoi à 8 Joueurs</p>
		<div class="pt-3">
			<p class="h3">Entrez les noms de 8 joueurs</p>
			<p id="tournament__eight--errorMsg" class="text-danger h4"></p>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--1" class="form-control w-auto" placeholder="Joueur 1" value="a"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--2" class="form-control w-auto" placeholder="Joueur 2" value="b"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--3" class="form-control w-auto" placeholder="Joueur 3" value="c"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--4" class="form-control w-auto" placeholder="Joueur 4" value="d"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--5" class="form-control w-auto" placeholder="Joueur 5" value="e"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--6" class="form-control w-auto" placeholder="Joueur 6" value="f"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--7" class="form-control w-auto" placeholder="Joueur 7" value="g"/>
		</div>
		<div class="player d-flex justify-content-center pt-1">
			<input type="text" id="tournament__player--8" class="form-control w-auto" placeholder="Joueur 8" value="h"/>
		</div>
		<div class="d-flex justify-content-center pt-2">
			<button id="startTournamentEight" class="btn btn-info">Démarrer le tournoi</button>
		</div>
	`;
};

function renderTournamentRoom() {
	return `
		<div class="row pt-3">
			<div class="col-4"></div>
			<div id="template__text" class="col-4 text-center h2" style="color: red"></div>
			<div id="template__text--next" class="col-3 text-center h4"></div>
			<div class="col-1"></div>
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
		<div id="tournament__room--brackets" class="container">
		</div>
	`;
};

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
};

export default {
	renderTournament,
};

export {
	renderTournamentRoom,
	renderTournamentBracketsEight,
	renderTournamentBracketsFour,
	renderTournamentCreationFour,
	renderTournamentCreationEight
};