// Redirection on the first page
// If the user is connected -> redirect to profile
// If the user is not connected -> redirect to login
document.addEventListener("load", () => {

	try {
		const response = await fetch('');

		if (response.status === 202) {
			
		}
	} catch (e) {
		console.error(e);
	}

	if (window.location.pathname.search("index")) {
		if () {
			console.log("not yet logged");
			urlRoute("frontend/login.html");
		}
		else {
			console.log("already logged");
			urlRoute("frontend/html/profile.html");
		}
	}
});