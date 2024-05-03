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
		<div>
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
		<div class="row text-center">
			<div class="h2">
				Ajouter un ami
			</div>
			<form id="form__add--friend">
				<div id="form__add--friend--msg" class=""></div>
				<div class="text-primary h4">
					Username
					<input type="text" class="input__field" id="form__add--friend--input" maxlength="20" name="username">
				</div>
				<br>
				<button class="btn btn-outline-success m-2 h4" type="submit" id="form__add--friend--btn">
					Demander
				</button>
			</form>
		</div>
		<div class="row text-center">
			<div class="col-4 border">
				<div class="h2">
					Demandes d'amis envoyée(s):
				</div>
				<div id="friends__sent--main">
				</div>
			</div>
			<div class="col-4 border">
				<div class="h2">
					Demandes d'amis reçu(s):
				</div>
				<div id="friends__received--main">
				</div>
			</div>
			<div class="col-4 border">
				<div class="h2">
					Amitiés:
				</div>
				<div id="friends__accepted--main">
				</div>
			</div>
		</div>
	`;
};
