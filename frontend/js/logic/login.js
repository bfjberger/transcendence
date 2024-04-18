import router from "./router.js"

// add the field credentials: "same-origin" to the init object to send with the request the cookies

// Try to connect a user | using GET
// USE ANOTHER URL
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
		const response = await fetch('http://localhost:7890/api/login/', init); // will use another URL

		if (response.status === 201) {
			const error = await response.text();
			document.getElementById("form__login--errorMsg").textContent = error.replace(/["{}[\]]/g, '');
			return;
		}
		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}
		if (response.status === 202) {
			// login is successful -> redirect to profile

			const data = await response.json();

			sessionStorage.setItem("username", data["username"]);
			sessionStorage.setItem("avatar", data["player"].avatar);
			sessionStorage.setItem("nickname", data["player"].nickname);

			document.querySelector("div.modal-backdrop.fade.show").remove();

			document.querySelectorAll(".nav__link").forEach(btn => {
				btn.removeAttribute("disabled");
			});
			document.getElementById("navbar__btn--user").removeAttribute("disabled");
			document.getElementById("logout").removeAttribute("disabled");

			router("index");
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
	document.getElementById("form__createAccount--msg").textContent = "";

	const input = createAccountForm.elements;

	if (input["password_one"].value !== input["password_two"].value) {
		document.getElementById("form__createAccount--msg").textContent = "The passwords are not the same";
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
			document.getElementById("form__createAccount--msg").textContent = error.replace(/["{}[\]]/g, '');
			return;
		}
		if (response.status === 201) {
			// register is successful -> redirect to profile

			const data = await response.json();
			// sessionStorage.setItem("username", data.username); pas necessaire comme oblige de login et alors recoit infos importantes

			document.getElementById("form__createAccount--msg").innerHTML = "Your account was successfully created. You can now login.";
			document.getElementById("form__createAccount--msg").classList.remove("text-danger");
			document.getElementById("form__createAccount--msg").classList.add("text-info");
		}
	} catch (e) {
		console.error("Error create user: ", e);
	}
}

async function connectUser42() {

	document.getElementById("loading").classList.remove("d-none");

	try {
		const response = await fetch('http://localhost:7890/api/accounts/');

		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}

		console.log("connection with 42 API successful");

		document.getElementById("loading").classList.add("d-none");

		router("index");
	} catch (e) {
		console.error("Error 42: ", e);
	}
}

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

function loadLogin() {

	document.querySelectorAll(".nav__link").forEach(btn => {
		btn.setAttribute("disabled", true);
	});
	document.getElementById("navbar__btn--user").setAttribute("disabled", true);
	document.getElementById("logout").setAttribute("disabled", true);

	return 1;
};

export default {
	listenerLogin,
	loadLogin
};
