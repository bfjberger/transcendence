function renderIndex() {
	return `

		<div class="d-flex align-items-center">
			Bienvenue, ceci est la page principale.
			<div>
				<img src="https://c.tenor.com/5UrSnlHPuXkAAAAC/tenor.gif">
			</div>
			<div>
				<img src="https://c.tenor.com/8Y4tlL5MQFEAAAAC/tenor.gif">
			</div>
			<div>
				<img src="https://static.hitek.fr/img/actualite/ill_m/1435480913/darkvador.webp">
			</div>
		</div>
	`;
};

function listenerIndex() {

};

async function loadIndex()
{
	console.log("hello from load index")
	try {
		let hostnameport = "https://" + window.location.host;

		const response = await fetch(hostnameport + '/api/index/');

		console.log("response de api dans load index : ", response.status)

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
