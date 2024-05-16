export default function renderUpdateInfo() {

	return `
		<div class="row py-3">
			<div class="col-4 text-center">
				<img src="" alt="" id="update__avatar--big" width="100" height="100" class="rounded-circle"/>
			</div>
			<div class="col-4 h1 text-info text-center">
				Informations de
				<div id="update__username--big" class="text-decoration-underline"></div>
				</div>
			<div class="col-4 h3 text-info text-center align-self-center">
				Nickname:
				<div id="update__nickname--big" class="text-decoration-underline"></div>
			</div>
		</div>
		<hr>
		<div class="row text-center py-4">
			<div class="col-4 align-self-center">
				<form id="form__update--avatar">
					<div id="form__update--avatar--msg" class=""></div>
					<div class="text-primary h5">
						Avatar
					</div>
					<input type="file" class="input__field" id="form__update--avatar--input" name="avatar">
					<br>
					<button class="btn btn-outline-success m-2 h5" type="submit" id="form__update--avatar--btn">
						Sauver
					</button>
				</form>
			</div>
			<div class="col-4 align-self-center">
				<form id="form__update--password">
					<div id="form__update--password--msg" class=""></div>
					<!-- <div class="text-primary">
						Your current password
					</div>
					<input type="password" class="input__field" id="form__update--password--current" name="password_current">
					-->
					<div class="text-warning h5">
						Mot de passe
					</div>
					<input type="password" class="input__field" id="form__update--password--new1" name="password_one">
					<div class="text-warning h5">
						Confirmer le mot de passe
					</div>
					<input type="password" class="input__field" id="form__update--password--new2" name="password_two">
					<br>
					<button class="btn btn-outline-success m-2 h5" type="submit" id="form__update--password--btn">
						Sauver
					</button>
				</form>
			</div>
			<div class="col-4 align-self-center">
				<form id="form__update--nickname">
					<div id="form__update--nickname--msg" class=""></div>
					<div class="text-primary h5">
						Nickname
					</div>
					<input type="text" class="input__field" id="form__update--nickname--input" maxlength="20" name="nickname">
					<br>
					<button class="btn btn-outline-success m-2 h5" type="submit" id="form__update--nickname--btn">
						Sauver
					</button>
				</form>
			</div>
		</div>
		<hr>
	`;
};