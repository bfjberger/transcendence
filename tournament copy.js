// tournament.js
import pongGame from './pong2players.js';
import bracketGraph from './bracket.js';

let players = [];
let matches = [];

let rounds;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates pairings for a tournament based on the given players.
 * @param {Array} players - The array of players participating in the tournament.
 * @returns {Array} - The array of pairings, where each pairing is represented as an array of two players.
 */
function generatePairings(players) {
    const numPlayers = players.length;
    const pairings = [];

    for (let i = 0; i < numPlayers; i += 2) {
        pairings.push([players[i], players[i + 1]]);
    }

    return pairings;
}

function generatePairingsForRound(players) {
    const numPlayers = players.length;
    const roundPairings = [];

    // Top team bottom team, top score, bottom score, top winner, bottom winner
    for (let i = 0; i < numPlayers; i += 2) {
        roundPairings.push({ topTeam: players[i], bottomTeam: players[i + 1], topScore: '', bottomScore: '', topWinner: false, bottomWinner: false });
    }
    return roundPairings;
}

/**
 * Randomizes the order of players array.
 */
function randomizePlayers() {
    for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
    }
    console.log('Players randomized:', players);
}

function generateFirstRound(Players) {
    let rounds = [];

    // for the first round just assign each player to a match
    rounds.push(generatePairingsForRound(Players));
    // for the next rounds let undefined
    rounds.push(generatePairingsForRound(new Array(Players.length / 2)));
    rounds.push(generatePairingsForRound(new Array(Players.length / 4)));
    return rounds;
}

/**
 * Starts the tournament by collecting player names and organizing matches.
 */
export function startTournament() {
    for (let i = 1; i <= 8; i++) {
        let player = document.getElementById('player' + i).value;
        if (player) {
            players.push(player);
        }
    }
    if (players.length !== 8) {
        alert('Veuillez entrer les noms de 8 joueurs.');
        players = [];
        return;
    }
    document.getElementById('players').style.display = 'none';
    rounds = generateFirstRound(players);
    document.getElementById('bracketContainer').innerHTML = bracketGraph.generateBracket(rounds);
    console.log('Players:', players);
    randomizePlayers();
    organizeMatches();
}

/**
 * Organizes matches by pairing up players.
 * @function organizeMatches
 * @returns {void}
 */
function organizeMatches() {
    console.log('Organizing matches. Players left:', players.length);
    while (players.length >= 2) {
        let matchPlayers = players.splice(0, 2);
        matches.push(matchPlayers);
    }
    displayNextMatch();
}

/**
 * Plays a game of Pong between two players.
 * @param {string} player1 - The name of the first player.
 * @param {string} player2 - The name of the second player.
 * @returns {Promise<string>} - The name of the winner.
 */
async function playPong(player1, player2) {
    let winner = null;
    while (!winner) {
        winner = await playSingleMatch(player1, player2);
        if (!winner) {
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before starting the next match
        }
    }
    return winner;
}

/**
 * Plays a single match between two players.
 * 
 * @param {string} player1 - The name of player 1.
 * @param {string} player2 - The name of player 2.
 * @returns {Promise<string>} The name of the winner.
 */
async function playSingleMatch(player1, player2) {
    // Get the old canvas and create a new one
    let oldCanvas = document.getElementById('board');
    let newCanvas = oldCanvas.cloneNode(false);
    newCanvas.id = 'board';

    // Replace the old canvas with the new one
    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

    // Create a new game instance tied to the new canvas
    let game = new pongGame.PongGame2Players(player1, player2, newCanvas);
    game.init();
    let winner = await game.gameOver();
    console.log('Match finished. Winner:', winner);
    return winner;
}


/**
 * Displays the next match in the tournament.
 * @returns {Promise<void>} A promise that resolves when the next match is displayed.
 */
async function displayNextMatch() {
    console.log('Displaying next match. Matches left:', matches.length);
    if (matches.length === 0) {
        document.getElementById('tournament').innerHTML = '<h2>Le gagnant est ' + players[0] + '!</h2>';
        return;
    }

    let match = matches.shift();
    document.getElementById('tournament').innerHTML = '<h2>Prochain match: ' + match[0] + ' vs ' + match[1] + '</h2>';
    await delay(2000); // Wait for 2 seconds before starting the next match
    let winner = await playPong(match[0], match[1]);
    players.push(winner);

    // bracketGraph.showBracket(rounds);
    // Organize the next match after a delay
    await delay(2000);  // 2000 ms = 2 seconds
    organizeMatches();
}

window.startTournament = startTournament;

// function that get the players and generate the rounds in order to display the bracket


// rounds[1] = [
//         { topTeam: 'Team 1', bottomTeam: 'Team 4', topScore: 5, bottomScore: 3, topWinner: true, bottomWinner: false },
//         { topTeam: 'Team 5', bottomTeam: 'Team 7', topScore: 4, bottomScore: 2, topWinner: true, bottomWinner: false }
// ]

// rounds[2] = [
// 	{ topTeam: 'Team 1', bottomTeam: 'Team 5', topScore: 5, bottomScore: 3, topWinner: true, bottomWinner: false }
// ]


// let bracket = bracketGraph.generateBracket(rounds);

// document.getElementById('bracketContainer').innerHTML = bracket;