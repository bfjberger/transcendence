from snippets.models import Snippet
from snippets.serializers import SnippetSerializer, UserSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework import permissions
from snippets.permissions import IsOwnerOrReadOnly

class SnippetList(generics.ListCreateAPIView):
	queryset = Snippet.objects.all()
	serializer_class = SnippetSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]

	def perform_create(self, serializer):
		print ("erer : ", self.request.user)
		serializer.save(owner=self.request.user)

class SnippetDetail(generics.RetrieveUpdateDestroyAPIView):
	permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
	queryset = Snippet.objects.all()
	serializer_class = SnippetSerializer

class UserList(generics.ListAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer

class UserDetail(generics.RetrieveAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer