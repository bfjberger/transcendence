export default function renderProfile() {

	return `
		<div class="row py-5">
			<div class="col-2 text-center">
				<img src="/frontend/img/person-circle-Bootstrap.svg" alt="avatar" id="profile__avatar--big" width="100" height="100" class="rounded-circle"/>
			</div>
			<div class="col-8 fs-1 text-info text-center">
				Profile de
				<div id="profile__username--big" class="text-decoration-underline"></div>
			</div>
			<div class="col-2 fs-2 text-info text-center">
				Nickname:
				<div id="profile__nickname--big" class="text-decoration-underline"></div>
			</div>
		</div>
	`;
};
