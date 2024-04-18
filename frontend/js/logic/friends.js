var data

function listenerFriends() {

	display()


	const form_post_friend = document.getElementById("form_post_friend")
	form_post_friend.addEventListener("submit", e => {
		e.preventDefault()
		post_friend(form_post_friend)
	});

};

function display()
{
	console.log("path = " + window.location.pathname)
	var parent_list_initiator = document.getElementById("list_friends_initiator")
	var element_list
	data["friends_initiated"].forEach(friend => {
		element_list = document.createElement("li")
		element_list.textContent = friend
		parent_list_initiator.appendChild(element_list)
		// console.log("relation initiated : " + friend)
	});

	var parent_list_received = document.getElementById("list_friends_received")
	data["friends_received"].forEach(friend => {
		element_list = document.createElement("li")
		element_list.innerHTML = friend + `<button class="btn btn-danger mt-1 refuse_friend_button" type="button">Refuse</button> <button class="btn btn-success mt-1 accept_friend_button" type="button">Accept</button>`
		parent_list_received.appendChild(element_list)
		// console.log("relation received : " + friend)
	});

	var parent_list_accepted = document.getElementById("list_friends_accepted")
	data["friends_accepted"].forEach(friend => {
		element_list = document.createElement("li")
		element_list.textContent = friend
		parent_list_accepted.appendChild(element_list)
		// console.log("relation accepted : " + friend)
	});
}

async function post_friend(form_post_friend)
{
	let form_data = new FormData()
	form_data.append('username', document.getElementById("username").textContent)

	const input = form_post_friend.elements;


	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({username: input.username.value})
	};

	try {
		const response = await fetch('http://localhost:7890/api/friends/', init);

		if (response.status === 403) 
		{
			const text = await response.text();
			throw new Error(text);
		}
		else if (response.status === 201)
		{
			//data = await response.json()
			console.log('success')
			window.location.reload()

		}
		else if (response.status === 203)
		{
			console.log("PAS OK POUR LA DEMANDE D AMI" + await response.json())
		}

	} catch (e) {
		console.error("error from post friend : " + e);
	}

}

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
