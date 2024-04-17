async function updateNickname(nicknameForm) {

	// remove a potential error message from the field
	document.getElementById("form__update--nickname--msg").textContent = "";
	document.getElementById("form__update--nickname--msg").classList.remove("text-danger");
	document.getElementById("form__update--nickname--msg").classList.remove("text-info");

	const input = nicknameForm.elements;

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({nickname: input.nickname.value}),
		credentials: 'same-origin',
		referrerPolicy: 'same-origin',
	};

	try {
		const response = await fetch('http://localhost:7890/api/profile/', init);

		if (response.status === 400) {
			const error = await response.text();
			document.getElementById("form__update--nickname--msg").textContent = error.replace(/["{}[\]]/g, '');
			document.getElementById("form__update--nickname--msg").classList.add("text-danger");
			return;
		}
		if (response.status === 200) {
			const data = await response.json();

			sessionStorage.setItem("nickname", data.nickname);

			document.getElementById("form__update--nickname--msg").textContent = "Your nickname was successfully updated.";
			document.getElementById("form__update--nickname--msg").classList.remove("text-danger");
			document.getElementById("form__update--nickname--msg").classList.add("text-info");
		}

	} catch (e) {
		console.error(e);
	}
};

async function updatePassword(passwordForm) {

	// remove a potential error message from the field
	document.getElementById("form__update--password--msg").textContent = "";
	document.getElementById("form__update--password--msg").classList.remove("text-danger");
	document.getElementById("form__update--password--msg").classList.remove("text-info");

	const input = passwordForm.elements;

	if (input.password_one.value !== input.password_two.value) {
		document.getElementById("form__update--password--msg").textContent = "The passwords are not the same";
		document.getElementById("form__update--password--msg").classList.add("text-danger");
		return;
	}

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({password: input.password_one.value})
	};

	try {
		const response = await fetch('http://localhost:7890/api/profile/', init);

		if (response.status === 400) {
			const error = await response.text();
			document.getElementById("form__update--password--msg").textContent = error.replace(/["{}[\]]/g, '');
			document.getElementById("form__update--password--msg").classList.add("text-danger");
			return;
		}
		if (response.status === 200) {
			const data = await response.json();

			document.getElementById("form__update--password--msg").textContent = "Your password was successfully updated.";
			document.getElementById("form__update--password--msg").classList.remove("text-danger");
			document.getElementById("form__update--password--msg").classList.add("text-info");
		}
	} catch (e) {
		console.error(e);
	}
};

async function updateAvatar(avatarForm) {

	// remove a potential error message from the field
	document.getElementById("form__update--avatar--msg").textContent = "";
	document.getElementById("form__update--avatar--msg").classList.remove("text-danger");
	document.getElementById("form__update--avatar--msg").classList.remove("text-info");

	const input = avatarForm.elements;

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({avatar: input.avatar.value})
	};

	try {
		const response = await fetch('http://localhost:7890/api/profile/', init);

		if (response.status === 400) {
			const error = await response.text();

			document.getElementById("form__update--avatar--msg").textContent = error.replace(/["{}[\]]/g, '');
			document.getElementById("form__update--avatar--msg").classList.add("text-danger");
			return;
		}
		if (response.status === 200) {
			const data = await response.json();

			sessionStorage.setItem("avatar", data.avatar);

			document.getElementById("form__update--avatar--msg").textContent = "Your avatar was successfully updated.";
			document.getElementById("form__update--avatar--msg").classList.remove("text-danger");
			document.getElementById("form__update--avatar--msg").classList.add("text-info");
		}
	} catch (e) {
		console.error(e);
	}
};

function listenerProfile() {

	const nicknameForm = document.getElementById("form__update--nickname");
	const passwordForm = document.getElementById("form__update--password");
	const avatarForm = document.getElementById("form__update--avatar");

	nicknameForm.addEventListener("submit", e => {
		e.preventDefault();

		updateNickname(nicknameForm);
	});

	passwordForm.addEventListener("submit", e => {
		e.preventDefault();

		updatePassword(passwordForm);
	});

	avatarForm.addEventListener("submit", e => {
		e.preventDefault();

		updateAvatar(avatarForm);
	});
};

async function loadProfile() {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		}
	};

	try {
		const response = await fetch('http://localhost:7890/api/profile/', init);

		if (!response.ok) {
			const text = await response.text();
			throw new Error(text.replace(/["{}[\]]/g, ''));
		}
		const data = await response.json();

		if (data["player"].avatar !== null) {
			sessionStorage.setItem("avatar", data["player"].avatar);
		}
		sessionStorage.setItem("username", data["user"].username);
		sessionStorage.setItem("nickname", data["player"].nickname);

		return 1;
	} catch (e) {
		console.error("loadProfile: " + e);
		return 0;
	}
};

export default {
	listenerProfile,
	loadProfile
};
