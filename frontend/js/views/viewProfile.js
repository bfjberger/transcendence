export default function renderProfile() {

	return `

		<div id="profile">
			<form id="form__update--nickname">
				<div id="form__update--nickname--msg" class=""></div>
				<div class="text-primary">
					Nickname
				</div>
				<input type="text" class="input__field" id="form__update--nickname--input" name="nickname">
				<button class="btn btn-primary" type="submit" id="form__update--nickname--btn">
					Submit
				</button>
			</form>
			<hr>
			<form id="form__update--password">
				<div id="form__update--password--msg" class=""></div>
				<div class="text-primary">
					Password
				</div>
				<input type="password" class="input__field" id="form__update--password--input1" name="password_one">
				<div class="text-primary">
					Confirm password
				</div>
				<input type="password" class="input__field" id="form__update--password--input2" name="password_two">
				<button class="btn btn-primary" type="submit" id="form__update--password--btn">
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
				<button class="btn btn-primary" type="submit" id="form__update--avatar--btn">
					Submit
				</button>
			</form>
		</div>

	`;
};
