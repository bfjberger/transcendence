from django.urls import path
from . import views

urlpatterns = [
		path('', views.ExampleView.as_view()),
    path('UserList/', views.UserList.as_view()),
    path('UserDetail/<int:pk>/', views.UserDetail.as_view()),
]