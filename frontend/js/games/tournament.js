// tournament.js

import bracketGraph from "./bracket.js";
import Player from "./Player.js"; // Import the Player class from Player
import pongGame from "./pong2players.js"; // Import the PongGame2Players class from pong2players

class Tournament {
	constructor() {
		this.players = [];
		this.matches = [];
		this.rounds = [];
	}

	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	generatePairings(players) {
		const numPlayers = players.length;
		const pairings = [];

		for (let i = 0; i < numPlayers; i += 2) {
			pairings.push([players[i], players[i + 1]]);
		}

		return pairings;
	}

	generatePairingsForRound(players) {
		const numPlayers = players.length;
		const roundPairings = [];

		// Top team bottom team, top score, bottom score, top winner, bottom winner
		for (let i = 0; i < numPlayers; i += 2) {
			if (players[i] instanceof Player && players[i + 1] instanceof Player)
				roundPairings.push({topTeam: players[i].getName(), bottomTeam: players[i + 1].getName(), topScore: "", bottomScore: "",topWinner: false, bottomWinner: false,});
			else
				roundPairings.push({topTeam: players[i], bottomTeam: players[i + 1], topScore: "", bottomScore: "", topWinner: false,bottomWinner: false,});
		}
		return roundPairings;
	}

	randomizePlayers() {
		for (let i = this.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.players[i], this.players[j]] = [this.players[j], this.players[i]];
		}
		console.log("Players randomized:", this.players);
	}

	generateFirstRound(Players) {
		let rounds = [];

		// for the first round just assign each player to a match
		rounds.push(this.generatePairingsForRound(Players));
		// for the next rounds let undefined
		rounds.push(this.generatePairingsForRound(new Array(Players.length / 2)));
		// populate the previous rounds with undefined
		rounds.push(this.generatePairingsForRound(new Array(Players.length / 4)));
		return rounds;
	}

	populateRoundsWithUndefined(roundsIndex) {
		// Aim is to populate the rounds[roundsIndex] with undefined
		let rounds = this.rounds;
		let numMatches = rounds[roundsIndex].length;
		let undefinedMatches = [];
		for (let i = 0; i < numMatches; i++) {
			undefinedMatches.push({topTeam: "", bottomTeam: "", topScore: "", bottomScore: "", topWinner: false, bottomWinner: false,});
		}
		rounds[roundsIndex] = undefinedMatches;
		this.rounds = rounds;
	}

	updateRounds(winner) {
		// Assuming rounds is an array of round objects
		// console.log('Updating rounds. Winner:', winner);
		for (let i = this.rounds.length - 1; i >= 0; i--) {
			let round = this.rounds[i];
			// if the players in the round have no name, skip it
			if (round[0].topTeam === "" && round[0].bottomTeam === "") {
				continue;
			}
			for (let j = round.length - 1; j >= 0; j--) {
				let match = round[j];
				if (match.topTeam === winner.getName() || match.bottomTeam === winner.getName()) {
					// console.log('Match:', match);
					// match.winner = winner.getName();
					if (match.topTeam === winner.getName()) {
						match.topWinner = true;
						// if the next match is undefined, then the winner of this match will be the top team
						if (i < this.rounds.length - 1) {
							let nextMatchIndex = Math.floor(j / 2);
							if (this.rounds[i + 1][nextMatchIndex].topTeam === "") {
								console.log("Setting top team at rounds[", i + 1, "][", nextMatchIndex, "] to", winner.getName());
								this.rounds[i + 1][nextMatchIndex].topTeam = winner.getName();
							}
							else {
								console.log("Setting bottom team at rounds[", i + 1, "][", nextMatchIndex, "] to", winner.getName());
								this.rounds[i + 1][nextMatchIndex].bottomTeam =
								winner.getName();
							}
						}
					}
					else {
						match.bottomWinner = true;
						if (i < this.rounds.length - 1) {
							let nextMatchIndex = Math.floor(j / 2);
							if (this.rounds[i + 1][nextMatchIndex].topTeam === "") {
								this.rounds[i + 1][nextMatchIndex].topTeam = winner.getName();
								console.log("Setting top team at rounds[", i + 1, "][", nextMatchIndex, "] to", winner.getName());
							}
							else {
								console.log("Setting bottom team at rounds[", i + 1, "][", nextMatchIndex, "] to", winner.getName());
								this.rounds[i + 1][nextMatchIndex].bottomTeam =
								winner.getName();
							}
						}
					}
				// console.log("rounds[", i, "]:", rounds[i] );
				return;
				}
			}
		}
		// console.log('Rounds:', this.rounds);
	}

	duplicateNickname() {
		for (let i = 0; i < this.players.length; i++) {
			let tmp = this.players[i].getName();
			for (let j = 0; j < this.players.length; j++) {
				if (j === i)
					continue;
				if (tmp == "test") // DEBUG
					continue;
				if (tmp === this.players[j].getName())
					return 0;
			}
		}
		return 1;
	}

	startTournament() {
		for (let i = 1; i <= 8; i++) {
			let playerName = document.getElementById("player" + i).value;
			if (playerName) {
				let player = new Player(playerName, "white", 1);
				this.players.push(player);
			}
		}
		if (this.players.length !== 8) {
			alert("Veuillez entrer les noms de 8 joueurs.");
			this.players = [];
			return;
		}
		if (!this.duplicateNickname()) {
			alert("Des nicknames de joueurs sont similaires.");
			this.players = [];
			return;
		}
		document.getElementById("players").style.display = "none";
		this.randomizePlayers();
		this.rounds = this.generateFirstRound(this.players);
		this.populateRoundsWithUndefined(1);
		this.populateRoundsWithUndefined(2);
		document.getElementById("bracketContainer").innerHTML = bracketGraph.generateBracket(this.rounds);
		console.log("Players:", this.players);
		this.organizeMatches();
	}

	organizeMatches() {
		console.log("Organizing matches. Players left:", this.players.length);
		while (this.players.length >= 2) {
			let matchPlayers = this.players.splice(0, 2);
			this.matches.push(matchPlayers);
		}
		this.displayNextMatch();
	}

	async playPong(player1, player2) {
		let winner = null;
		while (!winner) {
			winner = await this.playSingleMatch(player1, player2);
			this.updateRounds(winner);
			let bracketContainer = document.getElementById("bracketContainer");
			bracketContainer.innerHTML = ""; // Clear the current bracket
			bracketContainer.innerHTML = bracketGraph.generateBracket(this.rounds);
			// if (!winner) {
			// 	await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before starting the next match
			// }
		}
		return winner.getName();
	}

	async playSingleMatch(player1, player2) {
		let game;
		if (player1 instanceof Player && player2 instanceof Player)
			game = new pongGame.PongGame2Players(player1.getName(), player2.getName());
		else
			game = new pongGame.PongGame2Players(player1, player2);
		document.querySelector("#startGame2").addEventListener("click", e => {
			e.preventDefault();
			document.querySelector("#startGame2").classList.add("d-none");
			game.init();
		})
		let winner = await game.gameOver();
		console.log("Match finished. Winner:", winner);
		document.querySelector("#startGame2").classList.remove("d-none");
		return winner;
	}

	async displayNextMatch() {
		console.log("Displaying next match. Matches left:", this.matches.length);
		if (this.matches.length === 0) {
			document.getElementById("current_match").innerHTML = "<h2>Le gagnant est " + this.players[0] + "!</h2>";
			document.getElementById("winner_name").innerHTML = this.players[0];
			return;
		}

		let match = this.matches.shift();
		if (match[0] instanceof Player && match[1] instanceof Player){
			// document.getElementById("next_match").innerHTML = "<h3>Prochain match: " + " vs " + "</h3>";
			document.getElementById("current_match").innerHTML = "<h3>Match actuel: " + match[0].getName() + " vs " + match[1].getName() + "</h3>";
		}
		else {
			// document.getElementById("next_match").innerHTML = "<h3>Prochain match: " + " vs " + "</h3>";
			document.getElementById("current_match").innerHTML = "<h3>Match actuel: " + match[0] + " vs " + match[1] + "</h3>";
		}
		// await this.delay(500); // Wait for 2 seconds before starting the next match
		let winner = await this.playPong(match[0], match[1]);
		this.players.push(winner);
		// await this.delay(2000);  // 2000 ms = 2 seconds
		this.organizeMatches();
	}
}

