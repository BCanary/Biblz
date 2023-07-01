from django.shortcuts import render
from .models import Writer, Book
import os
from bs4 import BeautifulSoup

# Create your views here.

def login(request):
	try:
		return request.session["login_id"]
	except:
		return False

def wrapper(login_id):
	if login_id == False:
		profile_image = "images/default_profile.png"
		logged_in = False
		user_info = None
	else:
		try:
			profile_image = Writer.objects.get(id=login_id).profile_picture.url
			logged_in = True
			user_info = Writer.objects.get(id=login_id)
		except:
			profile_image = "images/default_profile.png"
			logged_in = False
			user_info = None	
	#print(profile_image)
	return {"profile_image": profile_image, "logged_in": logged_in, "active_user": user_info}

def main(request):
	new_books = Book.objects.all()[::-1][0:4]
	new_books = [render(request, "book_block_wrapper.html", context={"book": book, "index": "new"}).content.decode() for book in new_books]
	best_books = sorted(Book.objects.all(), key = lambda book: book.rating, reverse=True)[0:4]
	best_books = [render(request, "book_block_wrapper.html", context={"book": book, "index": "best"}).content.decode() for book in best_books]

	best_users = sorted(Writer.objects.all(), key = lambda writer: sum([book.rating for book in Book.objects.filter(writer=writer)]), reverse=True)[0:4]
 
	data = {"new_books": new_books, "best_books": best_books, "best_users": best_users, **wrapper(login(request))} 
	return render(request, "main.html", context=data)

def catalog(request):
	page = int(request.GET.get("page", "1"))
	
	all_books = Book.objects.all()
	books_show = [render(request, "book_block_wrapper.html", context={"book": book, "index": "book"}).content.decode() for book in all_books]

	best_books = sorted(all_books, key = lambda book: book.rating, reverse=True)[0:5]

	data = {"books": books_show, "best_books": best_books,**wrapper(login(request))}
	return render(request, "catalog.html", context=data)

MAX_BOOKS_SHOW = 16
def user(request, id):
	page = int(request.GET.get("page", "1"))
	user = Writer.objects.get(id=id)
	all_books = Book.objects.filter(writer=user)
	books_show = all_books[MAX_BOOKS_SHOW*(page-1):MAX_BOOKS_SHOW*page]
	books_show = [render(request, "book_block_wrapper.html", context={"book": book, "index": "book"}).content.decode() for book in books_show]

	best_books = sorted(all_books, key = lambda book: book.rating, reverse=True)[0:5]

	data = {"user": user, "books": books_show, "best_books": best_books,**wrapper(login(request))}
	return render(request, "user.html", context=data)

def book(request, id):
	book = Book.objects.get(id=id)

	data = {"book": book, **wrapper(login(request))}
	return render(request, "book.html", context=data)

def userSetings(request):
	log = login(request)
	if log == False:
		return render(request, "not_found.html", context={"error": "Вы не авторизованы", **wrapper(log)})
	else:
		return render(request, "user_setings.html", context={**wrapper(log)})

def search(request):
	query = request.GET.get("query", "").lower()
	page = int(request.GET.get("page", "1"))
	
	all_books = []
	for i in Book.objects.all():
		if query in i.bookname.lower():
			all_books.append(i)
	books_show = []
	all_writers = []
	for i in Writer.objects.all():
		if query in i.first_name.lower() + " " + i.middle_name.lower() + " " + i.last_name.lower():
			all_writers.append(i)

	background = ""
	if len(all_books) > 0:
		books_show = all_books[MAX_BOOKS_SHOW*(page-1):MAX_BOOKS_SHOW*page]

		all_writers.extend(list(set([i.writer for i in books_show])))

		background = books_show[0].book_cover.url
		books_show = [render(request, "book_block_wrapper.html", context={"book": book, "index": "book"}).content.decode() for book in books_show]

	best_books = sorted(all_books, key = lambda book: book.rating, reverse=True)[0:5]

	data = {"background": background, "query": query, "books": books_show, "writers": list(set(all_writers))[0:4], "best_books": best_books,**wrapper(login(request))}

	return render(request, "search.html", context=data)

def uploadBook(request):
	data = {**wrapper(login(request))}
	return render(request, "uploadbook.html", context=data)

