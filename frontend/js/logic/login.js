import router from "./router.js"

// Try to connect a user | using GET
async function connectUser(loginForm) {

	// remove a potential error message from the field
	loginForm.querySelector("#form__login--errorMsg").textContent = "";

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
		const response = await fetch('http://localhost:7890/api/login/', init);

		if (response.status === 500) {
			document.querySelector("#form__login--errorMsg").textContent = "Error with the server (DEBUG check the terminal)";
			return;
		}
		if (response.status === 401) {
			const error = await response.text();
			document.querySelector("#form__login--errorMsg").textContent = error.replace(/["{}[\]]/g, '');
			return;
		}
		if (response.status === 202) {
			// login is successful -> redirect to profile
			router("profile");
		}
	} catch (e) {
		console.error("Error connect user: ", e);
	}
}

// Add a new user to the DB | using POST
async function createUser(createAccountForm) {

	// remove a potential error message from the field
	createAccountForm.querySelector("#form__createAccount--errorMsg").textContent = "";

	const input = createAccountForm.elements;

	if (input["password_one"].value !== input["password_two"].value) {
		document.querySelector("#form__createAccount--errorMsg").textContent = "The passwords are not the same";
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
		const response = await fetch('http://localhost:7890/api/register/', init);

		if (response.status === 203) {
			const error = await response.text();
			console.log(error);
			document.querySelector("#form__login--errorMsg").innerHTML = error.replace(/["{}[\]]/g, '');
			return;
		}
		if (response.status === 201) {
			// register is successful -> redirect to profile

			const data = await response.json();

			sessionStorage.setItem("username", data.username);

			router("profile");
		}
	} catch (e) {
		console.error("Error create user: ", e);
	}
}

async function connectUser42() {

	// let loading = document.getElementById("loading");

	// loading.classList.remove("d-none");

	try {
		const response = await fetch('http://localhost:7890/accounts/');

		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}

		console.log("connection with 42 API successful");
		router("profile");
	} catch (e) {
		console.error("Error 42: ", e);
	}
}

function listenerLogin() {

	const login42Btn = document.querySelector("#btn__login--42");

	const loginForm = document.querySelector("#form__login");
	const createAccountForm = document.querySelector("#form__createAccount");

	// Reset all fields (input and error) from the form when the modal pass to hidden
	document.querySelector("#modal__login").addEventListener("hidden.bs.modal", e => {
		e.preventDefault();

		loginForm.querySelectorAll(".input__field").forEach(inputElement => {
			inputElement.value = "";
			inputElement.parentElement.querySelector(".form__input--errorMsg").textContent = "";
			loginForm.querySelector("#form__login--errorMsg").textContent = "";
		});
	});

	// Reset all fields (input and error) from the form when the modal pass to hidden
	document.querySelector("#modal__createAccount").addEventListener("hidden.bs.modal", e => {
		e.preventDefault();

		createAccountForm.querySelectorAll(".input__field").forEach(inputElement => {
			inputElement.value = "";
			inputElement.parentElement.querySelector(".form__input--errorMsg").textContent = "";
			createAccountForm.querySelector("#form__createAccount--errorMsg").textContent = "";
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

function loadLogin() {

	return 1;
};

export default {

	listenerLogin,
	loadLogin
};