// DEBUG
function rempliTestDebug() {
	for (let i = 1; i <= 8; i++) {
		document.getElementById("player" + i).value = "test" + i;
	}
}

function listenerTournament() {

	document.querySelector("#startTournament").addEventListener("click", e => {

		// remove the button of the login when the tournament is launched
		// const loginButton = document.querySelector("#login-btn");
		// loginButton.classList.add("d-none");

		const startBtn = document.querySelector("#startGame2");
		startBtn.classList.remove("d-none");
		startBtn.parentElement.classList.remove("d-none");

		const board = document.querySelector("#board_two");
		board.classList.remove("d-none");
		board.parentElement.classList.remove("d-none");

		let tournament = new Tournament();
		tournament.startTournament();
	});

	document.querySelector("#DEBUGstartTournament").addEventListener("click", e => {

		rempliTestDebug();

		// remove the button of the login when the tournament is launched
		// const loginButton = document.querySelector("#login-btn");
		// loginButton.classList.add("d-none");

		const startBtn = document.querySelector("#startGame2");
		startBtn.classList.remove("d-none");
		startBtn.parentElement.classList.remove("d-none");

		const board = document.querySelector("#board_two");
		board.classList.remove("d-none");
		board.parentElement.classList.remove("d-none");

		let tournament = new Tournament();
		tournament.startTournament();
	});
}

async function loadTournament() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		const response = await fetch('http://localhost:7890/api/tournament/', init);

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}
		console.log(response.status);
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
