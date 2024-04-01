const routes = {
	"/staticfiles/index.html": {
		title: "Main Page",
		content: `hello`
	},
	"/staticfiles/html/profile.html": {
		title: "Profile",
		content: `Profile Page`
	},
	"/staticfiles/html/twoplayers.html": {
		title: "Two Players Game",
		content: `<div class="row">
					<div class="col text-center fw-bold pt-3">
					<h1>Two Players Pong Game</h1>
					</div>
				</div>
				<div class="row">
					<div class="col-5"></div>
					<div class="col-2 text-white" style="visibility: hidden">
					<p>Top Player: N/M</p>
					</div>
					<div class="col-5"></div>
				</div>
				<div class="row">
					<div class="col text-end text-warning align-self-center">
					<p>Left Player: W/S</p>
					</div>
					<div class="col d-flex justify-content-center align-items-center">
						<div class="position-absolute">
							<button class="btn btn-primary" type="button" id="startGame2">Start the game</button>
						</div>
						<div class="text-bg-success border border-black border-5">
							<canvas id="board_two" width="650" height="480"></canvas>
						</div>
					</div>
					<div class="col text-start align-self-center text-primary">
					<p>Right Player: UpArrow/DownArrow</p>
					</div>
				</div>`
	},
	"/staticfiles/html/fourplayers.html": {
		title: "Four Players Game",
		content: `<div class="row">
					<div class="col text-center fw-bold pt-3">
					<h1>Four Players Pong Game</h1>
					</div>
				</div>
				<div class="row">
					<div class="col-5"></div>
					<div class="col-2 text-center" style="color: violet">
					<p>Top Player: N/M</p>
					</div>
					<div class="col-5"></div>
				</div>
				<div class="row">
					<div class="col text-end text-warning align-self-center">
					<p>Left Player: Q/A</p>
					</div>
					<div class="col d-flex justify-content-center align-items-center">
						<div class="position-absolute">
							<button class="btn btn-primary" type="button" id="startGame4">Start the game</button>
						</div>
						<div class="text-bg-success border border-black border-5">
							<canvas id="board_four" width="650" height="650"></canvas>
						</div>
					</div>
					<div class="col text-start text-primary align-self-center">
					<p>Right Player: 9/6</p>
					</div>
				</div>
				<div class="row">
					<div class="col-5"></div>
					<div class="col-2 text-center mt-3" style="color: red">
					<p>Bottom Player: LeftArrow/RightArrow</p>
					</div>
					<div class="col-5"></div>
				</div>`
	},
	"/staticfiles/html/tournament.html": {
		title: "Tournament",
		content: `<div class="row">
				<div class="col text-center fw-bold pt-3">
					<h1>Tournament</h1>
				</div>
			</div>
			<div class="row" id="players">
				<div class="col text-center fw-bold pt-3">
					<h3>Entrez les noms des joueurs</h3>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player1" placeholder="Joueur 1" aria-label="Joueur 1" value="a"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player2" placeholder="Joueur 2" aria-label="Joueur 2" value="b"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player3" placeholder="Joueur 3" aria-label="Joueur 3" value="c"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player4" placeholder="Joueur 4" aria-label="Joueur 4" value="d"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player5" placeholder="Joueur 5" aria-label="Joueur 5" value="e"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player6" placeholder="Joueur 6" aria-label="Joueur 6" value="f"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player7" placeholder="Joueur 7" aria-label="Joueur 7" value="g"/>
				</div>
				<div class="player d-flex justify-content-center pt-1">
					<input type="text" class="form-control w-auto" id="player8" placeholder="Joueur 8" aria-label="Joueur 8" value="h"/>
				</div>
				<div class="d-flex justify-content-center pt-2">
					<button class="btn btn-info" onclick="startTournament()">Démarrer le tournoi</button>
				</div>
				<div class="d-flex justify-content-center pt-2">
					<button class="btn btn-info" onclick="rempliTestDebug(); startTournament();">DEBUG TOURNOI RAPIDE</button>
				</div>
			</div>
			<div class="row" id="title">
				<div class="col-5 d-flex justify-content-left" id="next_match"></div>
				<div class="col-2 d-flex justify-content-center" id="current_match"></div>
				<div class="col-5"></div>
			</div>
			<div class="row">
				<div class="col"></div>
				<div class="col d-flex justify-content-center align-items-center">
					<div class="position-absolute d-none">
						<button class="btn btn-primary" type="button" id="startGame2">Start the game</button>
					</div>
					<div class="text-bg-success border border-black border-5 d-none">
						<canvas id="board_two" width="650" height="480"></canvas>
					</div>
				</div>
				<div class="col"></div>
			</div>
			<div class="row" id="bracketContainer"></div>`
	},
	"/staticfiles/html/friends.html": {
		title: "Friends",
		content: `Friends Page`
	},
	"/staticfiles/html/login.html": {
		title: "Login",
		content: `<div class="list-group  d-flex align-items-center">
					<div class="row my-5"></div>
					<div class="row my-5">
						<button class="btn btn-outline-primary list-group-item list-group-item-primary" type="button" data-bs-toggle="modal" data-bs-target="#modal__login" id="btn__login">Login</button>
					</div>
					<div class="row my-5"></div>
					<div class="row my-5">
						<button class="btn btn-outline-success list-group-item list-group-item-success" type="button" data-bs-toggle="modal" data-bs-target="#modal__createAccount" id="btn__createAccount">Create an Account</button>
					</div>
					<div class="row my-5"></div>
					<div class="row my-5">
						<button class="btn btn-outline-info list-group-item list-group-item-info" type="button" id="btn__login--42">Sign in with 42</button>
					</div>
				</div>
				<div class="modal fade" id="modal__login" aria-hidden="true">
					<div class="modal-dialog modal-dialog-centered text-center">
						<div class="modal-content">
							<div class="modal-header text-primary fw-bold fs-2">
								<p class="col-12 modal-title">Login</p>
							</div>
							<div class="modal-body">
								<form id="form__login" class="">
									<div class="mb-1 text-danger" id="login_error_message_login"></div>
									<div class="mb-2">
										<div class="text-primary">
											Username
										</div>
										<input type="text" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="username">
										<div class="form_input_error_message text-danger"></div>
									</div>
									<div class="mb-2">
										<div class="text-primary">
											Password
										</div>
										<input type="password" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="password">
										<div class="form_input_error_message text-danger"></div>
									</div>
									<button class="btn btn-primary mt-1" type="submit">
										Continue
									</button>
									<!-- <p class="my-2">
										<a id="forgotPassword" class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover" href="#">Forgot your password?</a>
									</p> -->
								</form>
							</div>
							<div class="modal-footer py-2">
								<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							</div>
						</div>
					</div>
				</div>
				<div class="modal fade" id="modal__createAccount" aria-hidden="true">
					<div class="modal-dialog modal-dialog-centered text-center">
						<div class="modal-content">
							<div class="modal-header text-success fw-bold fs-2">
								<p class="col-12 modal-title">Create Account</p>
							</div>
							<div class="modal-body">
								<form id="form__createAccount" class="">
									<div class="mb-1 text-danger" id="login_error_message_create"></div>
									<div class="mb-2">
										<div class="text-success-emphasis">
											Username
										</div>
										<input type="text" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="username">
										<div class="form_input_error_message text-danger"></div>
									</div>
									<div class="mb-2">
										<div class="text-success-emphasis">
											Email Address
										</div>
										<input type="text" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="email">
										<div class="form_input_error_message text-danger"></div>
									</div>
									<div class="mb-2">
										<div class="text-success-emphasis">
											Password
										</div>
										<input type="password" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="password_one">
										<div class="form_input_error_message text-danger"></div>
									</div>
									<div class="mb-2">
										<div class="text-success-emphasis">
											Confirm password
										</div>
										<input type="password" class="p-1 border border-1 border-secondary rounded bg-info-subtle input__field" name="password_two">
										<div class="form_input_error_message text-danger"></div>
									</div>
									<button class="btn btn-success mt-1" type="submit">
										Continue
									</button>
								</form>
							</div>
							<div class="modal-footer py-2">
								<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="d-none" id="loading"></div>`
	}
};

// Function to handle navigation
function navigateToPage(page) {
	const route = routes[page];
	if (route) {
		document.querySelector("#main__content").innerHTML = route.content;
		document.title = route.title; // Update page title
		if (route.title === "Login") {
			document.querySelector("#btn__navbar--home").setAttribute("disabled", "");
			document.querySelector("#btn__navbar--user").setAttribute("disabled", "");
			document.querySelector("#sidebar").classList.add("d-none");
		}
		history.pushState({ page }, "", page); // Update URL
	}
	else {
		document.querySelector("#main__content").innerHTML = "<h2>Page Not Found</h2>";
	}
}

// Event listener for navigation links
document.querySelectorAll(".nav__link").forEach(link => {
	link.addEventListener("click", function() {
		const page = this.value;
		navigateToPage(page);
	});
});

window.onpopstate = navigateToPage;
window.route = navigateToPage;

// Initial page load
navigateToPage("/staticfiles/index.html");