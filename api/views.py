from django.shortcuts import render
from mainapp.models import Writer, Book
from django.http import *
import mainapp
from mainapp.views import login, wrapper
import os
from bs4 import BeautifulSoup
import json
import math
from django.views.decorators.csrf import csrf_exempt,csrf_protect #Add this
import hashlib
from django.http import HttpResponseRedirect

# Create your views here.
def apiUser(request, id):
	data = {}
	try:
		user = Writer.objects.get(id=id)

		data = {"response": user.description}
		
	except mainapp.models.Writer.DoesNotExist:
		data = {"response": "404"}

	return HttpResponse(str(data))

def apiBookBlock(request, id):
	book = Book.objects.get(id=id)
	data = {
		"html": render(request, "book_block_wrapper.html", context={"book": book}).content.decode()
	}
	#print(render(request, "book_block_wrapper.html", context={"book": book}).getvalue())
	response = HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')
	return response

def apiProfileRedirect(request):
	try:
		login = Writer.objects.get(id=request.session["login_id"])
		return HttpResponseRedirect("/user/" + str(login.id))
	except:
		return render(request, "not_found.html", context={"error": "Вы не авторизованы"})

@csrf_exempt
def apiSettings(request):
	if request.method == "POST":
		user = Writer.objects.get(id=request.session["login_id"])

		user.first_name = request.POST.get("first-name")
		user.middle_name = request.POST.get("middle-name")
		user.last_name = request.POST.get("last-name")

		user.description = request.POST.get("description")

		try:
			user.profile_picture = request.FILES["profile-image"]
		except:
			pass
	
		user.mail = request.POST.get("mail")

		user.save()
		
		return HttpResponse("<script>window.location.href=\"/user/settings\"</script>")

@csrf_exempt
def apiUploadBook(request):
	if request.method == "POST":
		user = Writer.objects.get(id=request.session["login_id"])
		book_file = request.FILES["book-file"]
		book_cover = request.FILES["book-cover"]

		Book.objects.create(bookname=request.POST.get("bookname"), writer=user, book_file=book_file, book_cover=book_cover, description=request.POST.get("description"))
		return HttpResponse("<script>window.location.href=\"/user/" + str(user.id) + "\"</script>")

def apiDeleteBook(request, id):
	book = Book.objects.get(id=id)
	user = Writer.objects.get(id=request.session["login_id"])

	if (user.id == book.writer.id):
		book.delete();

	return HttpResponse("<script>window.location.href=\"/user/" + str(user.id) + "\"</script>")

@csrf_exempt
def apiRegistration(request):
	login = request.POST.get("login", "")
	mail = request.POST.get("email", "")
	password = request.POST.get("password", "")

	data = {"success": True, "error": ""}

	if len(login) <= 3:
		data = {"success": False, "error": "Логин должен быть больше трёх символов"}
	elif len(mail) == 0:
		data = {"success": False, "error": "Почта должна быть корректной"}
	elif len(password) <= 5:
		data = {"success": False, "error": "Пароль должен быть больше 5 символов"}

	try:
		user = Writer.objects.get(username=login)
		data = {"success": False, "error": "Пользователь с таким логином уже существует"}
	except:
		pass

	try:
		user = Writer.objects.get(mail=mail)
		data = {"success": False, "error": "Пользователь с такой почтой уже существует"}
	except:
		pass

	if data["success"] == True:
		writer = Writer.objects.create(username=login, mail=mail, password=hashlib.md5(password.encode()).hexdigest())
		request.session["login_id"] = writer.id

	return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')

