var data_json


function listenerGameHistory(){
	var parent_list_games = document.getElementById("list_game_history")

	var element_list
	data_json.forEach(game => {
		element_list = document.createElement('li')
		element_list.innerHTML = `<li> ${game.user1.username} ( ${game.score_user1} ) VS ${game.user2.username} (${game.score_user2}) le ${game.date} </li>`
		parent_list_games.appendChild(element_list)
		// console.log ("<li>" + game.user1.username + " ("+ game.score_user1 +")" + " VS " + game.user2.username + " ("+ game.score_user2 +") " + "le " + game.date + "</li>")
	});
};

async function loadGameHistory (){

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "http://" + window.location.host

		const response = await fetch(hostnameport + '/api/gamehistory/', init);
		
		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}
		else if (response.status === 200)
		{
			data_json = await response.json()

			console.log("json data = " + data_json)
		}
		return 1;
	} catch (e) {
		console.error("loadGameHistory Error : " + e);
		return 0;
	}	
};

export default {
	listenerGameHistory,
	loadGameHistory
};