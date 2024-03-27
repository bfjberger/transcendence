window.onload = function()
{

	const path = window.location.pathname.split("/");

	switch(path[4])
	{
		case "twoplayers.html":
		{
			loadPage("twoplayers.html");
			break;
		}
		case "fourplayers.html":
		{
			loadPage("fourplayers.html");
			break;
		}
		default:
			{
				loadPage("home.html");
				break;
			}
		}

	document.querySelectorAll(".menu__item").forEach((item) =>
	{
		item.addEventListener("click", function()
		{
			const path = item.getAttribute("value");
			loadPage(path + ".html");

			window.history.pushState("", "", path + ".html");
		});
	});

	function loadPage($path)
	{
		if ($path == "")
			return;

		const container = document.getElementById("container__test");

		fetch("" + $path)
		.then(response => {
			if (!response.ok) {
				throw new Error("Network response was not ok.");
			}
			return response.text();
		})
		.then(html => {
			if ($path === "fourplayers.html") {
				var header = document.getElementsByTagName('head');
				let gameScript = document.createElement('script');
				gameScript.type = 'module';
				gameScript.src = '../../js/games/pong4players.js';
				gameScript.defer = true;
				header[0].appendChild(gameScript);
				// let title = document.createElement('title');
				// title = "Pong Game";
				// header[0].appendChild(title);
			}
			if ($path === "twoplayers.html") {
				var header = document.getElementsByTagName('head');
				let gameScript = document.createElement('script');
				gameScript.type = 'module';
				gameScript.src = '../../js/games/pong2players.js';
				gameScript.defer = true;
				header[0].appendChild(gameScript);
				// let title = document.createElement('title');
				// title = "Pong Game";
				// header[0].appendChild(title);
			}
			if ($path === "home.html") {
				// var header = document.getElementsByTagName('head');
				// let title = document.createElement('title');
				// title = "Main Page";
				// header[0].append(title);
			}
			if ($path !== "home.html") {
				container.innerHTML = html;
			}
			// document.title = $path.replace(".html", "");
		})
		.catch(error => {
			console.error("Fetch error:", error);
		});
	}
}