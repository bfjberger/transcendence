const routes = {
	"/staticfiles/index.html": {
		linkLabel: "Main Page",
		title: "Main Page",
		content: `hello`
	},
	"/staticfiles/html/profile.html": {
		linkLabel: "Profile",
		title: "Profile",
		content: `Profile Page`
	},
	"/staticfiles/html/twoplayers.html": {
		linkLabel: "Two Players Game",
		title: "Two Players Game",
		content: `<div class="row">
					<div class="col text-center fw-bold pt-3">
					<h1>Two Players Pong Game</h1>
					</div>
				</div>
				<div class="row">
					<div class="col-5"></div>
					<div class="col-2 text-white" style="visibility: hidden">
					<p>Top Player: N/M</p>
					</div>
					<div class="col-5"></div>
				</div>
				<div class="row">
					<div class="col text-end text-warning align-self-center">
					<p>Left Player: W/S</p>
					</div>
					<div class="col d-flex justify-content-center align-items-center">
						<div class="position-absolute">
							<button class="btn btn-primary" type="button" id="startGame2">Start the game</button>
						</div>
						<div class="text-bg-success border border-black border-5">
							<canvas id="board_two" width="650" height="480"></canvas>
						</div>
					</div>
					<div class="col text-start align-self-center text-primary">
					<p>Right Player: UpArrow/DownArrow</p>
					</div>
				</div>`
	},
	"/staticfiles/html/fourplayers.html": {
		linkLabel: "Four Players Game",
		title: "Four Players Game",
		content: `<div class="row">
					<div class="col text-center fw-bold pt-3">
					<h1>Four Players Pong Game</h1>
					</div>
				</div>
				<div class="row">
					<div class="col-5"></div>
					<div class="col-2 text-center" style="color: violet">
					<p>Top Player: N/M</p>
					</div>
					<div class="col-5"></div>
				</div>
				<div class="row">
					<div class="col text-end text-warning align-self-center">
					<p>Left Player: Q/A</p>
					</div>
					<div class="col d-flex justify-content-center align-items-center">
						<div class="position-absolute">
							<button class="btn btn-primary" type="button" id="startGame4">Start the game</button>
						</div>
						<div class="text-bg-success border border-black border-5">
							<canvas id="board_four" width="650" height="650"></canvas>
						</div>
					</div>
					<div class="col text-start text-primary align-self-center">
					<p>Right Player: 9/6</p>
					</div>
				</div>
				<div class="row">
					<div class="col-5"></div>
					<div class="col-2 text-center mt-3" style="color: red">
					<p>Bottom Player: LeftArrow/RightArrow</p>
					</div>
					<div class="col-5"></div>
				</div>`
	},
	"/staticfiles/html/tournament.html": {
		linkLabel: "Tournament",
		title: "Tournament",
		content: `<div class="row">
				<div class="col text-center fw-bold pt-3">
					<h1>Tournament</h1>
				</div>
			</div>
			<div class="row" id="players">
				<div class="col text-center fw-bold pt-3">
					<h3>Entrez les noms des joueurs</h3>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player1" placeholder="Joueur 1" aria-label="Joueur 1" value="a"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player2" placeholder="Joueur 2" aria-label="Joueur 2" value="b"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player3" placeholder="Joueur 3" aria-label="Joueur 3" value="c"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player4" placeholder="Joueur 4" aria-label="Joueur 4" value="d"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player5" placeholder="Joueur 5" aria-label="Joueur 5" value="e"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player6" placeholder="Joueur 6" aria-label="Joueur 6" value="f"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player7" placeholder="Joueur 7" aria-label="Joueur 7" value="g"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player8" placeholder="Joueur 8" aria-label="Joueur 8" value="h"/>
				</div>
				<div class="d-flex justify-content-center pt-2">
					<button class="btn btn-info" onclick="startTournament()">Démarrer le tournoi</button>
				</div>
				<div class="d-flex justify-content-center pt-2">
					<button class="btn btn-info" onclick="rempliTestDebug(); startTournament();">DEBUG TOURNOI RAPIDE</button>
				</div>
			</div>
			<div class="row" id="title">
				<div class="col-5 d-flex justify-content-left" id="next_match"></div>
				<div class="col-2 d-flex justify-content-center" id="current_match"></div>
				<div class="col-5"></div>
			</div>
			<div class="row">
				<div class="col"></div>
				<div class="col d-flex justify-content-center align-items-center">
					<div class="position-absolute d-none">
						<button class="btn btn-primary" type="button" id="startGame2">Start the game</button>
					</div>
					<div class="text-bg-success border border-black border-5 d-none">
						<canvas id="board_two" width="650" height="480"></canvas>
					</div>
				</div>
				<div class="col"></div>
			</div>
			<div class="row" id="bracketContainer"></div>`
	},
	"/staticfiles/html/friends.html": {
		linkLabel: "Friends",
		title: "Friends",
		content: `Friends Page`
	}
};

