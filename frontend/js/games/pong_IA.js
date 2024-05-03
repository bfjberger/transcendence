
function listenerPong_IA() {


};

async function loadPong_IA() {
	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/pong_IA/', init);

		if (response.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}

		const resp = await response.text()
		console.log("loadPong_IA : ", resp)


		return 1;
	} catch (e) {
		console.error("loadPong_IA: " + e);
		return 0;
	}

	return 1

};

export default {
	listenerPong_IA,
	loadPong_IA
};
