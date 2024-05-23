var g_data_sent;
var g_data_received;
var g_data_sent_accepted;
var g_data_received_accepted;

var g_el_sent;
var g_el_received;
var g_el_accepted;

var csrftoken;
var g_username;
var g_socket_friend;

function showFirendNotificationToast(message) {

	let id = new Date().getTime();
	let toastElement = `
			<div id=${id} class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="background-color: lightgoldenrodyellow">
				<div class="toast-header">
					<strong>AMIS</strong>
					<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div class="toast-body">${message}</div>
			</div>
		`;

	let toastNode = document.createElement("div");
	toastNode.innerHTML = toastElement;

	document.querySelector("#container__toast").appendChild(toastNode);

	const toast = new bootstrap.Toast(document.getElementById(id));
	toast.show();
};

async function get_username() {
	const response = await fetch('/api/friends/getUserName/')
	if (!response.ok) {
		const text = await response.text();
		return "";
	}
	const data = await response.json();
	return data;
}

export async function connect_socket_friend() {
	if (sessionStorage.getItem("username") === null) {
		return;
	}
	const username = await get_username();

	if (username === "") {
		return;
	}

	if (g_socket_friend && g_socket_friend.readyState === WebSocket.OPEN) {
		return;
	}
	var socket = new WebSocket(`wss://${window.location.host}/wss/notifications/` + username + "/");
	console.log("socket: ", socket);
	g_socket_friend = socket;

	socket.onopen = function(event) {
	  console.log('WebSocket connection opened');
	};

	socket.onmessage = function(event) {
	  console.log('Message from server: ' + event.data);
	  var data = JSON.parse(event.data);
	  if (data.type === 'notification') {
		// window.alert(data.message);
		showFirendNotificationToast(data.message);
	  }
	};

	socket.onerror = function(event) {
	  console.error('WebSocket error: ' + event);
	};

	socket.onclose = function(event) {
		// window.alert("WebSocket connection closed, trying to reconnect in 5 seconds...");
	  console.log('WebSocket connection closed, trying to reconnect in 5 seconds...');
	  setTimeout(connect_socket_friend, 5000);
	};
}

connect_socket_friend();



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
					<button class="btn btn-danger mt-1 refuse_friend_button" type="button" value="${friend.user_initiated.username}">
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
					<img src=${friend.avatar} class="rounded-circle" alt="${friend.username} avatar" width="30" height="30" />
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
					<img src=${friend.avatar} class="rounded-circle" alt="${friend.username} avatar" width="30" height="30" />
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
			g_username = await get_username();
			var message = {
				type: "friend_deleted",
				from: username,
				to: g_username,
			};
			g_socket_friend.send(JSON.stringify(message));
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
			g_username = await get_username();
			var message = {
				type: "friend_request_accepted",
				from: username,
				to: g_username,
			};
			g_socket_friend.send(JSON.stringify(message));
			window.location.reload();
		}

	} catch (e) {
		console.error("error from post friend : " + e);
	}
};

async function patch_friend_refuse(username) {

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
		const response = await fetch(hostnameport + '/api/friends/refuse/', init);

		if (response.status != 200) {
			const text = await response.text();
			throw new Error(text);
		}
		else {
			let json_response = await response.json();
			g_username = await get_username();
			var message = {
				type: "friend_request_refused",
				from: username,
				to: g_username,
			};
			g_socket_friend.send(JSON.stringify(message));
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
	console.log("target_username: " + input.username.value);

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
			g_username = await get_username();

			var message = {
				type: "friend_request",
				from: g_username,
				to: input.username.value,
			};
			g_socket_friend.send(JSON.stringify(message));

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

	const button_refuse_patch = document.querySelectorAll(".refuse_friend_button");
	button_refuse_patch.forEach(button_refuse => {
		button_refuse.addEventListener("click", e => {
			e.preventDefault();

			patch_friend_refuse(button_refuse.value);
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

		if (response_list_initiated.status != 200
			|| response_list_received.status != 200
			|| response_list_initiated_accepted.status != 200
			|| response_list_received_accepted.status != 200) {

			throw new Error("issue loading friend");
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