// Function to handle navigation
function navigateToPage(page) {
	const route = routes[page];
	if (route) {
		document.querySelector("#main-content").innerHTML = route.content;
		document.title = route.title; // Update page title
		history.pushState({ page }, "", page); // Update URL
	}
	else {
		document.querySelector("#main-content").innerHTML = "<h2>Page Not Found</h2>";
	}
}

// Event listener for navigation links
document.querySelectorAll(".nav__link").forEach(link => {
	link.addEventListener("click", function() {
		const page = this.value;
		navigateToPage(page);
	});
});

// Initial page load
navigateToPage("/staticfiles/index.html");

/*
	WHEN HOSTING THE PAGES (CONTENT) ON THE SERVER
// Function to load content based on page from Django backend
function loadPageFromDjango(page) {
  fetch(`/api/pages/${page}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      return response.text();
    })
    .then(html => {
      document.querySelector(".main-content").innerHTML = html;
    })
    .catch(error => {
      console.error("Fetch error:", error);
    });
}

// Event listener for navigation links
document.querySelectorAll(".nav__link").forEach(link => {
  link.addEventListener("click", function() {
    const page = this.getAttribute("data-page");
    loadPageFromDjango(page);
  });
});

// Initial page load
loadPageFromDjango("home");
*/

/*
const contentElement = document.querySelector('#content');
// const nav = document.querySelector('#nav');

const renderContent = route => contentElement.innerHTML = routes[route].content;

const navigate = e => {
	const route = e.target.pathname;
	// this is responsible for adding the new path name to the history stack
	history.pushState({}, "", route);
	renderContent(route);
};

// function to register click handlers
const registerNavLinks = () => {
	// nav.addEventListener('click', (e) => {
	// 	e.preventDefault();
	// 	navigate(e); // pending implementation
	// });

	document.querySelectorAll(".nav__link").forEach(linkElement => {

		linkElement.addEventListener("click", e => {
			e.preventDefault();
			Object.keys(routes).forEach(route => {
				if (linkElement.value === route) {
					const { linkLabel } = routes[route];
					linkElement.nodeValue = linkLabel;
					return;
				}
			})
			navigate(e);
		});
	});

};

/*
// function to create new nav items
const renderNavlinks = () => {
	const navFragment = document.createDocumentFragment();
	Object.keys(routes).forEach(route => {
		const { linkLabel } = routes[route];

		const linkElement = document.createElement('a')
		linkElement.href = route;
		linkElement.textContent = linkLabel;
		linkElement.className = 'nav__link';
		navFragment.appendChild(linkElement);
	});

	nav.append(navFragment);
};
*\/

const registerBrowserBackAndForth = () => {
	window.onpopstate = function (e) {
		const route = location.pathname;
		renderContent(route);
	};
};

const renderInitialPage = () => {
	const route = location.pathname;
	renderContent(route);
};

(function bootup() {
	// renderNavlinks();
	registerNavLinks();
	registerBrowserBackAndForth();
	renderInitialPage();
})();
*/