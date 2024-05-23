export async function updateStatus(new_status) {

	const csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	const init = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({status: new_status}),
	};

	try {
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/changestatus/', init);

		if (!response.ok) {
			const error_text = await response.text();
			throw new Error(error_text);
		}

		if (response.status === 200) {
			const data = await response.json();

			return data.status;
		}

	} catch (e) {
		console.error(e);
	}
};
