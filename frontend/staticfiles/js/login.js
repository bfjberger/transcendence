import urlHandler from "./router.js";

// add the field credentials: "same-origin" to the init object to send with the request the cookies

// Try to connect a user | using GET
// USE ANOTHER URL
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
		const response = await fetch('http://localhost:7890/api/login/', init); // will use another URL

		if (response.status === 201) {
			const error = await response.text();
			document.querySelector("#form__login--errorMsg").textContent = error.replace(/["{}[\]]/g, '');
			return;
		}
		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}
		if (response.status === 202) {
			console.log(response);
			console.log('document.cookie: ' + document.cookie);
			const data = await response.text();
			urlHandler.urlRoute("frontend/staticfiles/html/profile.html");
		}
	} catch (e) {
		console.error("Error connect user: ", e);
	}
}

// Add a new user to the DB | using
// For now not working but expected to work
// in the header 'charset=UTF-8' is not necessary for it to work
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
		if (response.status === 401) {
			const error = await response.text();
			document.querySelector("#form__login--errorMsg").textContent = error.replace(/["{}[\]]/g, '');
			return;
		}
		if (!response.ok) {
			throw new Error(response.status);
		}
		if (response.status === 202) {
			const data = await response.text();
			console.log(data);
			urlRoute("frontend/staticfiles/html/profile.html");
		}
	} catch (e) {
		console.error("Error create user: ", e);
	}
}

async function connectUser42() {

	let loading = document.getElementById("loading");

	loading.classList.remove("d-none");
}

document.addEventListener("DOMContentLoaded", () => {

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

	// Login with 42 handler
	login42Btn.addEventListener("click", e => {
		e.preventDefault();

		connectUser42();
	})

	document.querySelector("#form__login--btn").addEventListener("click", e => {
		e.preventDefault();

		connectUser(loginForm);
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
});