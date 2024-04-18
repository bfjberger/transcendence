export default function renderFriends() {
	return `
		<div>
			<h1>Formulaire demande d'amis :</h1>
			<form id="form_post_friend">
			<ul>
				<li>
					<label for="username">Username :</label>
					<input type="text" id="username" name="username" />
				</li>
				<li>
					<button type="submit">Envoyer une demande</button>
				</li>
			</ul>
			</form>
		</div>

		<div id="">
			<h1>Liste des demandes d'amis envoyée(s) : </h1>
			<ul id="list_friends_initiator">
			</ul>

			<h1>Liste des demandes d'amis reçu(s) : </h1>
			<ul id="list_friends_received">
			</ul>


			<h1>Liste des demandes d'amis acceptée(s) : </h1>
			<ul id="list_friends_accepted">
			</ul>


		</div>

	`;
};
