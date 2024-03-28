var userAvatarDefault = "../img/person-circle-Bootstrap.svg";

/*
  Getting information of a user registered | functionnal
*/
async function fetchTest() {

  fetch("http://localhost:7890/api/players/")
	.then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}
		return response.json();
	})
	.then((data) => {
		console.log(data);
		// document.querySelector("#login").textContent = data[0].login;
		// document.querySelector("#nickname").textContent = data[3].nickname;
	})
	.catch((e) => {
		console.error("Error: ", e);
	});
};

/*
  Attempt at loading a file for the user avatar | not working, probably because of the path
*/
async function fetchAvatar() {

	fetch("http://localhost:7890/api/avatars/killian.jpg")
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error, status = ${response.status}`);
			}
			return response.blob();
		})
		.then((blob) => {
			userAvatar.src = URL.createObjectURL(blob);
		})
		.catch((e) => {
			console.error("Error: ", e);
			userAvatar.src = userAvatarDefault;
		}
	);
}

/*
  Updating a value of a user using the GET HTTP method functional
*/
async function uploadTestGet() {

	const input = document.getElementById("uploadTest");
	const fullURL = 'http://localhost:7890/api/players/1/modify_nickname/?new_nickname=' + input.value;
	const init = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	fetch(fullURL, init)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error, status = ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			console.log(data);
			document.querySelector("#nickname").textContent = data.nickname;
		})
		.catch((e) => {
			console.error("Error: ", e);
		}
	);
}

/*
  Updating a value of a user using the PUT HTTP method
*/
async function uploadTestPut() {

	const input = document.getElementById("uploadTest");
	const init = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ login: 'bberger', password: '', nickname: input.value }),
	};

	fetch('http://localhost:7890/api/players/1/', init)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error, status = ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			console.log(data);
			document.querySelector("#nickname").textContent = data.nickname;
		})
		.catch((e) => {
			console.error("Error: ", e);
		}
	);
}

/* SENDING DATA
// API endpoint for creating a new user
const apiUrl = 'https://api.example.com/users';

// Form data to be sent in the request body
const formData = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securepassword123',
};

// Make a POST request using the Fetch API
fetch(apiUrl, {
  method: 'POST',
  headers: {
	'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
})
  .then(response => {
	if (!response.ok) {
	  throw new Error('Network response was not ok');
	}
	return response.json();
  })
  .then(newUserData => {
	// Process the newly created user data
	console.log('New User Data:', newUserData);
  })
  .catch(error => {
	console.error('Error:', error);
  });
*/

/* QUERY PARAMETERS not hardcoded in the URL directly
// API endpoint for fetching recent users
const apiUrl = 'https://api.example.com/users/recent';

// Set up query parameters
const queryParams = {
  timeframe: '30days',
};

// Convert query parameters to a string
const queryString = new URLSearchParams(queryParams).toString();

// Combine API endpoint with query parameters
const fullUrl = `${apiUrl}?${queryString}`;
*/

/* AUTHENTICATION in headers
// API key for authentication
const apiKey = 'your-api-key';

// Make a GET request with authentication using the Fetch API
fetch(apiUrl, {
  headers: {
	Authorization: `Bearer ${apiKey}`,
  },
})
*/

document.addEventListener("DOMContentLoaded", () => {

	// fetchTest();
	// fetchAvatar();

	document.getElementById("uploadBtn").addEventListener("click", e => {
		e.preventDefault();
		// uploadTestPut();
		uploadTestGet();
  	})
});