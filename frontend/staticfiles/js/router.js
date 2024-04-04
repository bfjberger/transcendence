const routes = {
	"main.html": {
		title: "Main Page",
		content: '../templates/main.html'
	},
	"profile.html": {
		title: "Profile",
		content: '../templates/profile.html'
	},
	"twoplayers.html": {
		title: "Two Players Game",
		content: '../templates/twoplayers.html'
	},
	"fourplayers.html": {
		title: "Four Players Game",
		content: '../templates/fourplayers.html'
	},
	"tournament.html": {
		title: "Tournament",
		content: '../templates/tournament.html'
	},
	"friends.html": {
		title: "Friends",
		content: '../templates/friends.html'
	},
	"login.html": {
		title: "Login",
		content: '../templates/login.html',
		navbar: `<div class="col-md-1 d-flex justify-content-center">
					<img src="../img/42_logo.svg" alt="logo 42" width="42" height="30"/>
				</div>
				<div class="col-md-10"></div>
				<div class="col-md-1 text-end pe-3">
					<img src="../img/person-circle-Bootstrap.svg" alt="user" width="30" height="30" class="rounded-circle"/>
				</div>`
	}
};

// Function to handle navigation
function navigateToPage(page) {
	const route = routes[page];
	if (route) {
		document.innerHTML = "../templates/base.html";
		document.querySelector("#main__content").insertAdjacentHTML("afterbegin", route.content);
		document.title = route.title; // Update page title
		if (route.title === "Login") {
			document.querySelector("#sidebar").classList.add("d-none");
			document.querySelector(".navbar").innerHTML = route.navbar;
		}
		history.pushState({ page }, "", page); // Update URL
	}
	else {
		document.querySelector("#main__content").innerHTML = "<h2>Page Not Found</h2>";
	}
}

// Event listener for navigation links
document.querySelectorAll(".nav__link").forEach(link => {
	link.addEventListener("click", function() {
		const page = this.value;
		navigateToPage(page);
	});
});

window.onpopstate = navigateToPage;
window.route = navigateToPage;

// Initial page load
navigateToPage("login.html");