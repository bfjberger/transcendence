import bracketGraph from "./bracket.js";
import Player from "./Player.js"; // Import the Player class from Player
import { PongGame2Players } from "./pong2players.js"; // Import the PongGame2Players class from pong2players
import { renderTournamentBrackets, renderTournamentRoom } from "../views/viewTournamentLocal.js";

class Tournament {
	constructor() {
		this.players = [];
		this.matches = [];
		this.rounds = [];
		this.template_text;
	}

	setPlayersName() {
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

	addNameQuarterBrackets() {
		document.getElementById("quarter__seed1--1--name").textContent = this.players[0].name;
		document.getElementById("quarter__seed1--2--name").textContent = this.players[1].name;
		document.getElementById("quarter__seed2--1--name").textContent = this.players[2].name;
		document.getElementById("quarter__seed2--2--name").textContent = this.players[3].name;
		document.getElementById("quarter__seed3--1--name").textContent = this.players[4].name;
		document.getElementById("quarter__seed3--2--name").textContent = this.players[5].name;
		document.getElementById("quarter__seed4--1--name").textContent = this.players[6].name;
		document.getElementById("quarter__seed4--2--name").textContent = this.players[7].name;
	}

	updateQuarterBrackets() {
		for (const [match_index, match] of this.rounds[0]) {
			if (match.topWinner) {
				document.getElementById(`quarter__seed${match_index}--1--main`).classList.add("bg-success-subtle");
				document.getElementById(`quarter__seed${match_index}--2--main`).classList.add("bg-danger-subtle");
			}
			if (match.bottomWinner) {
				document.getElementById(`quarter__seed${match_index}--1--main`).classList.add("bg-danger-subtle");
				document.getElementById(`quarter__seed${match_index}--2--main`).classList.add("bg-success-subtle");
			}
			document.getElementById(`quarter__seed${match_index}--1--score`).textContent = match.topScore;
			document.getElementById(`quarter__seed${match_index}--2--score`).textContent = match.bottomScore;
		};
	}

	updateDemiBrackets() {
		for (const [match_index, match] of this.rounds[1]) {
			if (match.topWinner) {
				document.getElementById(`demi__seed${match_index}--1--main`).classList.add("bg-success-subtle");
				document.getElementById(`demi__seed${match_index}--2--main`).classList.add("bg-danger-subtle");
			}
			if (match.bottomWinner) {
				document.getElementById(`demi__seed${match_index}--1--main`).classList.add("bg-danger-subtle");
				document.getElementById(`demi__seed${match_index}--2--main`).classList.add("bg-success-subtle");
			}
			document.getElementById(`demi__seed${match_index}--1--score`).textContent = match.topScore;
			document.getElementById(`demi__seed${match_index}--2--score`).textContent = match.bottomScore;
		}
	}

	updateFinalBracket() {
		if (this.rounds[2].topWinner) {
			document.getElementById("final__1--main").classList.add("bg-success-subtle");
			document.getElementById("final__2--main").classList.add("bg-danger-subtle");
			document.getElementById("winner_name").textContent = this.rounds[2].topTeam;
		}
		if (this.rounds[2].bottomWinner) {
			document.getElementById("final__1--main").classList.add("bg-danger-subtle");
			document.getElementById("final__2--main").classList.add("bg-success-subtle");
			document.getElementById("winner_name").textContent = this.rounds[2].bottomTeam;
		}
		document.getElementById("final__1--score").textContent = this.rounds[2].topScore;
		document.getElementById("final__2--score").textContent = this.rounds[2].bottomScore;
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
				roundPairings.push(
					{
						topTeam: players[i].name,
						bottomTeam: players[i + 1].name,
						topScore: "",
						bottomScore: "",
						topWinner: false,
						bottomWinner: false
					});
			else
				roundPairings.push(
					{
						topTeam: players[i],
						bottomTeam: players[i + 1],
						topScore: "",
						bottomScore: "",
						topWinner: false,
						bottomWinner: false
					});
		}
		return roundPairings;
	}

