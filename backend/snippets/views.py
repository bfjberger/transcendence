from snippets.models import Snippet
from snippets.serializers import SnippetSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class SnippetList(APIView):
		def get(self, request, format=None):
				snippets = Snippet.objects.all()
				serializer = SnippetSerializer(snippets, many=True)
				print("Putain mais va te faire foutre")
				return Response(serializer.data)

		def post(self, request, format=None):
				serializer = SnippetSerializer(data=request.data)
				if serializer.is_valid():
						serializer.save()
						return Response(serializer.data, status=status.HTTP_201_CREATED)
				return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SnippetDetail(APIView):
    """
    Retrieve, update or delete a snippet instance.
    """
    def get_object(self, pk):
        try:
            return Snippet.objects.get(pk=pk)
        except Snippet.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        snippet = self.get_object(pk)
        serializer = SnippetSerializer(snippet)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        snippet = self.get_object(pk)
        serializer = SnippetSerializer(snippet, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        snippet = self.get_object(pk)
        snippet.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


"""
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

from snippets.models import Snippet
from snippets.serializers import SnippetSerializer

from rest_framework.parsers import JSONParser
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

@csrf_exempt
def snippet_list(request):
		if request.method == 'GET':
				snippets = Snippet.objects.all()
				serializer = SnippetSerializer(snippets, many=True)
				return JsonResponse(serializer.data, safe=False)

		elif request.method == 'POST':
				data = JSONParser().parse(request)
				serializer = SnippetSerializer(data=data)
				if serializer.is_valid():
						serializer.save()
						return JsonResponse(serializer.data, status=201)
				return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def snippet_detail(request, pk):
		try:
				snippet = Snippet.objects.get(pk=pk)
		except Snippet.DoesNotExist:
				return HttpResponse(status=404)

		if request.method == 'GET':
				serializer = SnippetSerializer(snippet)
				return JsonResponse(serializer.data)

		elif request.method == 'PUT':
				data = JSONParser().parse(request)
				serializer = SnippetSerializer(snippet, data=data)
				if serializer.is_valid():
						serializer.save()
						return JsonResponse(serializer.data)
				return JsonResponse(serializer.errors, status=400)

		elif request.method == 'DELETE':
				snippet.delete()
				return HttpResponse(status=204)
"""