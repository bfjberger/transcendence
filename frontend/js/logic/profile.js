var games_2p;
var ratio_2p;
var games_4p;
var ratio_4p;

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

function updateStats() {

	const ratioGlobal = (Number(ratio_2p) + Number(ratio_4p)) / 2;

	document.getElementById("collapse__myStats--global--played").textContent = games_2p + games_4p;
	document.getElementById("collapse__myStats--global--wlrate").textContent = ratioGlobal.toFixed(2) + "%";
	// document.getElementById("collapse__myStats--global--points").textContent = ;
	document.getElementById("collapse__myStats--2player--played").textContent = games_2p;
	document.getElementById("collapse__myStats--2player--wlrate").textContent = ratio_2p + "%";
	// document.getElementById("collapse__myStats--2player--points").textContent = ;
	document.getElementById("collapse__myStats--4player--played").textContent = games_4p;
	document.getElementById("collapse__myStats--4player--wlrate").textContent = ratio_4p + "%";
	// document.getElementById("collapse__myStats--4player--points").textContent = ;
	// document.getElementById("collapse__myStats--tournament--best").textContent = ;
	document.getElementById("collapse__myStats--tournament--matchwin").textContent = "%";
	// document.getElementById("collapse__myStats--tournament--points").textContent = ;
};

function listenerProfile() {

	updateStats();

	const nicknameForm = document.getElementById("form__update--nickname");
	const passwordForm = document.getElementById("form__update--password");
	const avatarForm = document.getElementById("form__update--avatar");

	const collapseStats = document.getElementById("collapse__myStats");
	const collapseUpdate = document.getElementById("collapse__updateProfile");

	collapseStats.addEventListener("show.bs.collapse", e => {

		collapseUpdate.classList.replace("show", "collapsing");
		collapseUpdate.classList.remove("collapsing");
	});

	collapseUpdate.addEventListener("show.bs.collapse", e => {

		collapseStats.classList.replace("show", "collapsing");
		collapseStats.classList.remove("collapsing");
	});

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

		games_2p = data["player"].nb_games_2p;
		if (data["player"].nb_games_2p_lost !== 0)
			ratio_2p = ((data["player"].nb_games_2p_won / data["player"].nb_games_2p) * 100).toFixed(2);
		else
			ratio_2p = 100;
		games_4p = data["player"].nb_games_4p;
		if (data["player"].nb_games_4p !== 0)
			ratio_4p = ((data["player"].nb_games_4p_won / data["player"].nb_games_4p) * 100).toFixed(2);
		else
			ratio_4p = 100;

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
