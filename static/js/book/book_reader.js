var reader = document.getElementById("reader");
var reader_up = document.getElementById("reader-up");
var reader_cover = document.getElementById("reader-up-cover");
var book_page = document.getElementById("book-page");
var page_count = document.getElementById("page-count");
var page = 0;
var	range = document.getElementById("font-size-range");
var	prange = document.getElementById("padding-size-range");
var	font_size_value = document.getElementById("font-size-value");
var	padding_size_value = document.getElementById("padding-size-value");
var book_buffer = document.getElementById("book-buffer");
var change_page_left = document.getElementById("change-page-left");
var change_page_right = document.getElementById("change-page-right");
var change_part = document.getElementById("change-part");
var reader_menu = document.getElementById("reader-menu");
var black_radio_button = document.getElementById("black-radio-button");
var center_book = document.getElementById("center-book");
//var book_buffer2 = document.getElementById("book-buffer2")

/*var reader_height = Math.max(
  reader.scrollHeight, reader.scrollHeight,
  reader.offsetHeight, reader.offsetHeight,
 reader.clientHeight, reader.clientHeight
);*/

var reader_height = reader.offsetHeight;
var maximum_reader_height = reader.scrollHeight;
var full_book_maximum_reader_height = 0;

var cover_opened = false;

var fontSize = 16;
var paddingSize = 10;
var strings_count = Math.round(reader.clientHeight/fontSize);

var max_parts = 0;
var part = 0;
var parts = [];


function updateStyle() {
	/*
	x/prev_book_page = new_page
	*/
	prev_page_count = page_count.innerHTML;
	new_page_count = Math.ceil(maximum_reader_height/reader_up.scrollTop+1);
	page_count.innerHTML = new_page_count+1;

	prev_book_page = page;
	new_book_page = Math.ceil(maximum_reader_height/reader_height);
	if (reader.scrollTop == 0) {
		new_book_page = 0;
	}
	book_page.innerHTML = new_book_page+1;
	page = new_book_page;
}
update_range_timeout = setTimeout(function(){},0);
function updateRange(new_range=range.value) {
	font_size_value.innerHTML = new_range;
	clearTimeout(update_range_timeout);
	update_range_timeout = setTimeout(function() {
		reader.style.fontSize = new_range + "px"
		reader_up.style.fontSize = new_range + "px"
		fontSize = new_range;
		maximum_reader_height = reader.scrollHeight;
		if (new_range != range.value) {
			range.value = new_range;
		}
		updateStyle();
	}, 100);
}

update_range_timeout = setTimeout(function(){},0);
function updatePadding(new_range=prange.value) {
	padding_size_value.innerHTML = new_range;
	clearTimeout(update_range_timeout);
	update_range_timeout = setTimeout(function() {
		reader.style.paddingLeft = new_range + "%";
		reader.style.paddingRight = new_range + "%";
		reader_up.style.paddingLeft = new_range + "%";
		reader_up.style.paddingRight = new_range + "%";
		paddingSize = new_range;
		maximum_reader_height = reader.scrollHeight;
		if (new_range != prange.value) {
			prange.value = new_range;
		}
		updateStyle();
	}, 100);
}


function replaceAll(string, search, replace) {
	return string.split(search).join(replace);
}
/*
async function getAllBook() {
	var response = "";
	await ajax("/api/book/" + book_id + "?request=full_book", function(response) {
		response = JSON.parse(response);
		reader.innerHTML = response["reader"];
		full_book_maximum_reader_height = reader.scrollHeight;
		maximum_pages = Math.ceil(full_book_maximum_reader_height/reader_height)-1;
		console.log(maximum_pages);
	});
}*/

