// Try to connect a user | using GET
// USE ANOTHER URL
async function connectUser(loginForm) {

  const input = loginForm.elements;

  const init = {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  };

  fetch('http://localhost:7890/api/players/', init) // will use another URL
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      data.forEach(user => {
        if (user.login === input.username.value && user.password === input.password.value) {
            window.alert("You are logged " + data.message);
            return;
        }
      });
      throw new Error(`This user does not exist, status = ${response.status}`);
    })
    .catch((e) => {
      console.error("Error connect: ", e);
      window.alert("Error connect: " + e.message);
    })
}

// Add a new user to the DB | using POST
// For now not working but expected to work
async function createUser(createAccountForm) {

  const input = createAccountForm.elements;
  console.log(input["password_one"].value);
  console.log(input["password_two"].value);

  if (input["password_one"].value !== input["password_two"].value) {
    document.querySelector("#login_error_message_create").textContent = "The passwords are not the same";
    return;
  }

  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'applications/json',
    },
    body: JSON.stringify({
        login: input["username"].value,
        password: input["password_one"].value
      }),
  };

  fetch('http://localhost:7890/api/players/', init)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      window.alert("You have been registered. You are now logged " + data.message);
    })
    .catch((e) => {
      console.error("Error create: ", e);
      window.alert("Error create: " + e.message);
    })
}

// Show an error message when the username does not meet established conditions
function setInputError(inputElement, message) {
  inputElement.parentElement.querySelector(".form_input_error_message").textContent = message;

  // once there is an error, the input will always be red, no fix for now so ignored
  // inputElement.classList.add("text-danger");
}

// Remove the style and the message of the error message / usually called when changing pages
function clearInputError(inputElement) {
  inputElement.classList.remove("text_danger");
  inputElement.parentElement.querySelector(".form_input_error_message").textContent = "";
}

// Remove the input from the input field passed as parameters / usually called when changing pages
function clearInput(inputElement) {
  inputElement.value = "";
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
          clearInput(inputElement);
          clearInputError(inputElement);
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
          clearInput(inputElement);
          clearInputError(inputElement);
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
      inputElement.addEventListener("blur", e => {
          // if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 1) {
          //     setInputError(inputElement, "Username must be at least 10 characters in length");
          // }
      });

      inputElement.addEventListener("input", e => {
          clearInputError(inputElement);
      });
  });
});