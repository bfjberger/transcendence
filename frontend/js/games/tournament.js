import bracketGraph from "./bracket.js";
import Player from "./Player.js";
import { PongGame2Players, updateStatus } from "./pong2players.js";
import { renderTournamentBrackets, renderTournamentRoom } from "../views/viewTournamentLocal.js";

class Tournament {
	/*
	In the table 'rounds', the index 0 correspond to the quarters,
		the index 1 correspond to the demi and the index 2 correspond to the final
	*/
	constructor() {
		this.players = [];
		this.matches = [];
		this.rounds = [];
		this.quarters = [];
		this.demi = [];
		this.final = null;
		this.match_played = 0;
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
		for (let i = 1; i <= 8; i++) {
			let playerName = document.getElementById(`tournament__player--${i}`).value;
			if (playerName) {
				let player = new Player(playerName, "white", false);
				this.players.push(player);
			}
		}
		if (this.players.length !== 8) {
			this.players = [];
			return ("Veuillez entrer les noms de 8 joueurs.");
		}
		if (!this.duplicateNickname()) {
			this.players = [];
			return ("Des nicknames de joueurs sont similaires.");
		}
		return null;
	}

	startTournament() {
		this.template_text = document.getElementById("template_text");

		this.randomizePlayers();
		this.quarters = this.createQuartersMatch(this.players);

		this.addNameQuarterBrackets();

		// this.generateFirstRound(this.players);
		// this.setRoundsNoValue(1);
		// this.setRoundsNoValue(2);
		// document.getElementById("tournament__room--brackets").innerHTML = bracketGraph.generateBracket(this.rounds);
		this.organizeMatches();
	}

	randomizePlayers() {
		for (let i = this.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.players[i], this.players[j]] = [this.players[j], this.players[i]];
		}
	}

	createQuartersMatch(players) {
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

	async organizeMatches() {
		var current_match = this.getCurrentMatch();

		await this.gameLauncher(current_match);

		// while (this.players.length >= 2) {
		// 	let matchPlayers = this.players.splice(0, 2);
		// 	this.matches.push(matchPlayers);
		// }

		// this.updateQuarterBrackets();
		// if (this.players.length == 4)
		// 	this.updateDemiBrackets();
		// if (this.players.length == 2)
		// 	this.updateFinalBracket();

		// await this.displayNextMatch();
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
		if (this.match_played <= 4) {
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
		else if (this.match_played <= 6) {
			this.updateDemiBrackets();

			if (!this.final) {
				// The match for the final is not yet created

				this.final = this.createMatchWithWinner(winner.name);
				this.addNameFinalBrackets();
				this.updateFinalBracket();
			}
			else if (this.final.topTeam && this.final.bottomTeam == null) {
				// The match for the final was created with his top player assigned and the bottom player not yet added

				this.final.bottomTeam = winner.name;
				this.addNameFinalBrackets();
				this.updateFinalBracket();
			}
		}
		else if (this.match_played == 7)
			this.updateFinalBracket();
	}

	async gameLauncher(current_match) {

		var winner = await this.startGame(current_match);

		this.updateRoundsGameEnd(winner);

		if (this.match_played < 7)
			this.organizeMatches();
		else
			this.template_text.textContent = this.final.winner + " a gagné ce tournoi.";
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

		console.log("Match finished. Winner:", winner.name);

		return winner;
	}

	getCurrentMatch() {
		if (this.match_played == 0) // quarter seed 1
			return this.quarters[0];
		else if (this.match_played == 1) // quarter seed 2
			return this.quarters[1];
		else if (this.match_played == 2) // quarter seed 3
			return this.quarters[2];
		else if (this.match_played == 3) // quarter seed 4
			return this.quarters[3];
		else if (this.match_played == 4) // demi seed 1
			return this.demi[0];
		else if (this.match_played == 5) // demi seed 2
			return this.demi[1];
		else if (this.match_played == 6) // final
			return this.final;
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
};

/* ---------------------------------- Utils --------------------------------- */

// Function to change the HTML content of an element
function changePageContent(viewFunction, elementId) {

	try {
		const htmlContent = viewFunction();
		document.getElementById(elementId).innerHTML = htmlContent;
		// Need to attach existing event listeners ?
	} catch (error) {
		console.error("Error loading content: ", error);
	}
};

/* --------------------------- Listener for reload -------------------------- */

function handlePageReload() {
	if (window.location.pathname === "/tournament/") {
		updateStatus();
	}
};

window.addEventListener('beforeunload', handlePageReload);

/* -------------------------- Listener for the page ------------------------- */

function listenerTournament() {

	// Replace the value of the first field by the nickname of the user
	document.getElementById("tournament__player--1").value = sessionStorage.getItem("nickname");

	document.getElementById("startTournament").addEventListener("click", e => {
		e.preventDefault();

		updateStatus();

		let tournament = new Tournament();
		let returnValue = tournament.createPlayers();
		if (returnValue != null) {
			document.getElementById("tournament__player--errorMsg").textContent = returnValue;
			return;
		}

		// Replace the HTML of main__content with the HTML of the room
		changePageContent(renderTournamentRoom, "main__content");
		// Add the HTML of the brackets to one of the element previously added
		changePageContent(renderTournamentBrackets, "tournament__room--brackets");

		tournament.startTournament();
	});
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

		if (response.status === 403) {
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
