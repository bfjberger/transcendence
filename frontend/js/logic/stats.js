var g_games_2p;
var g_ratio_2p;
var g_points_2p;
var g_games_4p;
var g_ratio_4p;
var g_points_4p;
var g_tournament_win;
var g_tournament_matchs_win;
var g_tournament_points;

var csrftoken;

function listenerStats() {

	let ratioGlobal;
	if (g_ratio_2p === "no data" && g_ratio_4p === "no data") {
		ratioGlobal = "no data";
	}
	else if (g_ratio_2p === "no data") {
		ratioGlobal = Number(g_ratio_4p) + "%";
		g_ratio_4p = g_ratio_4p.toFixed(2) + "%";
	}
	else if (g_ratio_4p === "no data") {
		ratioGlobal = Number(g_ratio_2p) + "%";
		g_ratio_2p = g_ratio_2p.toFixed(2) + "%";
	}
	else {
		ratioGlobal = ((Number(g_ratio_2p) + Number(g_ratio_4p)) / 2).toFixed(2) + "%";
		g_ratio_2p = g_ratio_2p + "%";
		g_ratio_4p = g_ratio_4p + "%";
	}

	document.getElementById("stats__global--played").textContent = g_games_2p + g_games_4p;
	document.getElementById("stats__global--wlrate").textContent = ratioGlobal;
	document.getElementById("stats__global--points").textContent = g_points_2p + g_points_4p;
	document.getElementById("stats__2player--played").textContent = g_games_2p;
	document.getElementById("stats__2player--wlrate").textContent = g_ratio_2p;
	document.getElementById("stats__2player--points").textContent = g_points_2p;
	document.getElementById("stats__4player--played").textContent = g_games_4p;
	document.getElementById("stats__4player--wlrate").textContent = g_ratio_4p;
	document.getElementById("stats__4player--points").textContent = g_points_4p;
	document.getElementById("stats__tournament--nbwin").textContent = g_tournament_win;
	document.getElementById("stats__tournament--matchwin").textContent = g_tournament_matchs_win;
	document.getElementById("stats__tournament--points").textContent = g_tournament_points;

	document.getElementById("stats__username").textContent = sessionStorage.getItem("username") ?
		sessionStorage.getItem("username") : "user";
};

async function loadStats() {

	csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {

		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/stats/', init);

		if (!response.ok) {
			const text = await response.text();
			throw new Error(text.replace(/["{}[\]]/g, ''));
		}
		const data = await response.json();

		g_games_2p = data["stats"].nb_games_2p;
		if (g_games_2p !== 0)
			g_ratio_2p = Number(((data["stats"].nb_games_2p_won / g_games_2p) * 100).toFixed(2));
		else
			g_ratio_2p = "no data";
		g_games_4p = data["stats"].nb_games_4p;
		if (g_games_4p !== 0)
			g_ratio_4p = Number(((data["stats"].nb_games_4p_won / g_games_4p) * 100).toFixed(2));
		else
			g_ratio_4p = "no data";
		g_points_2p = data["stats"].nb_points_2p;
		g_points_4p = data["stats"].nb_points_4p;
		g_tournament_win = data["tournament"].nb_win;
		g_tournament_matchs_win = data["tournament"].match_win;
		g_tournament_points = data["stats"].nb_points_tournament;

		return 1;
	} catch (e) {
		console.error("loadStats: " + e);
		return 0;
	}
};

export default {
	listenerStats,
	loadStats
};
