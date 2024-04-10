// create an object that maps the url to the template, title, and description
const routes = {
	"main": {
		title: "Main Page",
		template: '../templates/main.html'
	},
	"profile": {
		title: "Profile",
		template: '../html/profile.html'
	},
	"twoplayers": {
		title: "Two Players Game",
		template: '../templates/twoplayers.html'
	},
	"fourplayers": {
		title: "Four Players Game",
		template: '../templates/fourplayers.html'
	},
	"tournament": {
		title: "Tournament",
		template: '../templates/tournament.html'
	},
	"friends": {
		title: "Friends",
		template: '../templates/friends.html'
	},
	"login": {
		title: "Login",
		template: '../html/login.html',
		navbar: `<div class="col-md-1 d-flex justify-content-center">
					<img src="../img/42_logo.svg" alt="logo 42" width="42" height="30"/>
				</div>
				<div class="col-md-10"></div>
				<div class="col-md-1 text-end pe-3">
					<img src="../img/person-circle-Bootstrap.svg" alt="user" width="30" height="30" class="rounded-circle"/>
				</div>`
	},
	"base": {
		title: "base",
		template: '../templates/base.html',
	},
};

/*
// Function to handle navigation
async function navigateToPage(page) {
	const route = routes[page];
	if (route) {
		// document.innerHTML = "../templates/base.html";
		try {
			const response = await fetch(route.template);
			if (!response.ok) {
				throw new Error(response.status);
			}
			const data = await response.json();
			// console.log(data);
			document.querySelector("#main__content").innerHTML(data);
		} catch(e) {
			console.error("Error routing:", e);
		}
		// document.querySelector("#main__content").insertAdjacentHTML("afterbegin", route.content);
		document.title = route.title;

		if (route.title === "Login") {
			document.querySelector("#sidebar").classList.add("d-none");
			document.querySelector(".navbar").innerHTML = route.navbar;
			let script = document.createElement('script').setAttribute('src', '../js/login.js');
			script.setAttribute('type', 'module');
			script.setAttribute('id', 'login__script');
			document.head.appendChild(script);
		}
		else if (document.getElementById('login__script')) {
			document.getElementById('login__script').remove();
		}
		history.pushState({ page }, "", page + '.html');
	}
	else {
		document.querySelector("#main__content").innerHTML = "<h2>Page Not Found</h2>";
	}
};

// Event listener for navigation links
document.querySelectorAll(".nav__link").forEach(link => {
	link.addEventListener("click", function() {
		const page = this.value;
		if (!document.cookie.length) {
			navigateToPage(page);
		}
	});
});

window.onpopstate = navigateToPage;
window.route = navigateToPage;

// Initial page load
navigateToPage(window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1, window.location.pathname.lastIndexOf(".")));

export default {
	navigateToPage,
};
*/

/*
// create document click that watches the nav links only
document.querySelectorAll("button").forEach(element => {

	element.addEventListener("click", (e) => {
		e.preventDefault();
		urlRoute(element.value);
	})
});
*/

// create a function that watches the url and calls the urlLocationHandler
function urlRoute(path) {
	console.log('urlRoute');
	urlLocationHandler(path);
	window.history.pushState({}, "", path);
}

// create a function that handles the url location
async function urlLocationHandler(path) {
	console.log('urlLocationHandler ' + path);
	// let location = window.location.pathname; // get the url path
	// erase the path before the file name and erase the extension '.html'
	const location = path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));

	// get the route object from the urlRoutes object
	const route = routes[location];
	// get the html from the template

	try {
		const response = await fetch(route.template);

		window.location.reload();

		/*
		const html = response.text();
		if (location !== "base") {
			// set the content of the content div to the html
			document.getElementById("main__content").innerHTML = html;
			document.getElementById("main__content").classList.remove("d-flex", "align-items-center", "justify-content-center");
		}
		else {
			document.getElementById("main__content").classList.add("d-flex", "align-items-center", "justify-content-center");
		}
		// set the title of the document to the title of the route
		document.title = route.title;
		*/
	} catch (e) {
		// could redirect to a 404 error page
		console.error(e);
	}
}

// add an event listener to the window that watches for url changes
window.onpopstate = urlLocationHandler;

// call the urlLocationHandler function to handle the initial url
// urlLocationHandler("/html/login.html");

export default {
	urlRoute,
	urlLocationHandler,
};
