var csrftoken

function listener404_error() {

};


async function load404_error() {
	console.log("5000 dollars et elle ")
	// csrftoken = document.cookie.split("; ").find((row) => row.startsWith("csrftoken"))?.split("=")[1];

	// const init = {
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 		'X-CSRFToken': csrftoken,
	// 	}
	// };

	// try {
	// 	let hostnameport = "https://" + window.location.host

	// 	if (response_list_initiated.status != 200 || response_list_received.status != 200 || response_list_initiated_accepted.status != 200) {
	// 		const text = await response.text();
	// 		throw new Error(text);
	// 	}
	// 	else
	// 	{

			
	// 		console.log("je dois annuler")


	// 	}
	// 	return 1;
	// } catch (e) {
	// 	console.error("loadFriends: " + e);
	// 	return 0;
	// }

	return 1;
};

export default {
	listener404_error,
	load404_error
};
