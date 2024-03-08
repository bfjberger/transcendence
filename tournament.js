// tournament.js
let players = [];
let matches = [];

function generatePairings(players) {
    const numPlayers = players.length;
    const pairings = [];

    for (let i = 0; i < numPlayers; i += 2) {
        pairings.push([players[i], players[i + 1]]);
    }

    return pairings;
}


function startTournament() {
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
    organizeMatches();
}

function organizeMatches() {
    if (players.length > 1) {
        let matchPlayers = players.splice(0, 2);
        matches.push(matchPlayers);
    }
    displayNextMatch();
}

function playPong(player1, player2) {
    // Ici, vous pouvez ajouter le code pour démarrer le match de pong entre player1 et player2
    // Une fois le match terminé, retournez le gagnant
    
    // Pour l'instant, on retourne un random joueur
    return Math.random() < 0.5 ? player1 : player2;
}

function displayNextMatch() {
    if (matches.length === 0) {
        document.getElementById('tournament').innerHTML = '<h2>Le gagnant est ' + players[0] + '!</h2>';
        return;
    }
    let match = matches.shift();
    document.getElementById('tournament').innerHTML = '<h2>Prochain match: ' + match[0] + ' vs ' + match[1] + '</h2>';
    let winner = playPong(match[0], match[1]);
    players.push(winner);
    
    // Organisez le prochain match après un délai
    setTimeout(organizeMatches, 2000);  // 2000 ms = 2 secondes
}