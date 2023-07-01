var header = document.getElementById("top-block");
var registration = document.getElementById("registration");
var login_block = document.getElementById("login-block");
var registration_block = document.getElementById("registration-block");
var black = document.getElementById("black-radio-button");

var headerOffsetSpeed = 8;
var headerOffset = 0;
var headerMaxOffset = header.offsetHeight;

var lastYOffset = window.pageYOffset;
var headerOffset = 0;

var aside = document.getElementById("aside");

window.addEventListener("scroll", function(event) {
	if (lastYOffset < window.pageYOffset) { // Down
		headerOffset += headerOffsetSpeed;
		if (headerOffset > headerMaxOffset) {
			headerOffset = headerMaxOffset
		}
	} else if (lastYOffset > window.pageYOffset) {	// Up
		headerOffset -= headerOffsetSpeed;
		if (headerOffset < 0) {
			headerOffset = 0
		}
	}
	if (window.pageYOffset == 0) {
		headerOffset = 0
	}

	header.style.top = -headerOffset + "px";
	lastYOffset = window.pageYOffset;
});

function hideHeader() {
	headerOffset = headerMaxOffset
	header.style.top = -headerOffset + "px";
}

show_registartion = false;
function showRegistration() {
	show_registartion = !show_registartion;
	if (show_registartion) {
		registration.style.display = 'flex';
		registration_block.style.display = 'block';
		login_block.style.display = 'none';
		black.checked = true;
	} else {
		registration.style.display = 'none';
		black.checked = false;
	}
}

show_login = false;
function showLogin() {
	show_login = !show_login;
	if (show_login) {
		registration.style.display = 'flex';
		registration_block.style.display = 'none';
		login_block.style.display = 'block';
		
		black.checked = true;
	} else {
		registration.style.display = 'none';
		black.checked = false;
	}
}

function doRegistration() {
	var form = document.getElementById("registration");
	var error_box = document.getElementById("error-box");
	var regestration_error = document.getElementById("regestration-error");

	var login = form.elements["login"].value;
	var email = form.elements["email"].value;
	var password_raw = form.elements["password-raw"].value;
	var password = form.elements["password"].value;
	
	if (password != password_raw) {
		regestration_error.style.display = 'flex';
		error_box.innerHTML = "Пароли в обоих блоках должны совпадать"
	} else {
		ajaxPost("/api/registration", {"login": login, "email": email, "password": password}, (response) => {
			response = JSON.parse(response);
			if (response.success == true) {
				window.location.href = "/user/settings"
			} else {
				regestration_error.style.display = 'flex';
				error_box.innerHTML = response.error;
			}
		})
	}
}

function doLogin() {
	var form = document.getElementById("registration");
	var error_box = document.getElementById("login-error-box");
	var login_error = document.getElementById("login-error");

	var login = form.elements["login-login"].value;
	var password = form.elements["login-password"].value;
	
	ajaxPost("/api/login", {"login": login, "password": password}, (response) => {
		response = JSON.parse(response);
		if (response.success == true) {
			window.location.reload();
		} else {
			login_error.style.display = 'flex';
			error_box.innerHTML = response.error;
		}
	})
}

var error_box = document.getElementById("site-error");
function showError(error) {
	var error_box_text = document.getElementById("site-error-text");
	aside.style.zIndex = "9";
	error_box.style.display = 'flex';
	black.checked = true;

	error_box_text.innerHTML = error;
}

function unshowError() {
	aside.style.zIndex = "13";
	error_box.style.display = 'none';
	black.checked = false;
}

function testLoadBook(id) {
	block = document.getElementById("books");
	ajax("/api/bookblock/" + id, function(response) {
		response = JSON.parse(response);
		console.log(response["html"]);
		block.innerHTML += response["html"];
	});
}

document.getElementById("black-radio-button").checked = false;
