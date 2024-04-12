import renderFourPlayers from "../views/viewFourPlayers.js"
import renderFriends from "../views/viewFriends.js"
import renderLogin from "../views/viewLogin.js"
import renderProfile from "../views/viewProfile.js"
import renderTournament from "../views/viewTournament.js"
import renderTwoPlayers from "../views/viewTwoPlayers.js"

import handleProfile from "./profile.js"
import handleLogin from "./login.js"
import handleFriends from "./friends.js"
import handleFourPlayers from "./fourplayers.js"
import handleTwoPlayers from "./twoplayers.js"
import handleTournament from "./tournament.js"

const routes = {
	"profile": {
		title: "Profile",
		path: "/profile/",
		view: renderProfile(),
	},
	"twoplayers": {
		title: "Two Players Game",
		path: "/twoplayer/",
		view: renderTwoPlayers()
	},
	"fourplayers": {
		title: "Four Players Game",
		path: "/fourplayer/",
		view: renderFourPlayers()
	},
	"tournament": {
		title: "Tournament",
		path: "/tournament/",
		view: renderTournament()
	},
	"friends": {
		title: "Friends",
		path: "/friends/",
		view: renderFriends()
	},
	"login": {
		title: "Login",
		path: "/login/",
		view: renderLogin()
	},
	"index": {
		title: "Main",
		path: "/",
		view: ""
	}
};

async function handleFirstPage() {
	try {
		const response = await fetch('http://localhost:7890/api/index/');

		if (response.status === 202) {
			console.log("already logged");
			router("profile");
		}
		if (response.status === 203) {
			console.log("not yet logged");
			router("login");
		}
	} catch (e) {
		console.error(e);
	}
}

async function profileLoad() {

	try {
		const response = await fetch('http://localhost:7890/api/profile/');

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}
		console.log(response.status);
	} catch (e) {
		console.error("handleProfile: " + e);
		router("index");
	}
};

export default function router(value) {

	var content = document.querySelector("#main__content");

	if (value === "profile") {
		profileLoad();
	}

	content.innerHTML = routes[value].view;
	document.title = routes[value].title;

	window.history.pushState({}, "", routes[value].path);
	redispatch();
}

document.addEventListener("DOMContentLoaded", () => {

	if (window.location.pathname === "/") {
		handleFirstPage();
	}

	// create document click that watches the nav links only
	document.querySelectorAll(".nav__link").forEach(element => {

		element.addEventListener("click", (e) => {
			e.preventDefault();

			router(element.value);
		})
	});
});

function redispatch() {

	if (document.title === "Profile") {
		console.log("handle profile page");
		handleProfile();
	}

	if (document.title === "Login") {
		console.log("handle login page");
		handleLogin();
	}

	if (document.title === "Two Players") {
		console.log("handle two players page");
		handleTwoPlayers();
	}

	if (document.title === "Four Players") {
		console.log("handle four players page");
		handleFourPlayers();
	}

	if (document.title === "Tournament") {
		console.log("handle tournament page");
		handleTournament();
	}

	if (document.title === "Friends") {
		console.log("handle friends page");
		handleFriends();
	}
};
