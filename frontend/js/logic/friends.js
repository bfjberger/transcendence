var g_data_sent;
var g_data_received;
var g_data_sent_accepted;
var g_data_received_accepted;

var g_el_sent;
var g_el_received;
var g_el_accepted;

var csrftoken;

function fillFriendsSent() {

	var element;

	for (const [index, friend] of g_data_sent.entries()) {
		element = document.createElement("div");
		element.id = `friends__sent--${index}`;
		element.className = "row align-items-center py-3";
		element.innerHTML = `
				<div class="col-7">
					${friend.user_received.username}
				</div>
				<div class="col-5">
					<button class="btn btn-danger mt-1 delete_friend_button" type="button" value="${friend.user_received.username}">
						Supprimer
					</button>
				</div>
			`;
		g_el_sent.appendChild(element);
	};
};

function fillFriendsReceived() {

	var element;

	for (const [index, friend] of g_data_received.entries()) {
		element = document.createElement("div");
		element.id = `friends__received--${index}`;
		element.className = "row align-items-center py-3";
		element.innerHTML = `
				<div class="col-6">
					${friend.user_initiated.username}
				</div>
				<div class="col-3">
					<button class="btn btn-danger mt-1 delete_friend_button" type="button" value="${friend.user_initiated.username}">
						Refuser
					</button>
				</div>
				<div class="col-3">
					<button class="btn btn-success mt-1 accept_friend_button" type="button" value="${friend.user_initiated.username}">
						Accepter
					</button>
				</div>
			`;
		g_el_received.appendChild(element);
	};
};

function fillFriendsAccepted() {

	var element;

	for (const [index, friend] of g_data_sent_accepted.entries()) {
		element = document.createElement("div");
		element.id = `friends__accepted--${index}`;
		element.className = "row align-items-center py-3";
		element.innerHTML = `
				<div class="col-7">
					${friend.username} | ${friend.status}
				</div>
				<div class="col-5">
					<button class="btn btn-danger mt-1 delete_friend_button" type="button" value="${friend.username}">
						Supprimer
					</button>
				</div>
			`;
		g_el_accepted.appendChild(element);
	};

	for (const [index, friend] of g_data_received_accepted.entries()) {
		element = document.createElement("div");
		element.id = `friends__accepted--${index}`;
		element.className = "row align-items-center py-3";
		element.innerHTML = `
				<div class="col-7">
					${friend.username} | ${friend.status}
				</div>
				<div class="col-5">
					<button class="btn btn-danger mt-1 delete_friend_button" type="button" value="${friend.username}">
						Supprimer
					</button>
				</div>
			`;
		g_el_accepted.appendChild(element);
	};
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
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/friends/delete/', init);

		if (response.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}
		else {
			let json_response = await response.json();
			window.location.reload();
		}

	} catch (e) {
		console.error("error from post friend : " + e);
	}
};

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
		let hostnameport = "https://" + window.location.host;
		const response = await fetch(hostnameport + '/api/friends/accept/', init);

		if (response.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}
		else {
			let json_response = await response.json();
			window.location.reload();
		}

	} catch (e) {
		console.error("error from post friend : " + e);
	}
};

async function post_friend(form_post_friend) {

	// remove a potential error message from the placeholder
	document.getElementById("form__add--friend--msg").textContent = "";

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
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/friends/create/', init);

		if (response.status != 201) {
			const text = await response.text();

			document.getElementById("form__add--friend--msg").textContent = text.replace(/["{}[\]]/g, '');
			document.getElementById("form__add--friend--msg").classList.add("text-danger");
			// throw new Error(text);
		}
		else {
			var data = await response.text();
			window.location.reload();
		}
	} catch (e) {
		console.error("error from post friend : " + e);
	}
};

function listenerFriends() {

	g_el_sent = document.getElementById("friends__sent--main");
	g_el_received = document.getElementById("friends__received--main");
	g_el_accepted = document.getElementById("friends__accepted--main");

	fillFriendsSent();
	fillFriendsReceived();
	fillFriendsAccepted();

	const form_post_friend = document.getElementById("form__add--friend");
	form_post_friend.addEventListener("submit", e => {
		e.preventDefault();

		post_friend(form_post_friend);
	});

	const buttons_accept_patch = document.querySelectorAll(".accept_friend_button");
	buttons_accept_patch.forEach(button_accept => {
		button_accept.addEventListener("click", e => {
			e.preventDefault();

			patch_friend_accept(button_accept.value);
		})
	});

	const buttons_delete_friend = document.querySelectorAll(".delete_friend_button");
	buttons_delete_friend.forEach(button_delete => {
		button_delete.addEventListener("click", e => {
			e.preventDefault();

			delete_friend(button_delete.value);
		})
	});
};

async function loadFriends() {

	csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		let hostnameport = "https://" + window.location.host
		const response_list_initiated = await fetch(hostnameport + '/api/friends/?type=initiated', init);
		const response_list_received = await fetch(hostnameport + '/api/friends/?type=received', init)
		const response_list_initiated_accepted = await fetch(hostnameport + '/api/friends/?type=initiated_accpeted', init)
		const response_list_received_accepted = await fetch(hostnameport + '/api/friends/?type=received_accepted', init)

		if (response_list_initiated.status != 200 || response_list_received.status != 200 || response_list_initiated_accepted.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}
		else {
			g_data_sent = await response_list_initiated.json()
			g_data_received = await response_list_received.json()
			g_data_sent_accepted = await response_list_initiated_accepted.json()
			g_data_received_accepted = await response_list_received_accepted.json()
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
