
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
		const response = await fetch('http://localhost:7890/api/gamehistory/', init);

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}
		else if (response.status === 200)
		{
			var data = await response.json()
			console.log ("OK tu peux travailler " + data)
		}
		return 1;
	} catch (e) {
		console.error("loadGameHistory: " + e);
		return 0;
	}	

};

export default {
	listenerGameHistory,
	loadGameHistory
};