// import navigateToPage from "./router.js";

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
		const response = await fetch('http://localhost:7890/login/', init); // will use another URL
		if (response.status === 401) {
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
			console.log(data);
			// if (!document.cookie.length) {
			// 	navigateToPage("index");
			// }
		}
	} catch (e) {
		console.error("Error connect user: ", e);
	}
}

// Add a new user to the DB | using POST
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
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(inputValues)
	};

	try {
		const response = await fetch('http://localhost:7890/register/', init);
		if (response.status === 401) {

			return;
		}
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

	browser.captureNetworkRequests((requestParams) => {
		console.log('Request Number:', this.requestCount++);
		console.log('Request URL:', requestParams.request.url);
		console.log('Request method:', requestParams.request.method);
		console.log('Request headers:', requestParams.request.headers);
	})

	$('#modal__login').on('hidden.bs.modal', function () {
		console.log('ici');
	});

	// Reset all fields (input and error) from the form when it's no longer on focus
	// document.querySelector(".modal-content").addEventListener("focusout", e => {
	// 	e.preventDefault();

	// 	loginForm.querySelectorAll(".input__field").forEach(inputElement => {
	// 		inputElement.value = "";
	// 		inputElement.parentElement.querySelector(".form__input--errorMsg").textContent = "";
	// 		loginForm.querySelector("#form__login--errorMsg").textContent = "";
	// 	});
	// });

	// Reset all fields (input and error) from the form when it's no longer on focus
	createAccountForm.addEventListener("focusout", e => {
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