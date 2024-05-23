import router from "../logic/router.js";
import Player from "./Player.js";
import { PongGame2Players } from "./pong2players.js";
import {
	renderTournamentBracketsEight,
	renderTournamentRoom,
	renderTournamentBracketsFour,
	renderTournamentCreationFour,
	renderTournamentCreationEight
	} from "../views/viewTournamentLocal.js";

import { updateStatus } from "../logic/utils.js";

class Tournament {
	constructor(nb_players) {
		this.nb_players = nb_players;
		this.match_played = 0;
		this.players = [];
		this.matches = [];
		this.quarters = [];
		this.demi = [];
		this.final = null;
		this.template_text;
	}

	duplicateNickname() {
		for (let i = 0; i < this.players.length; i++) {
			let tmp = this.players[i].name;
			for (let j = 0; j < this.players.length; j++) {
				if (j == i)
					continue;
				if (tmp == this.players[j].name)
					return 0;
			}
		}
		return 1;
	}

	createPlayers() {
		for (let i = 1; i <= this.nb_players; i++) {
			let playerName = document.getElementById(`tournament__player--${i}`).value;
			if (playerName) {
				let player = new Player(playerName, "white", false);
				this.players.push(player);
			}
		}
		if (this.players.length !== this.nb_players) {
			this.players = [];
			return ("Veuillez entrer les noms de " + this.nb_players + " joueurs.");
		}
		if (!this.duplicateNickname()) {
			this.players = [];
			return ("Des nicknames de joueurs sont similaires.");
		}
		return null;
	}

	startTournament() {
		this.template_text = document.getElementById("template__text");

		this.randomizePlayers();

		if (this.nb_players == 8) {
			this.quarters = this.createMatchs(this.players);

			this.addNameQuarterBrackets();
		}
		else if (this.nb_players == 4) {
			this.demi = this.createMatchs(this.players);

			this.addNameDemiBrackets();
		}

		this.organizeMatches();
	}

