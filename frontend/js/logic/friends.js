var data

function listenerFriends() {

		console.log(window.location.pathname)
		var parent_list = document.getElementById("list_friends_initiator")
		var element_list
		data["friends_initiated"].forEach(friend => {
			element_list = document.createElement("li")
			element_list.textContent = friend
			parent_list.appendChild(element_list)
			console.log("relation : " + friend)
		});

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
		else if (response.status === 200)
		{
			data = await response.json()

			console.log(data['friends_initiated']);
			console.log(typeof(data['friends_initiated']));

		}
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
