var image_block = document.getElementById("profile-image-image")
var select_image = document.getElementById("select-image")

window.onload = function() {
	select_image.addEventListener("change", function(event) {
		image_block.src = URL.createObjectURL(this.files[0]);
	});
}