	randomizePlayers() {
		for (let i = this.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.players[i], this.players[j]] = [this.players[j], this.players[i]];
		}
	}

	async organizeMatches() {
		var current_match = this.getCurrentMatch(this.match_played);

		this.template_text.textContent = current_match.topTeam + " vs " + current_match.bottomTeam;
		this.showNextMatch();

		await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for 5 sec

		await this.gameLauncher(current_match);
	}

	showNextMatch() {
		var template = document.getElementById("template__text--next");
		if (this.nb_players == 8 && this.match_played <= 5 || this.nb_players == 4 && this.match_played < 2) {
			var next_match = this.getCurrentMatch(this.match_played + 1);

			if (next_match.bottomTeam != null)
				template.textContent = "Le prochain match sera " + next_match.topTeam + " vs " + next_match.bottomTeam;
			else
				template.textContent = "Le prochain match sera " + next_match.topTeam + " vs le vainqueur du match actuel";
		}
		else if (this.nb_players == 8 && this.match_played == 6 || this.nb_players == 4 && this.match_played == 2) {
			template.textContent = "La finale sera " + this.getCurrentMatch(this.match_played).topTeam + " vs " + this.getCurrentMatch(this.match_played).bottomTeam;
		}
	}

	createMatchs(players) {
		var matchs = [];
		var match;

		for (let i = 0; i < players.length; i += 2) {
			match = {
				topTeam: players[i].name,
				bottomTeam: players[i + 1].name,
				topScore: "",
				bottomScore: "",
				winner: ""
			};
			matchs.push(match);
		}
		return matchs;
	}

	createMatchWithWinner(winner_name) {
		var match = {
			topTeam: winner_name,
			bottomTeam: null,
			topScore: "",
			bottomScore: "",
			winner: ""
		};
		return match;
	}

	updateRoundsGameEnd(winner) {
		if (this.nb_players == 8 && this.match_played <= 4) {
			this.updateQuarterBrackets();

			if (!this.demi[0]) {
				// The match for the first demi is not yet created

				this.demi[0] = this.createMatchWithWinner(winner.name);
				this.addNameDemiBrackets();
				this.updateDemiBrackets();
			}
			else if (this.demi[0].topTeam && this.demi[0].bottomTeam == null) {
				// The match for the first demi was created with his top player assigned and the bottom player not yet added

				this.demi[0].bottomTeam = winner.name;
				this.addNameDemiBrackets();
				this.updateDemiBrackets();
			}
			else if (!this.demi[1]) {
				// The match for the second demi is not yet created

				this.demi[1] = this.createMatchWithWinner(winner.name);
				this.addNameDemiBrackets();
				this.updateDemiBrackets();
			}
			else if (this.demi[1].topTeam && this.demi[1].bottomTeam == null) {
				// The match for the second demi was created with his top player assigned and the bottom player not yet added

				this.demi[1].bottomTeam = winner.name;
				this.addNameDemiBrackets();
				this.updateDemiBrackets();
			}
		}
		else if (this.nb_players == 8 && this.match_played <= 6 || this.nb_players == 4 && this.match_played <= 2) {
			this.updateDemiBrackets();

			if (!this.final) {
				// The match for the final is not yet created

				this.final = this.createMatchWithWinner(winner.name);
				this.addNameFinalBrackets();
			}
			else if (this.final.topTeam && this.final.bottomTeam == null) {
				// The match for the final was created with his top player assigned and the bottom player not yet added

				this.final.bottomTeam = winner.name;
				this.addNameFinalBrackets();
			}
		}
		else if (this.nb_players == 8 && this.match_played == 7 || this.nb_players == 4 && this.match_played == 3) {
			this.updateFinalBracket();
			// this.countdown();
		}
	}

	async gameLauncher(current_match) {

		var winner = await this.startGame(current_match);

		this.updateRoundsGameEnd(winner);

		if (this.nb_players == 8) {
			if (this.match_played < 7) {
				this.template_text.textContent = winner.name + " a gagné cette partie";

				await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for 5 sec

				this.organizeMatches();
			}
			else {
				let winner_name = this.final.winner == "top" ? this.final.topTeam : this.final.bottomTeam;
				this.template_text.textContent = winner_name + " a gagné le tournoi.";
			}
		}
		else if (this.nb_players == 4) {
			if (this.match_played < 3) {
				this.template_text.textContent = winner.name + " a gagné cette partie";

				await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for 5 sec

				this.organizeMatches();
			}
			else {
				let winner_name = this.final.winner == "top" ? this.final.topTeam : this.final.bottomTeam;
				this.template_text.textContent = winner_name + " a gagné le tournoi";
			}
		}
	}

	async startGame(current_match) {
		document.getElementById("tournament__left").textContent = current_match.topTeam + ": W/S";
		document.getElementById("tournament__right").textContent = current_match.bottomTeam + ": O/L";

		this.match_played += 1;

		var game;
		game = new PongGame2Players(current_match.topTeam, current_match.bottomTeam);
		game.init();

		let winner = await game.gameOver();
		current_match.topScore = game.player_left.score;
		current_match.bottomScore = game.player_right.score;
		current_match.winner = winner.name == current_match.topTeam ? "top" : "bottom";

		game.context.clearRect(0, 0, game.boardWidth, game.boardHeight);
		document.getElementById("tournament__left").textContent = "";
		document.getElementById("tournament__right").textContent = "";

		return winner;
	}

	getCurrentMatch(match_played) {
		if (this.nb_players == 8) {
			if (match_played == 0) // quarter seed 1
				return this.quarters[0];
			else if (match_played == 1) // quarter seed 2
				return this.quarters[1];
			else if (match_played == 2) // quarter seed 3
				return this.quarters[2];
			else if (match_played == 3) // quarter seed 4
				return this.quarters[3];
			else if (match_played == 4) // demi seed 1
				return this.demi[0];
			else if (match_played == 5) // demi seed 2
				return this.demi[1];
			else if (match_played == 6) // final
				return this.final;
		}
		else if (this.nb_players == 4) {
			if (match_played == 0) // demi seed 1
				return this.demi[0];
			else if (match_played == 1) // demi seed 2
				return this.demi[1];
			else if (match_played == 2) // final
				return this.final;
		}
	}

	addNameQuarterBrackets() {
		document.getElementById("quarter__seed1--1--name").textContent = this.quarters[0].topTeam;
		document.getElementById("quarter__seed1--2--name").textContent = this.quarters[0].bottomTeam;
		document.getElementById("quarter__seed2--1--name").textContent = this.quarters[1].topTeam;
		document.getElementById("quarter__seed2--2--name").textContent = this.quarters[1].bottomTeam;
		document.getElementById("quarter__seed3--1--name").textContent = this.quarters[2].topTeam;
		document.getElementById("quarter__seed3--2--name").textContent = this.quarters[2].bottomTeam;
		document.getElementById("quarter__seed4--1--name").textContent = this.quarters[3].topTeam;
		document.getElementById("quarter__seed4--2--name").textContent = this.quarters[3].bottomTeam;
	}

	addNameDemiBrackets() {
		if (this.demi[0].topTeam != null)
			document.getElementById("demi__seed1--1--name").textContent = this.demi[0].topTeam;
		if (this.demi[0].bottomTeam != null)
			document.getElementById("demi__seed1--2--name").textContent = this.demi[0].bottomTeam;
		if (this.demi[1]) {
			if (this.demi[1].topTeam != null)
				document.getElementById("demi__seed2--1--name").textContent = this.demi[1].topTeam;
			if (this.demi[1].bottomTeam != null)
				document.getElementById("demi__seed2--2--name").textContent = this.demi[1].bottomTeam;
		}
	}

	addNameFinalBrackets() {
		if (this.final.topTeam != null)
			document.getElementById("final__1--name").textContent = this.final.topTeam;
		if (this.final.bottomTeam != null)
			document.getElementById("final__2--name").textContent = this.final.bottomTeam;
	}

	updateQuarterBrackets() {
		for (let [match_index, match] of this.quarters.entries()) {
			match_index += 1; // increment the index to match it with the seed
			if (match.winner == "top") {
				document.getElementById(`quarter__seed${match_index}--1--main`).classList.add("bg-success-subtle");
				document.getElementById(`quarter__seed${match_index}--2--main`).classList.add("bg-danger-subtle");
			}
			if (match.winner == "bottom") {
				document.getElementById(`quarter__seed${match_index}--1--main`).classList.add("bg-danger-subtle");
				document.getElementById(`quarter__seed${match_index}--2--main`).classList.add("bg-success-subtle");
			}
			if (match.topScore || match.bottomScore) {
				document.getElementById(`quarter__seed${match_index}--1--score`).textContent = match.topScore;
				document.getElementById(`quarter__seed${match_index}--2--score`).textContent = match.bottomScore;
			}
		};
	}

	updateDemiBrackets() {
		for (let [match_index, match] of this.demi.entries()) {
			match_index += 1; // increment the index to match it with the seed
			if (match.winner == "top") {
				document.getElementById(`demi__seed${match_index}--1--main`).classList.add("bg-success-subtle");
				document.getElementById(`demi__seed${match_index}--2--main`).classList.add("bg-danger-subtle");
			}
			if (match.winner == "bottom") {
				document.getElementById(`demi__seed${match_index}--1--main`).classList.add("bg-danger-subtle");
				document.getElementById(`demi__seed${match_index}--2--main`).classList.add("bg-success-subtle");
			}
			if (match.topScore || match.bottomScore) {
				document.getElementById(`demi__seed${match_index}--1--score`).textContent = match.topScore;
				document.getElementById(`demi__seed${match_index}--2--score`).textContent = match.bottomScore;
			}
		};
	}

	updateFinalBracket() {
		if (this.final.winner == "top") {
			document.getElementById("final__1--main").classList.add("bg-success-subtle");
			document.getElementById("final__2--main").classList.add("bg-danger-subtle");
			document.getElementById("winner__name").textContent = this.final.topTeam;
		}
		if (this.final.winner == "bottom") {
			document.getElementById("final__1--main").classList.add("bg-danger-subtle");
			document.getElementById("final__2--main").classList.add("bg-success-subtle");
			document.getElementById("winner__name").textContent = this.final.bottomTeam;
		}
		document.getElementById("final__1--score").textContent = this.final.topScore;
		document.getElementById("final__2--score").textContent = this.final.bottomScore;
	}

	/*
	countdown() {
		let count = 0;
		let interval = setInterval(() => {
			count++;

			document.getElementById("template__text--next").textContent = "Tu reviens à la page de Tournoi dans " + (15 - count);

			if (count == 15) {
				clearInterval(interval);

				router("tournament");
			}
		}, 1000);
	}
	*/
};

