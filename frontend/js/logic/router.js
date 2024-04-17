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

			document.querySelectorAll(".nav__link").forEach(btn => {
				btn.setAttribute("disabled", true);
			});
			document.getElementById("navbar__btn--user").setAttribute("disabled", true);
			document.getElementById("logout").setAttribute("disabled", true);

			router("login");
		}
	} catch (e) {
		console.error(e);
	}
};

async function handleLogout() {

	sessionStorage.clear();

	router("login");
};

export default async function router(value) {

	var page = routes[value];

	if (!page)
		return;

	if (await page.load()) {
		document.getElementById("main__content").innerHTML = page.view();

		document.getElementById("navbar__btn--text").innerHTML = sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
		document.getElementById("navbar__btn--avatar").src = sessionStorage.getItem("avatar") ? sessionStorage.getItem("avatar") : "/frontend/img/person-circle-Bootstrap.svg";
		document.getElementById("navbar__btn--avatar").alt = sessionStorage.getItem("avatar") ? sessionStorage.getItem("username") + avatar : "temp avatar";

		document.title = page.title;

		window.history.pushState({}, "", page.path);

		page.listener();
	}
};

window.addEventListener("popstate", (e) => {
	e.preventDefault();

	// get the url, remove the '/' and if the url is null assign it to '/'
	var url = window.location.pathname.replaceAll("/", "");
	url = url != null ? url : "/"

	router(url);
});

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
