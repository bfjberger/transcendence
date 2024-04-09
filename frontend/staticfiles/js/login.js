// import navigateToPage from "./router.js";

// Try to connect a user | using GET
// USE ANOTHER URL
async function connectUser(loginForm) {

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
		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}
		if (response.status === 202) {
			console.log(response);
			// console.log('cookie: ' + document.cookie);
			const data = await response.json();
			// if (!document.cookie.length) {
			// 	navigateToPage("index");
			// }
		}
	} catch (e) {
		console.error("Error connect user: ", e);
	}
}

// Add a new user to the DB | using 
// For now not working but expected to work
// in the header 'charset=UTF-8' is not necessary for it to work
async function createUser(createAccountForm) {

	const input = createAccountForm.elements;

	if (input["password_one"].value !== input["password_two"].value) {
		document.querySelector("#login_error_message_create").textContent = "The passwords are not the same";
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
		if (!response.ok) {
			throw new Error(response.status);
		}
		const data = await response.json();
		window.alert("You have been registered. You are now logged " + data.message);
	} catch (e) {
		console.error("Error create user: ", e);
	}
}

async function connectUser42() {

	let loading = document.getElementById("loading");

	loading.classList.remove("d-none");
}

document.addEventListener("DOMContentLoaded", () => {

	const loginBtn = document.querySelector("#btn__login");
	const createAccountBtn = document.querySelector("#btn__createAccount");
	const login42Btn = document.querySelector("#btn__login--42");

	const loginForm = document.querySelector("#form__login");
	const createAccountForm = document.querySelector("#form__createAccount");

	loginBtn.addEventListener("click", e => {
		e.preventDefault();

		// reset all fields
		loginForm.querySelectorAll(".input__field").forEach(inputElement => {
			inputElement.value = "";
			inputElement.parentElement.querySelector(".form_input_error_message").textContent = "";
		});
	});

	createAccountBtn.addEventListener("click", e => {
		e.preventDefault();

		// reset all fields
		createAccountForm.querySelectorAll(".input__field").forEach(inputElement => {
			inputElement.value = "";
			inputElement.parentElement.querySelector(".form_input_error_message").textContent = "";
		});
	});

	login42Btn.addEventListener("click", e => {
		e.preventDefault();

		// login with 42 handler
		connectUser42();
	})

	loginForm.addEventListener("submit", e => {
		e.preventDefault();

		// login via normal account handler

		connectUser(loginForm);
	});

	createAccountForm.addEventListener("submit", e => {
		e.preventDefault();

		// create account handler

		createUser(createAccountForm);
	});

	// reset the error message field when the user select this input field
	document.querySelectorAll(".input__field").forEach(inputElement => {
		inputElement.addEventListener("input", e => {
			inputElement.parentElement.querySelector(".form_input_error_message").textContent = "";
		});
	});
});