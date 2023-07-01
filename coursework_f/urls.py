"""coursework_f URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from mainapp import views as mainapp_views
from api import views as api_views

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', mainapp_views.main, name="main"),
    path('user/<int:id>', mainapp_views.user, name="user"),
    path('user/settings', mainapp_views.userSetings, name="user_settings"),
    path('book/<int:id>', mainapp_views.book, name="book"),
    path('search/', mainapp_views.search, name="search"),
    path('uploadbook/', mainapp_views.uploadBook, name="uploadbook"),
    path('catalog/', mainapp_views.catalog, name="catalog"),

    path('api/user/<int:id>', api_views.apiUser, name="api_user"),
    path('api/book/<int:id>', api_views.apiBook, name="api_book"),
    path('api/registration', api_views.apiRegistration, name="api_registartion"),
    path('api/login', api_views.apiLogin, name="api_login"),
    path('api/unlogin', api_views.apiUnlogin, name="unlogin"),
    path('api/settings', api_views.apiSettings, name="settings"),
    path('api/profile_redirect', api_views.apiProfileRedirect, name="profile_redirect"),
    path('api/bookblock/<int:id>', api_views.apiBookBlock, name="book_block"),
    path('api/uploadbook', api_views.apiUploadBook, name="api_upload_book"),
    path('api/deletebook/<int:id>', api_views.apiDeleteBook, name="api_delete_book"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


