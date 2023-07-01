async function ajax(request, onload) {
	var api = new XMLHttpRequest();

	api.open("GET", request, true);
	api.send()

	api.onload = function() {
		onload(api.responseText);
	}

	api.onerror = function() {
		onload("Произошла серверная ошибка");
	}
}

async function ajaxPost(request, data, onload) {
	var api = new XMLHttpRequest();

	api.open("POST", request, true);
	api.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	final_data = "post=post"

	for (key in data) {
		final_data += "&" + key + "=" + data[key]
	}

	api.send(final_data);

	console.log(final_data);

	api.onload = function() {
		onload(api.responseText);
	}

	api.onerror = function() {
		onload("Произошла серверная ошибка");
	}
}