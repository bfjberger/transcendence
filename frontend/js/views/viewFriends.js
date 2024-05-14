export default function renderFriends() {
	return `
		<div class="row text-center py-3">
			<div class="h2">
				Ajouter un ami
			</div>
			<form id="form__add--friend">
				<div id="form__add--friend--msg" class="h5"></div>
				<div class="text-primary h4">
					Username:
					<input type="text" class="input__field ms-2" id="form__add--friend--input" maxlength="20" name="username">
				</div>
				<button class="btn btn-outline-success m-2 py-2 h4" type="submit">
					Demander
				</button>
			</form>
		</div>
		<div class="row text-center">
			<div class="col-4 border-end">
				<div class="h2">
					Demandes d'amis envoyée(s):
				</div>
				<div id="friends__sent--main">
				</div>
			</div>
			<div class="col-4 border-end">
				<div class="h2">
					Demandes d'amis reçu(s):
				</div>
				<div id="friends__received--main">
				</div>
			</div>
			<div class="col-4">
				<div class="h2">
					Amitiés:
				</div>
				<div id="friends__accepted--main">
				</div>
			</div>
		</div>
	`;
};
