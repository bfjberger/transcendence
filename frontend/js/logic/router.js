// Importe la View de chaque page
import renderFourPlayers from "../views/viewFourPlayers.js"
import renderFourOnline from "../views/viewFourOnline.js"
import renderFriends from "../views/viewFriends.js"
import renderLogin from "../views/viewLogin.js"
import renderProfile from "../views/viewProfile.js"
import renderTournament from "../views/viewTournament.js"
import renderTwoPlayers from "../views/viewTwoPlayers.js"
import renderTwoOnline from "../views/viewTwoOnline.js"
import renderGameHistory from "../views/ViewGameHistory.js"

// Importe le script de chaque page qui gere le load et listener
import handleFriends from "./friends.js"
import handleLogin from "./login.js"
import handleProfile from "./profile.js"
import handleTournament from "../games/tournament.js"
import handleTournamentOnline from "../games/tournamentOnline.js"
import handleTournamentRoom from "../games/tournamentRoom.js"
import handleTwoPlayers from "../games/pong2players.js"
import handleFourPlayers from "../games/pong4players.js"
import handleTwoPlayersOnline from "../games/pong2playersonline.js"
import handleFourPlayersOnline from "../games/pong4playersonline.js"
import handleGameHistory from "./gamehistory.js"

// Cas particulier pour index
import handleIndex from "./index.js"

/**
 * Routes object
 * Contains all the pages of the website
 * Each page has a title, a path, a view, a load function and a listener function
 * The title is the title of the page
 * The path is the path of the page
 * The view is the HTML content of the page
 * The load function is the function that checks if the user can access the page
 * The listener function is the function that attaches event listeners to the page
*/
const routes = {
	"index": {
		title: "Main",
		path: "/",
		view: handleIndex.renderIndex,
		load: handleIndex.loadIndex,
		listener: handleIndex.listenerIndex
	},
	"friends": {
		title: "Amis",
		path: "/friends/",
		view: renderFriends,
		load: handleFriends.loadFriends,
		listener: handleFriends.listenerFriends
	},
	"login": {
		title: "Login",
		path: "/login/",
		view: renderLogin,
		load: handleLogin.loadLogin,
		listener: handleLogin.listenerLogin
	},
	"profile": {
		title: "Profile",
		path: "/profile/",
		view: renderProfile,
		load: handleProfile.loadProfile,
		listener: handleProfile.listenerProfile
	},
	"tournament": {
		title: "Tournoi Local",
		path: "/tournament/",
		view: renderTournament.renderTournament,
		load: handleTournament.loadTournament,
		listener: handleTournament.listenerTournament
	},
	"tournament_online": {
		title: "Tournoi en Ligne",
		path: "/tournamentOnline/",
		view: renderTournament.renderTournamentOnline,
		load: handleTournamentOnline.loadTournamentOnline,
		listener: handleTournamentOnline.listenerTournamentOnline
	},
	"tournament_online_room": {
		title: "TournamentRoom",
		path: "/tournamentRoom/",
		view: renderTournament.renderTournamentRoom,
		load: handleTournamentRoom.loadTournamentRoom,
		listener: handleTournamentRoom.listenerTournamentRoom
	},
	"twoplayers": {
		title: "2 Joueurs Local",
		path: "/twoplayers/",
		view: renderTwoPlayers,
		load: handleTwoPlayers.loadTwoPlayers,
		listener: handleTwoPlayers.listenerTwoPlayers
	},
	"fourplayers": {
		title: "4 Joueurs Local",
		path: "/fourplayers/",
		view: renderFourPlayers,
		load: handleFourPlayers.loadFourPlayers,
		listener: handleFourPlayers.listenerFourPlayers
	},
	"twoplayersonline": {
		title: "2 Joueurs en Ligne",
		path: "/twoplayersonline/",
		view: renderTwoOnline,
		load: handleTwoPlayersOnline.loadTwoPlayersOnline,
		listener: handleTwoPlayersOnline.listenerTwoPlayersOnline
	},
	"gamehistory": {
		title: "Historique des parties",
		path: "/gamehistory/",
		view: renderGameHistory,
		load: handleGameHistory.loadGameHistory,
		listener: handleGameHistory.listenerGameHistory
	},
	"fourplayersonline": {
		title: "4 Joueurs en Ligne",
		path: "/fourplayersonline/",
		view: renderFourOnline,
		load: handleFourPlayersOnline.loadFourPlayersOnline,
		listener: handleFourPlayersOnline.listenerFourPlayersOnline
	},
};



/**
 * Logout handler function
 * Send a PATCH request to the server to logout the user
 * If the response status is 200, the user is successfully logged out and redirected to the login page
*/
async function handleLogout() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: "PATCH",
		headers: { 'X-CSRFToken': csrftoken, },
	}

	try {

		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/logout/', init);

		if (response.status === 200) {
			console.log("user successfull logged out");

			sessionStorage.clear();
			router("login");
		}
	} catch (e) {
		console.error(e);
	}
};

