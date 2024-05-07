function renderIndex() {
	return `

		<div class="d-flex align-items-center">
			Bienvenue, ceci est la page principale.
			<div class="row">
				<img src="https://c.tenor.com/5UrSnlHPuXkAAAAC/tenor.gif" height="300" width="300">
				<img src="https://c.tenor.com/8Y4tlL5MQFEAAAAC/tenor.gif" height="300" width="300">
				<img src="https://static.hitek.fr/img/actualite/ill_m/1435480913/darkvador.webp" height="300" width="300">
				<img src="https://cdn.ferrari.com/cms/network/media/img/resize/631b55bb9ba7b26ce62de2e7?" height="300" width="300">
			</div>
			<div class="row">
			</div>
			<div class="row">
			</div>
			<div class="row">
			</div>
		</div>
	`;
};

function listenerIndex() {

};

async function loadIndex() {

	try {
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/index/');

		if (response.status === 202) {

			const data = await response.json();

			sessionStorage.setItem("username", data["username"]);
			sessionStorage.setItem("avatar", data["player"].avatar);
			sessionStorage.setItem("nickname", data["player"].nickname);

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
