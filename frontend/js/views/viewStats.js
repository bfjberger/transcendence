export default function renderStats() {

	return `
		<div class="row py-3">
			<div class="fs-1 text-info text-center">
				Statistiques de
				<div id="stats__username" class="text-decoration-underline"></div>
			</div>
		</div>
		<div class="row text-center">
			<div id="stats__global" class="row py-3">
				<div class="bg-body-secondary fs-4 stats__color--title">
					GLOBALES
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__global--played" class="fs-4 stats__color--stats"></div>
					<div class="fw-light stats__color--context">PARTIES JOUEES</div>
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__global--wlrate" class="fs-4 stats__color--stats"></div>
					<div class="fw-light stats__color--context">RATIO VICTOIRE/DEFAITE</div>
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__global--points" class="fs-4 stats__color--stats">x</div>
					<div class="fw-light stats__color--context">POINTS MARQUES</div>
				</div>
			</div>
			<div id="stats__2player" class="row py-3">
				<div class="bg-body-secondary fs-4 stats__color--title">
					2 JOUEURS EN LIGNE
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__2player--played" class="fs-4 stats__color--stats"></div>
					<div class="fw-light stats__color--context">PARTIES JOUEES</div>
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__2player--wlrate" class="fs-4 stats__color--stats"></div>
					<div class="fw-light stats__color--context">RATIO VICTOIRE/DEFAITE</div>
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__2player--points" class="fs-4 stats__color--stats">x</div>
					<div class="fw-light stats__color--context">POINTS MARQUES</div>
				</div>
			</div>
			<div id="stats__4player" class="row py-3">
				<div class="bg-body-secondary fs-4 stats__color--title">
					4 JOUEURS EN LIGNE
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__4player--played" class="fs-4 stats__color--stats"></div>
					<div class="fw-light stats__color--context">PARTIES JOUEES</div>
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__4player--wlrate" class="fs-4 stats__color--stats"></div>
					<div class="fw-light stats__color--context">RATIO VICTOIRE/DEFAITE</div>
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__4player--points" class="fs-4 stats__color--stats">x</div>
					<div class="fw-light stats__color--context">POINTS MARQUES</div>
				</div>
			</div>
			<div id="stats__tournament" class="row py-3">
				<div class="bg-body-secondary fs-4 stats__color--title">
					TOURNOI EN LIGNE
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__tournament--nbwin" class="fs-4 stats__color--stats">x</div>
					<div class="fw-light stats__color--context">TOURNOIS GAGNES</div>
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__tournament--matchwin" class="fs-4 stats__color--stats"></div>
					<div class="fw-light stats__color--context">MATCH GAGNES</div>
				</div>
				<div class="col bg-body-tertiary">
					<div id="stats__tournament--points" class="fs-4 stats__color--stats">x</div>
					<div class="fw-light stats__color--context">POINTS MARQUES</div>
				</div>
			</div>
		</div>
	`;
};