// Importe la View de chaque page
import renderFourPlayers from "../views/viewFourPlayers.js"
import renderFourOnline from "../views/viewFourOnline.js"
import renderFriends from "../views/viewFriends.js"
import renderLogin from "../views/viewLogin.js"
import renderTournamentLocal from "../views/viewTournamentLocal.js"
import renderTournament from "../views/viewTournament.js"
import renderTwoPlayers from "../views/viewTwoPlayers.js"
import renderTwoOnline from "../views/viewTwoOnline.js"
import renderGameHistory from "../views/ViewGameHistory.js"
import render404_error from "../views/view404_error.js"
import renderPong_IA from "../views/viewPong_IA.js"
import renderStats from "../views/viewStats.js"
import renderUpdateInfo from "../views/viewUpdateInfo.js"

// Importe le script de chaque page qui gere le load et listener
import handleFriends from "./friends.js"
import handleLogin from "./login.js"
import handleGameHistory from "./gamehistory.js"
import handleStats from "./stats.js"
import handleUpdateInfo from "./updateinfo.js"
import handleTournament from "../games/tournament.js"
import handleTournamentOnline from "../games/tournamentOnline.js"
import handleTournamentRoom from "../games/tournamentRoom.js"
import handleTwoPlayers from "../games/pong2players.js"
import handleFourPlayers from "../games/pong4players.js"
import handleTwoPlayersOnline from "../games/pong2playersonline.js"
import handleFourPlayersOnline from "../games/pong4playersonline.js"
import handle404_error from "./404_error.js"
import handlePong_IA from "../games/pong_IA.js"

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
	"tournament": {
		title: "Tournoi Local",
		path: "/tournament/",
		view: renderTournamentLocal.renderTournament,
		load: handleTournament.loadTournament,
		listener: handleTournament.listenerTournament
	},
	"tournamentonline": {
		title: "Tournoi en Ligne",
		path: "/tournamentonline/",
		view: renderTournament.renderTournamentOnline,
		load: handleTournamentOnline.loadTournamentOnline,
		listener: handleTournamentOnline.listenerTournamentOnline
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
	"404_error": {
		title: "404 error",
		path: "/404_error/",
		view: render404_error,
		load: handle404_error.load404_error,
		listener: handle404_error.listener404_error
	},
	"pong_IA": {
		title: "1 Joueur contre l'IA",
		path: "/pong_IA/",
		view: renderPong_IA,
		load: handlePong_IA.loadPong_IA,
		listener: handlePong_IA.listenerPong_IA
	},
	"stats": {
		title: "Mes Statistiques",
		path: "/stats/",
		view: renderStats,
		load: handleStats.loadStats,
		listener: handleStats.listenerStats
	},
	"updateinfo": {
		title: "Modifier mes Informations",
		path: "/updateinfo/",
		view: renderUpdateInfo,
		load: handleUpdateInfo.loadUpdateInfo,
		listener: handleUpdateInfo.listenerUpdateInfo
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

		document.getElementById("topbar__profile--username").textContent =
			sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
		document.getElementById("topbar__profile--avatar").src =
			sessionStorage.getItem("avatar") ? sessionStorage.getItem("avatar") : "/frontend/img/person-circle-Bootstrap.svg";
		document.getElementById("topbar__profile--avatar").alt =
			sessionStorage.getItem("avatar") ? sessionStorage.getItem("username") + " avatar" : "temp avatar";

		document.title = page.title;

		window.history.pushState({}, "", page.path);

		page.listener();
	}
	else {
		console.log("page.load(): Error, redirect to login page");
		router("login");
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

		let hostnameport = "https://" + window.location.host;

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

/**
 * function called when the user try to login with 42 app
 * @param {string} code -> the code returned by the first step made by the backend
 * This will do a request to the backend for the second step of the 42API login
*/
async function load42Profile(code)
{
	try {
		let hostnameport = "https://" + window.location.host;

		const init = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({code: code})
		};

		const response = await fetch(hostnameport + '/api/call_back/', init);

		if (response.status == 200) {
			const data = await response.json();

			sessionStorage.setItem("username", data["username"]);
			sessionStorage.setItem("avatar", data["player"].avatar);
			sessionStorage.setItem("nickname", data["player"].nickname);

			document.querySelectorAll(".dropdown-item").forEach(btn => {
				btn.removeAttribute("disabled");
			});
			document.getElementById("topbar__logout").removeAttribute("disabled");

			loadIndex();

			// router("index");
		}

		else if (response.status == 401) {
			const data = await response.json();

			window.alert(data);
		}

		else if (!response.ok) {
			const data2 = await response.json()
			throw new Error(data2);
		}

	} catch (e) {
		console.error(" 42profile error : " + e);
	}
};

/**
 * Event listener for window.onload event
 * Load the page that the user is currently on
 * If the user is logged in, load the page that the user is currently on
 * If the user is not logged in, redirect to the login page
*/
window.onload = async function()
{
	const currentPath = window.location.pathname;

	var found = false

	for (const route in routes)
	{
		if (routes[route].path === currentPath)
		{
			if (await routes[route].load() === 1)
			{

				found = true
				document.getElementById('main__content').innerHTML = routes[route].view();  // Render the HTML content for the page

				document.getElementById("topbar__profile--username").textContent =
					sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
				document.getElementById("topbar__profile--avatar").src =
					sessionStorage.getItem("avatar") ? sessionStorage.getItem("avatar") : "/frontend/img/person-circle-Bootstrap.svg";
				document.getElementById("topbar__profile--avatar").alt =
					sessionStorage.getItem("avatar") ? sessionStorage.getItem("username") + " avatar" : "temp avatar";

				document.title = routes[route].title;
				routes[route].listener();  // Attach event listeners
			}
			else
				router("login");
			return;
		}
	}
	if (found == false)
	{
		router("404_error")
	}
};

/**
 * Event listener for popstate event
 * A popstate event is fired when the active history entry changes
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

		document.getElementById("topbar__profile--username").textContent =
			sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
		document.getElementById("topbar__profile--avatar").src =
			sessionStorage.getItem("avatar") ? sessionStorage.getItem("avatar") : "/frontend/img/person-circle-Bootstrap.svg";
		document.getElementById("topbar__profile--avatar").alt =
			sessionStorage.getItem("avatar") ? sessionStorage.getItem("username") + " avatar" : "temp avatar";

		document.title = page.title;

		page.listener();
	}
	else
		loadIndex();
});

/**
 * Event listener for DOMContentLoaded event
 * If the user is on the index page, index specific logic is executed
 * Attach event listener to the 'logout' button
 * Attach event listeners on all buttons with the class 'dropdown-item' i.e. all buttons that redirect to another "page"
*/
document.addEventListener("DOMContentLoaded", () => {

	if (window.location.search.split("=")[0] == "?code") {
		let code = window.location.search.split("=")[1];
		load42Profile(code);
	}

	if (window.location.pathname === "/") {
		loadIndex();
	}

	document.getElementById("topbar__logout").addEventListener("click", (e) => {
		e.preventDefault();
		handleLogout();
	});

	document.querySelectorAll(".nav__item").forEach(element => {
		element.addEventListener("click", (e) => {
			e.preventDefault();

			if (element.value !== window.location.pathname.replaceAll("/", "")) {
				router(element.value);
			}
		})
	});
});

export { router }
