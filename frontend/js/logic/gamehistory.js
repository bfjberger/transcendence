
function listenerGameHistory(){};

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

		const response = await fetch(hostnameport + '/api/gameshistory/', init);
		
		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}
		else if (response.status === 200)
		{
			var data_json = await response.text()
			// var data_text = await response.text()
			console.log ("OK tu peux travailler " + " " + data_json)
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