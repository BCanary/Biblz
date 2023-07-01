"""
def getBook():
	book = Book.objects.get(id=id)

	dir = os.path.abspath(os.curdir)
	reader = ""
	replace = {
		"body": ""
	}
	with open(dir + book.book_file.url, "rb") as file:
		reader = file.read()

		soup = BeautifulSoup(reader, "lxml")

		body = str(soup.findAll("body")[0])

		for i in replace:
			if replace[i] == "":
				body = body.replace("<" + i + ">", replace[i])
				body = body.replace("</" + i + ">", replace[i])
			else:
				body = body.replace("<" + i + ">", "<" + replace[i] + ">")
				body = body.replace("</" + i + ">", "</" + replace[i] + ">")

		reader = body[0:10000]
"""