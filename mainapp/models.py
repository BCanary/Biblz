from django.db import models

class Writer(models.Model):
	username = models.CharField(max_length=30)
	mail = models.EmailField()

	confirmed = models.BooleanField(default=False)

	profile_picture = models.ImageField(upload_to="profile_picture/", default="profile_picture/default.png")
	profile_picture_offset_x = models.IntegerField(default=0)
	profile_picture_offset_y = models.IntegerField(default=0)
	profile_picture_height = models.IntegerField(default=100)

	first_name = models.CharField(max_length=30, default="")
	last_name = models.CharField(max_length=30, default="")
	middle_name = models.CharField(max_length=30, default="")

	description = models.CharField(max_length=1000, default="")

	password = models.CharField(max_length=32)

	date_registred = models.DateField(auto_now_add=True)


class Book(models.Model):
	bookname = models.CharField(max_length=100)

	writer = models.ForeignKey(Writer, on_delete=models.CASCADE, default="")

	date_added = models.DateField(auto_now_add=True)

	book_file = models.FileField(upload_to="books/")
	book_cover = models.ImageField(upload_to="book_cover/", default="book_cover/default.png")

	description = models.CharField(max_length=1000, default="")

	views = models.IntegerField(default=0)
	rating = models.IntegerField(default=0)