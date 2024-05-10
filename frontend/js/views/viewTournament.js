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
					<input type="radio" id="public" name="visibility" value="public" checked>
					<label for="public">Public</label><br>
					<input type="radio" id="private" name="visibility" value="private">
					<label for="private">Privé</label><br>
					<input type="password" id="password" name="password" placeholder="Mot de passe (si privée)">
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