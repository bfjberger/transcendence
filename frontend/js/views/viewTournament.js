function renderTournament() {

	return `

		<div class="row">
			<div class="col text-center pt-3 mb-0 h1">
				<p class="my-0">Tournoi</p>
			</div>
		</div>
		<div id="tournament__players--main" class="row">
			<div class="col text-center pt-3 h3">
				<p>Entrez les noms des joueurs</p>
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
				<button id="startTournament" class="btn btn-info">Démarrer le tournoi local</button>
			</div>
			<div class="d-flex justify-content-center pt-2">
				<button id="DEBUGstartTournament" class="btn btn-info">DEBUG TOURNOI RAPIDE</button>
			</div>
		</div>
		<div id="title" class="row">
			<div id="next_match" class="col-5 d-flex justify-content-left"></div>
			<div id="current_match" class="col-2 d-flex justify-content-center"></div>
			<div class="col-5"></div>
		</div>
		<div class="row">
			<div class="col"></div>
			<div class="col d-flex justify-content-center align-items-center">
				<div class="position-absolute d-none">
					<button type="button" id="startGame2" class="btn btn-primary">Start the game</button>
				</div>
				<div class="text-bg-success border border-black border-5 d-none">
					<canvas id="board_two" width="650" height="480"></canvas>
				</div>
			</div>
			<div class="col"></div>
		</div>
		<div id="bracketContainer" class="row"></div>

	`;
};

export function renderTournamentOnline() {
	return `
		<div id="create-tournament-form">
		<label for="name">Tournament Name:</label>
		<input type="text" id="name" name="name" required><br>

		<input type="radio" id="public" name="visibility" value="public" checked>
		<label for="public">Public</label><br>

		<input type="radio" id="private" name="visibility" value="private">
		<label for="private">Private</label><br>

		<input type="password" id="password" name="password" placeholder="Password (if private)"><br>

		<button id="create-tournament-button">Create Tournament</button>
	</div>

	<div id="tournament-list">
		<!-- List of tournaments will be displayed here -->
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
	renderTournament,
	renderTournamentOnline,
	// Components
	renderTournamentRoom,
	renderTournamentLobby
}