async function loadInfo() {
	var response = ""
	await ajax("/api/book/" + book_id + "?request=info", function(response) {
		response = JSON.parse(response);
		length_page = response["length_page"];
		parts = response["parts"];
		var checked = "";
		parts.forEach( function(element, index) {
			if (index == part) {
				checked = "checked"
			} else {
				checked = ""
			}
			reader_menu.innerHTML += "<input type=\"radio\" name=\"reader-menu-section\" class=\"reader-menu-section-input\" id=\"menu-section" + index + "\" onclick=\"selectSection(" + index + ")\" style=\"display:none;\" " + checked +"></input>" +
				"<label for=\"menu-section" + index + "\" class=\"reader-menu-section\"><h2>" + element + "</h2></div>"
		});
		max_parts = parts.length - 1;
		page_count.innerHTML = length_page;
		console.log('Подгрузка информации');
	});
}

buffer_loading = false;
async function loadToBuffer(part, callback=()=>{}) {
	var response = ""
	buffer_loading = true;
	await ajax("/api/book/" + book_id + "?request=book&part=" + part, function(response) {
		response = JSON.parse(response);
		book_buffer.innerHTML = response["reader"];
		console.log('Подгрузка ' + part + ' секции');
		buffer_loading = false;
		callback();
	});
}


function changePageBlocks() {
	if (page <= 0 && part == 0) {
		change_page_left.style.opacity = '0%';
		change_page_left.style.cursor = 'default';
		change_page_left.onclick = null;
	} else {
		change_page_left.style.opacity = '100%';
		change_page_left.style.cursor = 'pointer';
		change_page_left.onclick = prevPage;
	}

	if (reader_height*(page+1) >= maximum_reader_height && part >= max_parts) {
		change_page_right.style.opacity = '0%';
		change_page_right.style.cursor = 'default';
		change_page_right.onclick = null;
	} else {
		change_page_right.style.opacity = '100%';
		change_page_right.style.cursor = 'pointer';
		change_page_right.onclick = nextPage;
	}

	if (reader_height*(page+1) >= maximum_reader_height && part < max_parts) {
		//console.log('ASDAS')
		change_part.innerHTML = parts[part+1];
		change_part.style.opacity = '100%';
		change_part.style.cursor = 'pointer';
		change_part.onclick = nextSection;
	} else {
		change_part.style.opacity = '0%';
		change_part.style.cursor = 'default';
		change_part.onclick = null;
	}
}

hide_center_book = false;
function centerBook() {
	hide_center_book = true;
	center_book.style.opacity = '0%';
	center_book.style.cursor = 'default';
	center_book.onclick = null;
	hideHeader();
}

document.addEventListener("scroll", function() {
if (hide_center_book) {
		hide_center_book = false;
		center_book.style.opacity = '100%';
		center_book.style.cursor = 'pointer';
		center_book.onclick = 'centerBook()';
	}
}); 

reader_up.addEventListener("scroll", function() 
{
	maximum_reader_height = reader_up.scrollHeight;
    if (reader_up.scrollTop >= maximum_reader_height-reader_up.offsetHeight*2) {
		change_part.innerHTML = parts[part+1];
		change_part.style.opacity = '100%';
		change_part.style.cursor = 'pointer';
		change_part.onclick = nextSection;
	} else {
		change_part.style.opacity = '0%';
		change_part.style.cursor = 'default';
		change_part.onclick = null;
	}

	//console.log(reader_up.scrollTop, maximum_reader_height-reader_up.offsetHeight*2)
});



var read_mode = false;
function changeReadMode() {
	read_mode = !read_mode;
	if (read_mode) {
		change_page_right.style.display = 'none';
		change_page_left.style.display = 'none';
		reader_up.style.overflowY = 'scroll';
		//console.log(reader_up.scrollHeight, reader_up.scrollTop)
	} else {
		change_page_right.style.display = 'flex';
		change_page_left.style.display = 'flex';
		reader_up.style.overflowY = 'hidden';
		new_page_count = Math.round(reader_up.scrollHeight/(reader_up.scrollHeight-(reader_up.scrollTop+1)))-1;
		//console.log(reader_up.scrollHeight, reader_up.scrollTop)
		reader_up.scrollTop = reader_height*new_page_count;
		reader.scrollTop = reader_height*new_page_count;
		page_count.innerHTML = new_page_count+1;
	}
}
changeReadMode();