	randomizePlayers() {
		for (let i = this.players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.players[i], this.players[j]] = [this.players[j], this.players[i]];
		}
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
			undefinedMatches.push(
				{
					topTeam: "",
					bottomTeam: "",
					topScore: "",
					bottomScore: "",
					topWinner: false,
					bottomWinner: false
				});
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
				if (match.topTeam === winner.name || match.bottomTeam === winner.name) {
					// console.log('Match:', match);
					// match.winner = winner.name;
					if (match.topTeam === winner.name) {
						match.topWinner = true;
						// if the next match is undefined, then the winner of this match will be the top team
						if (i < this.rounds.length - 1) {
							let nextMatchIndex = Math.floor(j / 2);
							if (this.rounds[i + 1][nextMatchIndex].topTeam === "") {
								console.log("Setting top team at rounds[", i + 1, "][", nextMatchIndex, "] to", winner.name);
								this.rounds[i + 1][nextMatchIndex].topTeam = winner.name;
							}
							else {
								console.log("Setting bottom team at rounds[", i + 1, "][", nextMatchIndex, "] to", winner.name);
								this.rounds[i + 1][nextMatchIndex].bottomTeam =
								winner.name;
							}
						}
					}
					else {
						match.bottomWinner = true;
						if (i < this.rounds.length - 1) {
							let nextMatchIndex = Math.floor(j / 2);
							if (this.rounds[i + 1][nextMatchIndex].topTeam === "") {
								this.rounds[i + 1][nextMatchIndex].topTeam = winner.name;
								console.log("Setting top team at rounds[", i + 1, "][", nextMatchIndex, "] to", winner.name);
							}
							else {
								console.log("Setting bottom team at rounds[", i + 1, "][", nextMatchIndex, "] to", winner.name);
								this.rounds[i + 1][nextMatchIndex].bottomTeam =
								winner.name;
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

	startTournament() {
		this.template_text = document.getElementById("template_text");
		this.randomizePlayers();
		this.addNameQuarterBrackets();
		this.rounds = this.generateFirstRound(this.players);
		this.populateRoundsWithUndefined(1);
		this.populateRoundsWithUndefined(2);
		// document.getElementById("tournament__room--brackets").innerHTML = bracketGraph.generateBracket(this.rounds);
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
			// let bracketContainer = document.getElementById("tournament__room--brackets");
			// bracketContainer.innerHTML = ""; // Clear the current bracket
			// bracketContainer.innerHTML = bracketGraph.generateBracket(this.rounds);
			// if (!winner) {
				// 	await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before starting the next match
			// }
		}
		console.log(winner.name);
		this.updateRounds(winner);
		this.updateQuarterBrackets();
		return winner.name;
	}

	async playSingleMatch(player1, player2) {
		document.getElementById("tournament__left").textContent = player1.name + ": W/S";
		document.getElementById("tournament__right").textContent = player2.name + ": O/L";

		var game;
		game = new PongGame2Players(player1.name, player2.name);
		game.init();

		// await game.gameOver();

		var winner = game.winner;
		// console.log("Match finished. Winner:", winner);

		return winner;
	}

	async displayNextMatch() {
		console.log("Displaying next match. Matches left:", this.matches.length);
		if (this.matches.length === 0) {
			this.template_text.textContent = "Le gagnant est " + this.players[0];
			document.getElementById("winner_name").textContent = this.players[0];
			return;
		}

		let players = this.matches.shift();
		this.template_text.textContent = "Match actuel: " + players[0].name + " vs " + players[1].name;

		// await this.delay(2000); // Wait for 2 seconds before starting the next match

		// var winner = await this.launchGame(players[0], players[1]);

		let winner = await this.playPong(players[0], players[1]);
		this.players.push(winner);

		this.organizeMatches();
	}

	async launchGame(player_1, player_2) {
		document.getElementById("tournament__left").textContent = player_1.name + ": W/S";
		document.getElementById("tournament__right").textContent = player_2.name + ": O/L";

		var game;
		game = new PongGame2Players(player_1.name, player_2.name);
		game.init();

		var winner = await game.update();
		console.log("Match terminé, winner: ", winner);
		return winner;
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

/* -------------------------- Listener for the page ------------------------- */

function listenerTournament() {

	// Replace the value of the first field by the nickname of the user
	document.getElementById("tournament__player--1").value = sessionStorage.getItem("nickname");

	document.getElementById("startTournament").addEventListener("click", e => {
		e.preventDefault();

		let tournament = new Tournament();
		let returnValue = tournament.setPlayersName();
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
