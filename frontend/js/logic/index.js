import { connect_socket_friend } from "./friends.js";

function renderIndex() {
	return `
			<div class="text-center py-5">
				<h1>Bienvenue, ceci est la page principale.</h1>
			</div>
			<div class="row">
				<div class="col-6 d-flex justify-content-center">
				<img src="/frontend/img/index42.png" alt="PONG X 42" style="max-width=600px; max-height=600px;" width=100% height=100% />
				</div>
				<div class="col-6 d-flex justify-content-center">
				<img src="/frontend/img/index42_second.png" alt="PONG x 42" style="max-width=600px; max-height=600px;" width=100% height=100%/>
				</div>
			</div>
	`;
};

function listenerIndex() {

};

async function loadIndex()
{
	try {
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/index/');

		if (response.status === 202) {

			const data = await response.json();

			sessionStorage.setItem("username", data["username"]);
			sessionStorage.setItem("avatar", data["player"].avatar);
			sessionStorage.setItem("nickname", data["player"].nickname);

			// connect_socket_friend();

			return 1;
		}
		return 0;
	} catch (e) {
		console.error(e);
	}
};

export default {
	renderIndex,
	listenerIndex,
	loadIndex
};
