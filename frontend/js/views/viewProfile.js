export default function renderProfile() {

	return `

		<div class="row p-5">
			<div class="col-2">
				<img src="/frontend/img/person-circle-Bootstrap.svg" alt="avatar" id="profile__avatar--big" width="100" height="100" class="rounded-circle"/>
			</div>
			<div class="col-8 fs-1 text-center text-info">
				Profile de
				<div id="profile__username--big" class="text-decoration-underline"></div>
			</div>
			<div class="col-2">
			</div>
		</div>
		<div class="row justify-content-center">
			<div class="col-auto">
				<button href="#collapse__myStats" class="btn btn-primary" id="collapse__myStats--btn" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapse__myStats">
					<img src="/frontend/img/clipboard-data.svg" alt="statistics" width="15" height="15" />
					Voir mes Statistiques
				</button>
			</div>
			<div class="col-auto">
				<button href="#collapse__updateProfile" class="btn btn-primary" id="form__update--btn" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapse__updateProfile">
					<img src="/frontend/img/pencil.svg" alt="pencil edit" width="15" height="15" />
					Modifier mes Informations
				</button>
			</div>
		</div>

		<br>
		<br>

		<div class="row text-center">
			<div class="collapse" id="collapse__myStats">
				<hr>
				<div id="collapse__myStats--global" class="row">
					<div class="bg-body-secondary fs-4 collapse__myStats--color--title">
						GLOBALES
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--global--played" class="fs-4 collapse__myStats--color--stats"></div>
						<div class="fw-light collapse__myStats--color--context">PARTIES JOUEES</div>
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--global--wlrate" class="fs-4 collapse__myStats--color--stats"></div>
						<div class="fw-light collapse__myStats--color--context">RATIO VICTOIRE/DEFAITE</div>
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--global--points" class="fs-4 collapse__myStats--color--stats">x</div>
						<div class="fw-light collapse__myStats--color--context">POINTS MARQUES</div>
					</div>
				</div>
				<hr>
				<div id="collapse__myStats--2player" class="row">
					<div class="bg-body-secondary fs-4 collapse__myStats--color--title">
						2 JOUEURS EN LIGNE
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--2player--played" class="fs-4 collapse__myStats--color--stats"></div>
						<div class="fw-light collapse__myStats--color--context">PARTIES JOUEES</div>
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--2player--wlrate" class="fs-4 collapse__myStats--color--stats"></div>
						<div class="fw-light collapse__myStats--color--context">RATIO VICTOIRE/DEFAITE</div>
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--2player--points" class="fs-4 collapse__myStats--color--stats">x</div>
						<div class="fw-light collapse__myStats--color--context">POINTS MARQUES</div>
					</div>
				</div>
				<hr>
				<div id="collapse__myStats--4player" class="row">
					<div class="bg-body-secondary fs-4 collapse__myStats--color--title">
						4 JOUEURS EN LIGNE
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--4player--played" class="fs-4 collapse__myStats--color--stats"></div>
						<div class="fw-light collapse__myStats--color--context">PARTIES JOUEES</div>
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--4player--wlrate" class="fs-4 collapse__myStats--color--stats"></div>
						<div class="fw-light collapse__myStats--color--context">RATIO VICTOIRE/DEFAITE</div>
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--4player--points" class="fs-4 collapse__myStats--color--stats">x</div>
						<div class="fw-light collapse__myStats--color--context">POINTS MARQUES</div>
					</div>
				</div>
				<hr>
				<div id="collapse__myStats--tournament" class="row">
					<div class="bg-body-secondary fs-4 collapse__myStats--color--title">
						Tournoi
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--tournament--best" class="fs-4 collapse__myStats--color--stats">x</div>
						<div class="fw-light collapse__myStats--color--context">MEILLEUR CLASSEMENT</div>
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--tournament--matchwin" class="fs-4 collapse__myStats--color--stats"></div>
						<div class="fw-light collapse__myStats--color--context">MATCH GAGNES</div>
					</div>
					<div class="col bg-body-tertiary">
						<div id="collapse__myStats--tournament--points" class="fs-4 collapse__myStats--color--stats">x</div>
						<div class="fw-light collapse__myStats--color--context">POINTS MARQUES</div>
					</div>
				</div>
				<hr>
			</div>

			<div class="collapse" id="collapse__updateProfile">
				<hr>
				<form id="form__update--nickname">
					<div id="form__update--nickname--msg" class=""></div>
					<div class="text-primary">
						Nickname
					</div>
					<input type="text" class="input__field" id="form__update--nickname--input" maxlength="20" name="nickname">
					<br>
					<button class="btn btn-outline-success m-2" type="submit" id="form__update--nickname--btn">
						Submit
					</button>
				</form>
				<hr>
				<form id="form__update--password">
					<div id="form__update--password--msg" class=""></div>
					<div class="text-primary">
						Your current password
					</div>
					<input type="password" class="input__field" id="form__update--password--current" name="password_current">
					<div class="text-warning">
						Password
					</div>
					<input type="password" class="input__field" id="form__update--password--new1" name="password_one">
					<div class="text-warning">
						Confirm password
					</div>
					<input type="password" class="input__field" id="form__update--password--new2" name="password_two">
					<br>
					<button class="btn btn-outline-success m-2" type="submit" id="form__update--password--btn">
						Submit
					</button>
				</form>
				<hr>
				<form id="form__update--avatar">
					<div id="form__update--avatar--msg" class=""></div>
					<div class="text-primary">
						Avatar
					</div>
					<input type="file" class="input__field" id="form__update--avatar--input" name="avatar">
					<br>
					<button class="btn btn-outline-success m-2" type="submit" id="form__update--avatar--btn">
						Submit
					</button>
				</form>
				<hr>
				<button class="btn btn-outline-danger" type="button" id="form__update--delete--account--btn">
					Supprimer mon compte
				</button>
				<hr>
			</div>
		</div>

	`;
};