@csrf_exempt
def apiLogin(request):
	login = request.POST.get("login", "")
	password = request.POST.get("password", "")

	data = {"success": True, "error": ""}
	phash = hashlib.md5(password.encode()).hexdigest()
	if Writer.objects.filter(username=login, password=phash).exists() or Writer.objects.filter(mail=login, password=phash).exists():
		if Writer.objects.filter(username=login, password=phash).exists():
			request.session["login_id"] = Writer.objects.get(username=login, password=phash).id
		elif Writer.objects.filter(mail=login, password=phash).exists():
			request.session["login_id"] = Writer.objects.get(mail=login, password=phash).id
	else:
		data = {"success": False, "error": "Логин или пароль введены неверно"}
			
	
	response = HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')
	#response.set_cookie('login', login)
	#response.set_cookie('password', password)

	return response

def apiUnlogin(request):
	try:
		del request.session["login_id"]
		return HttpResponse(json.dumps({"response": "unlogin"}, ensure_ascii=False), content_type='application/json')
	except:
		return HttpResponse(json.dumps({"response": "you are already unloged"}, ensure_ascii=False), content_type='application/json')

def apiBook(request, id):
	api_request = request.GET.get("request", "book")
	data = {}
	try:
		book = Book.objects.get(id=id)
	except mainapp.models.Book.DoesNotExist:
		return HttpResponseNotFound("<h2>Not Found</h2>")

	if api_request == "book":
		part = int(request.GET.get("part", 0))
		book = Book.objects.get(id=id)

		dir = os.path.abspath(os.curdir)
		reader = ""
		replace = {
			"body": "",
			"title": "h3",
			"section": "div",
			"epigraph": "i",
		}
		with open(dir + book.book_file.url, "rb") as file:
			reader = file.read()

			soup = BeautifulSoup(reader, "lxml")

			body = soup.findAll("body")[0]
			#try:
			if(len(body.findAll("section")) > 0):
				try:
					body = str(body.findAll("section")[part])
				except IndexError:
					body = ""
			else:
				body = str(body)
			#except:
			#	pass

			for i in replace:
				if replace[i] == "":
					body = body.replace("<" + i + ">", replace[i])
					body = body.replace("</" + i + ">", replace[i])
				else:
					body = body.replace("<" + i + ">", "<" + replace[i] + ">")
					body = body.replace("</" + i + ">", "</" + replace[i] + ">")

			data = {
				"reader": body, #[500*part:500*(part+1)],
			}

	elif api_request == "info":
		part = int(request.GET.get("part", 0))
		book = Book.objects.get(id=id)

		dir = os.path.abspath(os.curdir)
		length_page = 0
		parts = []
		with open(dir + book.book_file.url, "rb") as file:
			reader = file.read()

			soup = BeautifulSoup(reader, "lxml")

			body = soup.findAll("body")[0]
			#length_page = math.ceil(len(str(body))/745)
			parts = []
			if(len(body.findAll("section")) > 0):
				for index, i in enumerate(body.findAll("section")):
					title = i.findAll("title")
					if len(title) == 0:
						parts.append(f"{index} часть")
					else:
						parts.append(title[0].text.strip()) 
			else:
				parts = ["Книга"]

			data = {
				"parts": parts, #[500*part:500*(part+1)],
				"length_page": length_page
			}
	elif api_request == "full_book":
		part = int(request.GET.get("part", 0))
		book = Book.objects.get(id=id)

		dir = os.path.abspath(os.curdir)
		reader = ""
		replace = {
			"body": "",
			"title": "h3",
			"section": "div",
			"epigraph": "i",
		}
		with open(dir + book.book_file.url, "rb") as file:
			reader = file.read()

			soup = BeautifulSoup(reader, "lxml")

			body = str(soup.findAll("body")[0])
			#except:
			#	pass

			for i in replace:
				if replace[i] == "":
					body = body.replace("<" + i + ">", replace[i])
					body = body.replace("</" + i + ">", replace[i])
				else:
					body = body.replace("<" + i + ">", "<" + replace[i] + ">")
					body = body.replace("</" + i + ">", "</" + replace[i] + ">")

			data = {
				"reader": body, #[500*part:500*(part+1)],
			}

	return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')
		
