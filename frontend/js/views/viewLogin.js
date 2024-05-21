export default function renderLogin() {

	return `

		<div id="login">
			<div class="list-group d-flex align-items-center">
				<div class="row my-5"></div>
				<div class="row my-5">
					<button class="btn btn-outline-primary list-group-item list-group-item-primary" type="button" data-bs-toggle="modal" data-bs-target="#modal__login" id="btn__login">Se connecter</button>
				</div>
				<div class="row my-5"></div>
				<div class="row my-5">
					<button class="btn btn-outline-success list-group-item list-group-item-success" type="button" data-bs-toggle="modal" data-bs-target="#modal__createAccount" id="btn__createAccount">S'inscrire</button>
				</div>
				<div class="row my-5"></div>
				<div class="row my-5">
					<button class="btn btn-outline-info list-group-item list-group-item-info" type="button" id="btn__login--42">Se connecter avec 42</button>
				</div>
			</div>
			<div class="modal fade" id="modal__login" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered text-center">
					<div class="modal-content">
						<div class="modal-header text-primary fw-bold fs-2">
							<p class="col-12 modal-title">Se connecter</p>
						</div>
						<div class="modal-body">
							<form id="form__login" class="">
								<div class="mb-1 text-danger" id="form__login--errorMsg"></div>
								<div class="mb-2">
									<div class="text-primary">
										Username
									</div>
									<input type="text" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="username">
									<div class="form__input--errorMsg text-danger"></div>
								</div>
								<div class="mb-2">
									<div class="text-primary">
										Mot de passe
									</div>
									<input type="password" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="password">
									<div class="form__input--errorMsg text-danger"></div>
								</div>
								<button class="btn btn-primary mt-1" type="submit" id="form__login--btn">
									Se connecter
								</button>
							</form>
						</div>
						<div class="modal-footer py-2">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade" id="modal__createAccount" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered text-center">
					<div class="modal-content">
						<div class="modal-header text-success fw-bold fs-2">
							<p class="col-12 modal-title">Créer son compte</p>
						</div>
						<div class="modal-body">
							<form id="form__createAccount" class="">
								<div class="mb-1" id="form__createAccount--msg"></div>
								<div class="mb-2">
									<div class="text-success-emphasis">
										Username
									</div>
									<input type="text" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="username">
									<div id="form__input--usernameError" class="h6 text-danger"></div>
								</div>
								<div class="mb-2">
									<div class="text-success-emphasis">
										Adresse mail
									</div>
									<input type="text" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="email">
									<div id="form__input--emailError" class="h6 text-danger"></div>
								</div>
								<div class="mb-2">
									<div class="text-success-emphasis">
										Mot de passe
									</div>
									<input type="password" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="password_one">
									<div id="form__input--passwordError" class="text-danger"></div>
								</div>
								<div class="mb-2">
									<div class="text-success-emphasis">
										Confirmer le mot de passe
									</div>
									<input type="password" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="password_two">
								</div>
								<button class="btn btn-success mt-1" type="submit">
									Créer le compte
								</button>
							</form>
						</div>
						<div class="modal-footer py-2">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
};
