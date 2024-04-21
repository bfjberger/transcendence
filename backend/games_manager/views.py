from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

class GameHistory (APIView) :

	def get (self, request) :
		return Response("TEST", status=status.HTTP_200_OK)