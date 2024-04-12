async function updateNickname(nicknameForm) {

	// remove a potential error message from the field
	// nicknameForm.querySelector(".form__update--nickname--errorMsg").textContent = "";

	const input = nicknameForm.elements;

	console.log("input nickname: " + input.nickname.value);

	const init = {
		method: 'PATCH',
		headers: {'Content-Type': 'applications/json'},
		body: JSON.stringify(input.nickname.value)
	};

	try {
		const response = await fetch('http://localhost:7890/api/profile/', init);

	} catch (e) {
		console.error(e);
	}
};

async function updatePassword(passwordForm) {

	// remove a potential error message from the field
	// passwordForm.querySelector(".form__update--password--errorMsg").textContent = "";

	const input = passwordForm.elements;

	console.log("input password: " + input.password_one.value + " " + input.password_two.value);

	if (input.password_one.value !== input.password_two.value) {
		passwordForm.querySelector(".form__update--password--errorMsg").textContent = "The passwords are not the same";
		return;
	}

	const init = {
		method: 'PATCH',
		headers: {'Content-Type': 'applications/json'},
		body: JSON.stringify(input.password_one.value)
	};

	try {
		const response = await fetch('http://localhost:7890/api/profile/', init);

	} catch (e) {
		console.error(e);
	}
};

async function updateAvatar(avatarForm) {

	// remove a potential error message from the field
	// avatarForm.querySelector(".form__update--avatar--errorMsg").textContent = "";

	const input = avatarForm.elements;

	console.log("input avatar: " + input.avatar.value);

	const init = {
		method: 'PATCH',
		headers: {'Content-Type': 'applications/json'},
		body: JSON.stringify(input.avatar.value)
	};

	try {
		const response = await fetch('http://localhost:7890/api/profile/', init);

	} catch (e) {
		console.error(e);
	}
};

export default function handleProfile() {

	const nicknameForm = document.querySelector("#form__update--nickname");
	const passwordForm = document.querySelector("#form__update--password");
	const avatarForm = document.querySelector("#form__update--avatar");

	nicknameForm.addEventListener("submit", e => {
		e.preventDefault();

		console.log('nick');
		updateNickname(nicknameForm);
	});

	passwordForm.addEventListener("submit", e => {
		e.preventDefault();

		console.log('pass');
		updatePassword(passwordForm);
	});

	avatarForm.addEventListener("submit", e => {
		e.preventDefault();

		console.log('avatar');
		updateAvatar(avatarForm);
	});
};
