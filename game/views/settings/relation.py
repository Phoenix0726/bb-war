from rest_framework.views import APIView
from rest_framework.response import Response
from game.models.player.player import Relation


class RelationView(APIView):
    def post(self, request):
        data = request.POST
        username1 = data.get("username1")
        username2 = data.get("username2")
        operation = data.get("operation")

        if operation == "add":
            if Relation.objects.filter(username1=username1, username2=username2).exists():
                return Response({
                    'result': "你已经添加了该好友",
                })
            Relation.objects.create(username1=username1, username2=username2)
        elif operation == "remove":
            Relation.objects.filter(username1=username1, username2=username2).delete()

        return Response({
            'result': "success",
        })

