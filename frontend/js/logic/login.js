import router from "./router.js"
import { connect_socket_friend } from "./friends.js";

async function connectUser(loginForm) {

	// remove a potential error message from the field
	document.getElementById("form__login--errorMsg").textContent = "";

	const input = loginForm.elements;

	const inputValues = {
		username: input.username.value,
		password: input.password.value,
	};

	 const init = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(inputValues)
	};

	try {

		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/login/', init); // will use another URL

		if (!response.ok || response.status === 203) {
			const error = await response.text();
			document.getElementById("form__login--errorMsg").textContent = error.replace(/["{}[\]]/g, '').split(":")[1];
			return;
		}
		if (response.status === 202) {
			// login is successful -> redirect to profile

			const data = await response.json();

			sessionStorage.setItem("username", data["username"]);
			sessionStorage.setItem("avatar", data["player"].avatar);
			sessionStorage.setItem("nickname", data["player"].nickname);

			document.querySelector("div.modal-backdrop.fade.show").remove();
			document.querySelectorAll(".dropdown-item").forEach(btn => {
				btn.removeAttribute("disabled");
			});
			document.getElementById("topbar__profile--username").removeAttribute("disabled");
			document.getElementById("topbar__logout").removeAttribute("disabled");
			connect_socket_friend();
			router("index");
		}
	} catch (e) {
		console.error("Error connect user: ", e);
	}
};

async function createUser(createAccountForm) {

	// remove a potential error message from the field
	document.getElementById("form__createAccount--msg").textContent = "";

	const input = createAccountForm.elements;

	if (input["password_one"].value !== input["password_two"].value) {
		document.getElementById("form__createAccount--msg").textContent = "Les mots de passe ne correspondent pas.";
		document.getElementById("form__createAccount--msg").classList.add("text-danger");
		document.getElementById("form__createAccount--msg").classList.remove("text-success");
		return;
	}

	const inputValues = {
		username: input.username.value,
		password: input.password_one.value,
		email: input.email.value,
	};

	const init = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(inputValues)
	};

	try {
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/register/', init);

		if (!response.ok || response.status == 500) {
			document.getElementById("form__createAccount--msg").textContent = "Erreur " + response.status;
			document.getElementById("form__createAccount--msg").classList.add("text-danger");
			document.getElementById("form__createAccount--msg").classList.remove("text-success");
		}
		else if (response.status == 203) {
			var errorMsg = await response.text();
			console.log(errorMsg)
			errorMsg = JSON.parse(errorMsg);
			console.log(errorMsg)
			document.getElementById("form__createAccount--msg").textContent = Object.keys(errorMsg)[0] + " : " + Object.values(errorMsg)[0];
			document.getElementById("form__createAccount--msg").classList.add("text-danger");
			document.getElementById("form__createAccount--msg").classList.remove("text-success");
		}
		else if (response.status === 201) {
			document.getElementById("form__createAccount--msg").textContent = "Ton compte à été créé ! Tu peux te logger.";
			document.getElementById("form__createAccount--msg").classList.remove("text-danger");
			document.getElementById("form__createAccount--msg").classList.add("text-success");
		}
	} catch (e) {
		console.error("Error create user: ", e);
	}
};

async function connectUser42() {

	try {

		let hostnameport = "https://" + window.location.host

		const response = await fetch(hostnameport + '/api/accounts/');

		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}

		const address = await response.json();

		window.location.href = address;
		// waitFor42();
	} catch (e) {
		console.error("Error 42: ", e);
	}
};

function listenerLogin() {

	const login42Btn = document.querySelector("#btn__login--42");

	const loginForm = document.querySelector("#form__login");
	const createAccountForm = document.querySelector("#form__createAccount");

	// Reset all fields (input and error) from the form when the modal pass to hidden
	document.getElementById("modal__login").addEventListener("hidden.bs.modal", e => {
		e.preventDefault();

		loginForm.querySelectorAll(".input__field").forEach(inputElement => {
			inputElement.value = "";
			inputElement.parentElement.querySelector(".form__input--errorMsg").textContent = "";
			document.getElementById("form__login--errorMsg").textContent = "";
		});
	});

	// Reset all fields (input and error) from the form when the modal pass to hidden
	document.getElementById("modal__createAccount").addEventListener("hidden.bs.modal", e => {
		e.preventDefault();

		createAccountForm.querySelectorAll(".input__field").forEach(inputElement => {
			inputElement.value = "";
			inputElement.parentElement.querySelector(".form__input--errorMsg").textContent = "";
			document.getElementById("form__createAccount--msg").textContent = "";
		});
	});

	// Login via "normal" account handler
	loginForm.addEventListener("submit", e => {
		e.preventDefault();
		connectUser(loginForm);
	});

	// Create account handler
	createAccountForm.addEventListener("submit", e => {
		e.preventDefault();
		createUser(createAccountForm);
	});

	// Login with 42 handler
	login42Btn.addEventListener("click", e => {
		e.preventDefault();
		connectUser42();
	});
};

async function loadLogin() {

	document.querySelectorAll(".dropdown-item").forEach(btn => {
		btn.setAttribute("disabled", true);
	});
	document.getElementById("topbar__profile--username").setAttribute("disabled", true);
	document.getElementById("topbar__logout").setAttribute("disabled", true);

	try {
		let hostnameport = "https://" + window.location.host
		const response = await fetch(hostnameport + '/api/index/');

		if (response.status === 202) {

			document.querySelectorAll(".dropdown-item").forEach(btn => {
				btn.removeAttribute("disabled");
			});
			document.getElementById("topbar__profile--username").removeAttribute("disabled");
			document.getElementById("topbar__logout").removeAttribute("disabled");

			router("index");
		}
		return 1;
	} catch (e) {
		console.error(e);
	}
};

export default {
	listenerLogin,
	loadLogin
};
