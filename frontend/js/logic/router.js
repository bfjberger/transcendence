// Import Each Views
import renderFourPlayers from "../views/viewFourPlayers.js"
import renderFriends from "../views/viewFriends.js"
import renderLogin from "../views/viewLogin.js"
import renderProfile from "../views/viewProfile.js"
import renderTournament from "../views/viewTournament.js"
import renderTwoPlayers from "../views/viewTwoPlayers.js"
import renderTwoOnline from "../views/viewTwoOnline.js"

// Import Each Script that handle the load & ≠ fetch
import handleFriends from "./friends.js"
import handleLogin from "./login.js"
import handleProfile from "./profile.js"
import handleTournament from "../games/tournament.js"
import handleTwoPlayers from "../games/pong2players.js"
import handleFourPlayers from "../games/pong4players.js"
import handleTwoPlayersOnline from "../games/pong2playersonline.js"

// Cas particulier pour index
import handleIndex from "./index.js"

const routes = {
	"index": {
		title: "Main",
		path: "/",
		view: handleIndex.renderIndex,
		load: handleIndex.loadIndex,
		listener: handleIndex.listenerIndex
	},
	"friends": {
		title: "Friends",
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
		title: "Tournament",
		path: "/tournament/",
		view: renderTournament,
		load: handleTournament.loadTournament,
		listener: handleTournament.listenerTournament
	},
	"twoplayers": {
		title: "Two Players Game",
		path: "/twoplayers/",
		view: renderTwoPlayers,
		load: handleTwoPlayers.loadTwoPlayers,
		listener: handleTwoPlayers.listenerTwoPlayers
	},
	"fourplayers": {
		title: "Four Players Game",
		path: "/fourplayers/",
		view: renderFourPlayers,
		load: handleFourPlayers.loadFourPlayers,
		listener: handleFourPlayers.listenerFourPlayers
	},
	"twoplayersonline": {
		title: "Two Players Online Game",
		path: "/twoplayersonline/",
		view: renderTwoOnline,
		load: handleTwoPlayersOnline.loadTwoPlayersOnline,
		listener: handleTwoPlayersOnline.listenerTwoPlayersOnline
	},
};

async function loadIndex() {

	try {
		const response = await fetch('http://localhost:7890/api/index/');

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

async function handleLogout() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
			method: "PATCH",
			headers: { 'X-CSRFToken': csrftoken, },
	}

	try {
			const response = await fetch('http://localhost:7890/api/logout/', init);

			if (response.status === 200) {
					console.log("user successfull logged out");

					sessionStorage.clear();
					router("login");
			}
	} catch (e) {
			console.error(e);
	}
};

export default async function router(value) {

	var page = routes[value];

	if (!page)
		return;

	if (await page.load() === 1) {
		document.getElementById("main__content").innerHTML = page.view();

		document.getElementById("navbar__btn--text").innerHTML = sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
		document.getElementById("navbar__btn--avatar").src = sessionStorage.getItem("avatar") ? sessionStorage.getItem("avatar") : "/frontend/img/person-circle-Bootstrap.svg";
		document.getElementById("navbar__btn--avatar").alt = sessionStorage.getItem("avatar") ? sessionStorage.getItem("username") + " avatar" : "temp avatar";

		document.title = page.title;

		window.history.pushState({}, "", page.path);

		page.listener();
	}
	else
		router("login");
};

/*
window.addEventListener("popstate", (e) => {
	e.preventDefault();

	// get the url, remove the '/' and if the url is null assign it to '/'
	let url = window.location.pathname.replaceAll("/", "");
	// url = url !== null ? url : "/";
	if (!url)
		url === "/";

	router(url);
});
*/

window.onload = async function() {

	const currentPath = window.location.pathname;
	for (const route in routes) {
		if (routes[route].path === currentPath) {
			if (await routes[route].load() === 1) {
				document.getElementById('main__content').innerHTML = routes[route].view();  // Render the HTML content for the page
				document.title = routes[route].title;
				// routes[route].load();  // Load any necessary data
				routes[route].listener();  // Attach event listeners
			}
			else
				router("login");
			break;
		}
	}
};

document.addEventListener("DOMContentLoaded", () => {

	if (window.location.pathname === "/") {
		loadIndex();
	}

	// add click listener for the 'logout' button
	document.getElementById("logout").addEventListener("click", (e) => {
		e.preventDefault();

		handleLogout();
	});

	// add click listener for all buttons with the class 'nav__link' i.e. all buttons that redirect to another "page"
	document.querySelectorAll(".nav__link").forEach(element => {

		element.addEventListener("click", (e) => {
			e.preventDefault();

			if (element.value !== window.location.pathname.replaceAll("/", "")) {
				router(element.value);
			}
		})
	});

});