var black_mode = false;
function changeBlackMode() {
	black_mode = !black_mode;
	if (black_mode) {
		black_radio_button.checked = black_mode;
		h = document.getElementById("top-block").offsetHeight;
		document.getElementById("top-block").style.top = -h + "px";
	} else {
		black_radio_button.checked = black_mode;
	}
}

var page_changing = false;
overload_prev = false;
overload_next = true;
function nextPage() {
	if (buffer_loading || page_changing) {
		return 0;
	}
	if (reader_height*(page+1) >= maximum_reader_height && !overload_next) {
		overload_next = true;
		part++;
		document.getElementById("menu-section" + part).checked = true;
		loadToBuffer(part, callback=nextPage);
		return 0;
	}
	page++;
	//console.log("NEXT", part, page, reader_height*page, maximum_reader_height);	
	page_changing = true;
	if (overload_next) {
		reader.innerHTML = book_buffer.innerHTML;
		page = 0;
	}
	reader.scrollTop = reader_height*page;
	book_page.innerHTML = page+1;
	reader_up.style.left = "-110%";
	if (!cover_opened) {
		reader_cover.style.left = "-110%";
	}
	setTimeout(function() {
		if (!cover_opened) {
			reader_cover.style.display = 'none';
			cover_opened = true;
		}
		if (overload_next) {
			reader_up.innerHTML = book_buffer.innerHTML;
			maximum_reader_height = reader_up.scrollHeight;
			new_page_count = Math.ceil(maximum_reader_height/reader_height)-1;
			page_count.innerHTML = new_page_count + 1;
			book_buffer.innerHTML = "";
		}
		reader_up.scrollTop = reader_height*page;
		reader_up.style.transition = "0s";
		reader_up.style.left = "0";
		setTimeout(()=> {
			reader_up.style.transition = "1s"; 
			page_changing=false;
			overload_next=false;
			changePageBlocks();
		}, 100);
	}, 1000);
}

function prevPage() {
	if (buffer_loading || page_changing) {
		return 0;
	}
	if (reader_height*page <= 0 && part > 0 && !overload_prev) {
		overload_prev = true;
		part--;
		document.getElementById("menu-section" + part).checked = true;
		loadToBuffer(part, callback = prevPage);
		return 0;
	}
	page--;
	//console.log("PREV", part, page, reader_height*page, maximum_reader_height);
	page_changing = true;
	if (overload_prev) {
		reader_up.innerHTML = book_buffer.innerHTML;
		maximum_reader_height = reader_up.scrollHeight;
		reader_up.scrollTop = maximum_reader_height;
		new_page_count = Math.ceil(maximum_reader_height/reader_height)-1;
		page_count.innerHTML = new_page_count + 1;
		page = new_page_count;
		console.log('PAGE', page);
	}
	book_page.innerHTML = page+1;
	reader_up.scrollTop = reader_height*page;
	reader_up.style.transition = "0s";
	reader_up.style.left = "-110%";
	setTimeout(function() {
		reader_up.style.transition = "1s";
		reader_up.style.left = "0";
		setTimeout(()=> { 
			reader.scrollTop = reader_height*page;
			if (overload_prev) {
				reader.innerHTML = book_buffer.innerHTML;
				book_buffer.innerHTML = "";
			}
			page_changing=false;
			overload_prev = false;
			changePageBlocks();
		}, 1000);
	}, 100);
}

async function selectSection(id) {
	part = id;
	overload_next = true;
	page = 0;
	loadToBuffer(part, callback=nextPage);
}

function nextSection(id) {
	part += 1;
	selectSection(part);
}

async function main() {
	changePageBlocks();
	if (document.location.hash == "#bookreadera") {
		hideHeader();
	}
	//getAllBook();
	loadInfo();
	loadToBuffer(part, callback=nextPage);	
}

function changeColor(color) {
	document.body.className = color;
}

window.onload = main;