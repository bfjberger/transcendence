function loginErrorMessage(formElement, message) {
  const messageElement = formElement.querySelector(".login_error_message");

  messageElement.textContent = message;
}

function setInputError(inputElement, message) {
  inputElement.parentElement.querySelector(".form_input_error_message").textContent = message;

  // once there is an error, the input will always be red, no fix for now so ignored
  // inputElement.classList.add("text-danger");
}

function clearInputError(inputElement) {
  inputElement.classList.remove("text_danger");
  inputElement.parentElement.querySelector(".form_input_error_message").textContent = "";
}

function clearInput(inputElement) {
  inputElement.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login");
  const loginFormTitle = document.querySelector("#loginTitle");
  const createAccountForm = document.querySelector("#createAccount");
  const createAccountFormTitle = document.querySelector("#createAccountTitle");

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

      // Fetch login

      // loginErrorMessage(loginForm, "Invalid username/password combination");
  });

  document.querySelectorAll(".input-field").forEach(inputElement => {
      inputElement.addEventListener("blur", e => {
          if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 10) {
              setInputError(inputElement, "Username must be at least 10 characters in length");
          }
      });

      inputElement.addEventListener("input", e => {
          clearInputError(inputElement);
      });
  });
});