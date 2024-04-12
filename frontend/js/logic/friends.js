function listenerFriends() {

};

async function loadFriends() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		const response = await fetch('http://localhost:7890/api/friends/', init);

		if (response.status === 403) {
			const text = await response.text();
			throw new Error(text);
		}
		console.log(response.status);
		return 1;
	} catch (e) {
		console.error("loadFriends: " + e);
		return 0;
	}
};

export default {
	listenerFriends,
	loadFriends
};