/* ---------------------------------- Utils --------------------------------- */

// Function to change the HTML content of an element
function changePageContent(viewFunction, elementId) {

	try {
		document.getElementById(elementId).innerHTML = viewFunction();
		// Need to attach existing event listeners ?
	} catch (error) {
		console.error("Error loading content: ", error);
	}
};

/* --------------------- Listener for navigation event ---------------------- */

async function handlePageReload() {
	if (window.location.pathname == "/tournament/") {
		await updateStatus("ONLINE");
	}
};

window.addEventListener('load', handlePageReload);

function handlePageChange() {
	if (window.location.pathname == "/tournament/") {
		updateStatus("ONLINE");
	}
};

window.addEventListener('popstate', handlePageChange);

/* ---------------------------- Creation Handlers --------------------------- */

function createTournamentFour() {

	document.getElementById("tournament__main").innerHTML = renderTournamentCreationFour();

	// Replace the value of the first field by the nickname of the user
	document.getElementById("tournament__player--1").value = sessionStorage.getItem("nickname");

	document.getElementById("startTournamentFour").addEventListener("click", e => {
		e.preventDefault();

		updateStatus("PLAYING");

		let tournament = new Tournament(4);
		let returnValue = tournament.createPlayers();
		if (returnValue != null) {
			document.getElementById("tournament__four--errorMsg").textContent = returnValue;
			return;
		}

		// Replace the HTML of main__content with the HTML of the room
		changePageContent(renderTournamentRoom, "main__content");
		// Add the HTML of the brackets to one of the element previously added
		changePageContent(renderTournamentBracketsFour, "tournament__room--brackets");

		tournament.startTournament();
	});
};

