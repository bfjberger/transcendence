class Router {
	constructor(routes) {
		this.routes = routes;
		this.loadRoute(window.location.pathname);
	}

	// Match the current URL with one of our written routes
	matchUrlToRoute(urlSegment) {
		const matchedRoute = this.routes.find(route => route.path === urlSegment);
		return matchedRoute;
	}

	// Take the URL segments, find a matching route and call his callback if the route has one
	loadRoute(urlSegment) {
		const matchedRoute = this.matchUrlToRoute(urlSegment);
		if (!matchedRoute) {
			throw new Error('Route not found');
		}
		matchedRoute.callback();
	}

	// Enable navigation and interaction with the history
	navigateTo(path) {
		window.history.pushState("", "", path);
		this.loadRoute(path);
		window.location.reload();
	}
}

const routes = [
	{ path: '/staticfiles/index.html', callback: () => {
		document.title = "Main Page";
	}},
	{ path: '/staticfiles/html/profile.html', callback: () => {
		document.title = "Profile";
	}},
	{ path: '/staticfiles/html/friends.html', callback: () => {
		document.title = "Friends";
	}},
	{ path: '/staticfiles/html/tournament.html', callback: () => {
		document.title = "Tournament";
	}},
	{ path: '/staticfiles/html/fourplayers.html', callback: () => {
		document.title = "Four Players Game";
	}},
	{ path: '/staticfiles/html/twoplayers.html', callback: () => {
		document.title = "Two Players Game";
	}}
];

document.addEventListener('DOMContentLoaded', function() {

	const router = new Router(routes);

	document.querySelectorAll(".link__item").forEach(btn => {
		btn.addEventListener("click", e => {
			e.preventDefault();
			router.navigateTo(btn.value);
		})
	});

	window.addEventListener("popstate", () => {
		router.loadRoute(window.location.pathname);
	})
})