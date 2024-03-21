// bracket.js

function generateBracket(rounds) {
  let main = document.createElement("main"); // Create main element
  main.id = "tournament"; // Set id to "tournament"
  rounds.forEach((round, roundIndex) => {
    let ul = document.createElement("ul"); // Create ul element
    ul.className = "round round-$(roundIndex + 1)"; // Set class to "round round-1"

    round.forEach((game) => {
      ul.appendChild(createSpacerElement()); // Append createGameSpacerElement to ul
      ul.appendChild(createGameElement(game)); // Append createGameElement to ul
      ul.appendChild(createSpacerElement()); // Append createGameSpacerElement to ul
    });


    main.appendChild(ul); // Append ul to main
  });

  let ulWinner = document.createElement("ul");
  ulWinner.className = "round round-4";
  ulWinner.appendChild(createSpacerElement());
  ulWinner.appendChild(createGameWinner());
  ulWinner.appendChild(createSpacerElement());
  main.appendChild(ulWinner);

  return main.outerHTML; // Return main.outerHTML
}

function createSpacerElement() {
  let spacer = document.createElement("li"); // Create li element
  spacer.className = "spacer"; // Set class to "spacer"
  spacer.innerHTML = "&nbsp"; // Set innerHTML to "0"
  return spacer; // Return li
}

function createGameSpacerElement() {
  let spacer = document.createElement("li"); // Create li element
  spacer.className = "game game-spacer"; // Set class to "spacer"
  spacer.innerHTML = "&nbsp"; // Set innerHTML to "0"
  return spacer; // Return li
}

function createGameElement(game) {
  let gameElement = document.createElement("li"); // Create li element
  gameElement.className = `game game-top ${game.topWinner ? "winner" : "loser"}`; // Set class to "game"
  gameElement.innerHTML = `${game.topTeam} <span>${game.topScore}</span>`; // Set innerHTML to "team1 <span>score1</span>"

  let gameBottomElement = document.createElement("li"); // Create li element
  gameBottomElement.className = `game game-bottom ${game.bottomWinner ? "winner" : "loser"}`; // Set class to "game"
  gameBottomElement.innerHTML = `${game.bottomTeam} <span>${game.bottomScore}</span>`; // Set innerHTML to "team2 <span>score2</span>"

  let fragment = document.createDocumentFragment(); // Create document fragment
  fragment.appendChild(gameElement); // Append gameElement to fragment
  fragment.appendChild(createGameSpacerElement()); // Append createGameSpacerElement to fragment
  fragment.appendChild(gameBottomElement); // Append gameBottomElement to fragment

  return fragment; // Return fragment
}

function createGameWinner() {
  let gameElement = document.createElement("li");
  gameElement.className = `game game-top winner`;
  gameElement.id = `winner_name`

  let fragment = document.createDocumentFragment();
  fragment.appendChild(gameElement);
  return fragment;
}

function showBracket(rounds) {
  let bracket = generateBracket(rounds);
  document.getElementById("bracketContainer").innerHTML = bracket;
}

export default {
  generateBracket,
  createSpacerElement,
  createGameSpacerElement,
  createGameElement,
  showBracket,
};

// let rounds = [
//     [
//         { topTeam: 'Team 1', bottomTeam: 'Team 2', topScore: 5, bottomScore: 3, topWinner: true, bottomWinner: false },
//         { topTeam: 'Team 3', bottomTeam: 'Team 4', topScore: 2, bottomScore: 3, topWinner: false, bottomWinner: true },
//         { topTeam: 'Team 5', bottomTeam: 'Team 6', topScore: 4, bottomScore: 1, topWinner: true, bottomWinner: false },
//         { topTeam: 'Team 7', bottomTeam: 'Team 8', topScore: 3, bottomScore: 2, topWinner: true, bottomWinner: false }
//     ],
// 	[ { topTeam: '', bottomTeam: '', topScore: 0, bottomScore: 0, topWinner: false, bottomWinner: false },
// 		{ topTeam: '', bottomTeam: '', topScore: 0, bottomScore: 0, topWinner: false, bottomWinner: false }
// 	],
// 	[ { topTeam: '', bottomTeam: '', topScore: 0, bottomScore: 0, topWinner: false, bottomWinner: false }]
// ];

// rounds[1] = [
//         { topTeam: 'Team 1', bottomTeam: 'Team 4', topScore: 5, bottomScore: 3, topWinner: true, bottomWinner: false },
//         { topTeam: 'Team 5', bottomTeam: 'Team 7', topScore: 4, bottomScore: 2, topWinner: true, bottomWinner: false }
// ]

// rounds[2] = [
// 	{ topTeam: 'Team 1', bottomTeam: 'Team 5', topScore: 5, bottomScore: 3, topWinner: true, bottomWinner: false }
// ]

// generate the bracket
// let bracket = generateBracket(rounds);

// look for the element with the id of 'bracket' and set its innerHTML to the bracket
// document.getElementById('bracketContainer').innerHTML = bracket;