function createTournamentEight() {

	document.getElementById("tournament__main").innerHTML = renderTournamentCreationEight();

	// Replace the value of the first field by the nickname of the user
	document.getElementById("tournament__player--1").value = sessionStorage.getItem("nickname");

	document.getElementById("startTournamentEight").addEventListener("click", e => {
		e.preventDefault();

		updateStatus("PLAYING");

		let tournament = new Tournament(8);
		let returnValue = tournament.createPlayers();
		if (returnValue != null) {
			document.getElementById("tournament__eight--errorMsg").textContent = returnValue;
			return;
		}

		// Replace the HTML of main__content with the HTML of the room
		changePageContent(renderTournamentRoom, "main__content");
		// Add the HTML of the brackets to one of the element previously added
		changePageContent(renderTournamentBracketsEight, "tournament__room--brackets");

		tournament.startTournament();
	});
};

/* -------------------------- Listener for the page ------------------------- */

function listenerTournament() {

	document.getElementById("tournament__four--create").addEventListener("click", createTournamentFour);
	document.getElementById("tournament__eight--create").addEventListener("click", createTournamentEight);
};

/* --------------------------- Loader for the page -------------------------- */

async function loadTournament() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/tournament/', init);

		if (response.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}

		return 1;
	} catch (e) {
		console.error("loadTournament: " + e);
		return 0;
	}
};

export default {
	listenerTournament,
	loadTournament
};