/**
 * Router function
 * @param {string} value - The value of the button that was clicked
 * Get the page from the routes object, if it exists
 * Call the load function of the page
 	* If the load function returns 1 (the user can access it), render the view of the page
*/
export default async function router(value) {

	var page = routes[value];

	if (!page)
		return;

	if (await page.load() === 1) {
		document.getElementById("main__content").innerHTML = page.view();

		document.getElementById("topbar__profile--username").textContent = sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
		document.getElementById("topbar__profile--avatar").src = sessionStorage.getItem("avatar") ? sessionStorage.getItem("avatar") : "/frontend/img/person-circle-Bootstrap.svg";
		document.getElementById("topbar__profile--avatar").alt = sessionStorage.getItem("avatar") ? sessionStorage.getItem("username") + " avatar" : "temp avatar";

		document.title = page.title;

		window.history.pushState({}, "", page.path);

		page.listener();
	}
	else
	{
		console.log("page.load n a pas renvoyé 1");
		router("login");
	}
};

/**
 * Event listener for popstate event

*/
window.addEventListener("popstate", async (e) => {
	e.preventDefault();

	// Get the current url, remove all '/' and if the url is null assign it to 'index'
	let url = window.location.pathname.replaceAll("/", "");
	if (url === "")
		url = "index";

	var page = routes[url];

	if (!page)
		return;

	if (await page.load() === 1) {
		document.getElementById("main__content").innerHTML = page.view();

		document.getElementById("topbar__profile--username").textContent = sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
		document.getElementById("topbar__profile--avatar").src = sessionStorage.getItem("avatar") ? sessionStorage.getItem("avatar") : "/frontend/img/person-circle-Bootstrap.svg";
		document.getElementById("topbar__profile--avatar").alt = sessionStorage.getItem("avatar") ? sessionStorage.getItem("username") + " avatar" : "temp avatar";

		document.title = page.title;

		page.listener();
	}
	else
		loadIndex();
});

/**
 * Event listener for window.onload event
 * Load the page that the user is currently on
 * If the user is logged in, load the page that the user is currently on
 * If the user is not logged in, redirect to the login page
*/
window.onload = async function() {

	const currentPath = window.location.pathname;
	for (const route in routes) {
		if (routes[route].path === currentPath) {
			if (await routes[route].load() === 1) {
				document.getElementById('main__content').innerHTML = routes[route].view();  // Render the HTML content for the page

				document.getElementById("topbar__profile--username").textContent = sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
				document.getElementById("topbar__profile--avatar").src = sessionStorage.getItem("avatar") ? sessionStorage.getItem("avatar") : "/frontend/img/person-circle-Bootstrap.svg";
				document.getElementById("topbar__profile--avatar").alt = sessionStorage.getItem("avatar") ? sessionStorage.getItem("username") + " avatar" : "temp avatar";

				document.title = routes[route].title;

				routes[route].listener();  // Attach event listeners
			}
			else
				router("login");
			break;
		}
	}
};



/**
 * Load index function
 * Send a GET request to the server to check if the user is logged in
 * If the response status is 202, the user is logged in and redirected to the index page
 * If the response status is 203, the user is not logged in and redirected to the login page
*/
async function loadIndex() {

	try {

		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/index/');

		if (response.status === 202) {

			router("index");
		}
		if (response.status === 203) {

			router("login");
		}
	} catch (e) {
		console.error(e);
	}
};

/*
function called when the user try to login with 42 app
*/
async function load42Profile(code)
{
	try {
		let hostnameport = "https://" + window.location.host

		const init = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},

			body: JSON.stringify({code: code})
		};


		const response = await fetch(hostnameport + '/api/call_back/', init);

		if (response.status == 200)
		{
			const data = await response.json()

			console.log("username " + data["username"])
			console.log("avatar " + data["player"].avatar)
			console.log("nickname " + data["player"].nickname)

			sessionStorage.setItem("username", data["username"]);
			sessionStorage.setItem("avatar", data["player"].avatar);
			sessionStorage.setItem("nickname", data["player"].nickname);

			// document.querySelector("div.modal-backdrop.fade.show").remove();

			document.querySelectorAll(".nav__link").forEach(btn => {
				btn.removeAttribute("disabled");
			});
			document.getElementById("topbar__profile--username").removeAttribute("disabled");
			document.getElementById("topbar__logout").removeAttribute("disabled");



			loadIndex();

			// router("index");
		}
		else
		{
			throw new Error(`HTTP error, status = ${response.status}`);
		}

	} catch (e) {
		console.error(e);
	}
}


/**
 * Event listener for DOMContentLoaded event
 * If the user is on the index page, index specific logic is executed
 * Attach event listener to the 'logout' button
 * Attach event listeners on all buttons with the class 'nav__link' i.e. all buttons that redirect to another "page"
*/
document.addEventListener("DOMContentLoaded", () => {

	if (window.location.search) {
		let code = window.location.search.split("=")[1]
		// console.log("code = ", code)
		load42Profile(code)
	}

	if (window.location.pathname === "/") {
		loadIndex();
	}

	document.getElementById("topbar__logout").addEventListener("click", (e) => {
		e.preventDefault();
		handleLogout();
	});

	document.querySelectorAll(".nav__link").forEach(element => {
		element.addEventListener("click", (e) => {
			e.preventDefault();
			if (element.value !== window.location.pathname.replaceAll("/", "")) {
				router(element.value);
			}
		})
	});

});
