var data_list_initiated;
var data_list_received;
var data_list_accepted;
var csrftoken;

function listenerFriends() {

	display()

	const form_post_friend = document.getElementById("form_post_friend")
	form_post_friend.addEventListener("submit", e => {
		e.preventDefault()
		post_friend(form_post_friend)
	});

	const buttons_accept_patch = document.querySelectorAll(".accept_friend_button")
	buttons_accept_patch.forEach(button_accept => {
		button_accept.addEventListener("click", e => {
			e.preventDefault()
			patch_friend_accept(button_accept.value)
		})
	});

	const buttons_delete_friend = document.querySelectorAll(".delete_friend_button")
	buttons_delete_friend.forEach(button_delete => {
		button_delete.addEventListener("click", e => {
			e.preventDefault()
			delete_friend(button_delete.value)
		})
	});
};


async function delete_friend(username) {

	csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({username: username})
	};

	try {
		let hostnameport = "http://" + window.location.host

		const response = await fetch(hostnameport + '/api/friends/delete/', init);

		if (response.status === 403)
		{
			const text = await response.text();
			throw new Error(text);
		}
		else if (response.status === 200)
		{
			//data = await response.json()

			// let json_response = await response.json()


			//console.log("Delete : " + username + " " + json_response)
			window.location.reload()

		}

	} catch (e) {
		console.error("error from post friend : " + e);
	}

}


async function patch_friend_accept(username) {

	csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({username: username})
	};

	try {
		let hostnameport = "http://" + window.location.host

		const response = await fetch(hostnameport + '/api/friends/accept/', init);

		if (response.status === 403)
		{
			const text = await response.text();
			throw new Error(text);
		}
		else if (response.status === 200)
		{
			//data = await response.json()

			let json_response = await response.json()

			window.location.reload()

		}

	} catch (e) {
		console.error("error from post friend : " + e);
	}
}


function display() {

	console.log("path = " + window.location.pathname)
	var parent_list_initiator = document.getElementById("list_friends_initiator")
	var parent_list_received = document.getElementById("list_friends_received")
	var parent_list_accepted = document.getElementById("list_friends_accepted")
	var element_list

	data_list_initiated.forEach(friend => {
		if (friend.accept == false)
		{
			element_list = document.createElement("li")
			element_list.innerHTML = friend.user_received.username + `<button class="btn btn-danger mt-1 delete_friend_button" type="button" value="${friend.id}">Refuser</button> <button class="btn btn-success mt-1 accept_friend_button" type="button" value="${friend.id}">Accepter</button>`
			parent_list_initiator.appendChild(element_list)
		}
		else
		{
			element_list = document.createElement("li")
			element_list.innerHTML = `<p>${friend.user_received.username} <button class="btn btn-danger mt-1 delete_friend_button" type="button" value="${friend.id}">Supprimer</button></p>`
			parent_list_accepted.appendChild(element_list)
		}
	});
		
	data_list_received.forEach(friend => {
		if (friend.accept == false)
		{
			element_list = document.createElement("li")
			element_list.innerHTML = `<p> ${friend.user_initiated.username} <button class="btn btn-danger mt-1 delete_friend_button" type="button" value="${friend.id}">Supprimer</button></p>`
			parent_list_received.appendChild(element_list)
		}
		else
		{
			element_list = document.createElement("li")
			element_list.innerHTML = `<p>${friend.user_received.username} <button class="btn btn-danger mt-1 delete_friend_button" type="button" value="${friend.id}">Supprimer</button></p>`
			parent_list_accepted.appendChild(element_list)
		}
	});

}

async function post_friend(form_post_friend) {

	let form_data = new FormData()
	form_data.append('username', document.getElementById("username").textContent)

	const input = form_post_friend.elements;
	csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({username: input.username.value})
	};

	try {
		let hostnameport = "http://" + window.location.host

		const response = await fetch(hostnameport + '/api/friends/create/', init);

		if (response.status != 200)
		{
			const text = await response.text();
			throw new Error(text);
		}
		else
		{
			var data = await response.text()
			console.log('response = ' + data)
			//window.location.reload()

		}

	} catch (e) {
		console.error("error from post friend : " + e);
	}

}

async function loadFriends() {

	csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "http://" + window.location.host
		const response_list_initiated = await fetch(hostnameport + '/api/friends/?type=initiated', init);
		const response_list_received = await fetch(hostnameport + '/api/friends/?type=received', init)
		//const response_list_accepted = await fetch(hostnameport + '/api/friends/', init)
		if (response_list_initiated.status != 200 || response_list_received.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}
		else
		{
			data_list_initiated = await response_list_initiated.json()
			data_list_received = await response_list_received.json()
			// data_list_accepted = await response_list_accepted.json()
			// data = [{"user_initiated":{"username":"fx"},"user_received":{"username":"qw"},"accept":false}] 
			// [{"user_initiated":{"username":"er"},"user_received":{"username":"fx"},"accept":false}]

			console.log("data = " + data_list_initiated + " " + data_list_received)
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
