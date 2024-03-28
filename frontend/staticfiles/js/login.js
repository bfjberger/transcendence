// Try to connect a user | using GET
// USE ANOTHER URL
async function connectUser(loginForm) {

	const input = loginForm.elements;

	const inputValues = {
		login: input.username.value,
		password: input.password.value,
	};

	 const init = {
		method: 'GET',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(inputValues)
	};

	try {
		const response = await fetch('http://localhost:7890/api/players/', init); // will use another URL
		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}
		const data = await response.json();
		// depending on the result of the request treat accordingly
		console.log(data);
	} catch (e) {
		console.error("Error connect: ", e);
		window.alert("Error connect: " + e.message);
	}
}

// Add a new user to the DB | using POST
// For now not working but expected to work
async function createUser(createAccountForm) {

	const input = createAccountForm.elements;

	if (input["password_one"].value !== input["password_two"].value) {
		document.querySelector("#login_error_message_create").textContent = "The passwords are not the same";
		return;
	}

	const inputValues = {
		login: input["username"].value,
		password: input["password_one"].value,
	};

	const init = {
		method: 'POST',
		headers: {
			'Content-Type': 'applications/json',
		},
		body: JSON.stringify(inputValues)
	};

	try {
		const response = await fetch('http://localhost:7890/api/players/', init);
		if (!response.ok) {
			throw new Error('Error: ' + response.status);
		}
		const data = await response.json();
		window.alert("You have been registered. You are now logged " + data.message);
	} catch (e) {
		console.error("Error create: ", e);
		window.alert("Error create: " + e.message);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.querySelector("#popupLogin");
	const loginFormTitle = document.querySelector("#popupLoginTitle");
	const createAccountForm = document.querySelector("#popupCreateAccount");
	const createAccountFormTitle = document.querySelector("#popupCreateAccountTitle");

	document.querySelector("#linkCreateAccount").addEventListener("click", e => {
		e.preventDefault();

		loginForm.classList.add("d-none");
		loginForm.querySelectorAll(".input-field").forEach(inputElement => {
			inputElement.value = "";
			inputElement.parentElement.querySelector(".form_input_error_message").textContent = "";
		});
		loginFormTitle.classList.add("d-none");
		createAccountForm.classList.remove("d-none");
		createAccountFormTitle.classList.remove("d-none");
	});

	document.querySelector("#linkLogin").addEventListener("click", e => {
		e.preventDefault();

		loginForm.classList.remove("d-none");
		loginFormTitle.classList.remove("d-none");
		createAccountForm.classList.add("d-none");
		createAccountForm.querySelectorAll(".input-field").forEach(inputElement => {
			inputElement.value = "";
			inputElement.parentElement.querySelector(".form_input_error_message").textContent = "";
		});
		createAccountFormTitle.classList.add("d-none");
	});

	loginForm.addEventListener("submit", e => {
		e.preventDefault();

		console.log('not yet supported, waiting for URL specific to login');

		// connectUser(loginForm);
	});

	createAccountForm.addEventListener("submit", e => {
		e.preventDefault();

		createUser(createAccountForm);
  });

	document.querySelectorAll(".input-field").forEach(inputElement => {
		inputElement.addEventListener("input", e => {
			inputElement.parentElement.querySelector(".form_input_error_message").textContent = "";
		});
	});
});