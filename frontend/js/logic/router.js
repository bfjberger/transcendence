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
		path: "/twoplayer/",
		view: renderTwoPlayers,
		load: handleTwoPlayers.loadTwoPlayers,
		listener: handleTwoPlayers.listenerTwoPlayers
	},
	"fourplayers": {
		title: "Four Players Game",
		path: "/fourplayer/",
		view: renderFourPlayers,
		load: handleFourPlayers.loadFourPlayers,
		listener: handleFourPlayers.listenerFourPlayers
	},
	"twoplayersonline": {
		title: "Two Players Online Game",
		path: "/twoplayeronline/",
		view: renderTwoOnline,
		load: handleTwoPlayersOnline.loadTwoPlayersOnline,
		listener: handleTwoPlayersOnline.listenerTwoPlayersOnline
	},
};

async function loadIndex() {

	try {
		const response = await fetch('http://localhost:7890/api/index/');

		if (response.status === 202) {

			router("profile");
		}
		if (response.status === 203) {

			document.querySelectorAll(".nav__link").forEach(btn => {
				btn.setAttribute("disabled", true);
			});
			document.querySelector("#btn__navbar--user").setAttribute("disabled", true);
			document.querySelector("#logout").setAttribute("disabled", true);

			router("login");
		}
	} catch (e) {
		console.error(e);
	}
};

async function handleLogout() {

	console.log("this is the function that will do the request to the back to do the logout");
};

export default function router(value) {

	var page = routes[value];

	if (page.load()) {
		document.querySelector("#main__content").innerHTML = page.view();

		document.title = page.title;

		window.history.pushState({}, "", routes[value].path);

		page.listener();
	}
};

/*
window.addEventListener("beforeunload", e => {
	e.preventDefault();

	router(window.location.pathname.replace("/", ""));
});
*/

document.addEventListener("DOMContentLoaded", () => {

	if (window.location.pathname === "/") {
		loadIndex();
	}

	document.querySelector("#logout").addEventListener("click", (e) => {
		e.preventDefault();

		handleLogout();

		router("login");
	});

	// create document click that watches the nav links only
	document.querySelectorAll(".nav__link").forEach(element => {

		element.addEventListener("click", (e) => {
			e.preventDefault();

			router(element.value);
		})
	});
});
