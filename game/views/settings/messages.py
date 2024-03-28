from rest_framework.views import APIView
from rest_framework.response import Response
from game.models.player.player import Message


class MessageView(APIView):
    def get(self, request):
        data = request.GET
        username1 = data.get("username1")
        username2 = data.get("username2")
        
        messages = []
        for message in Message.objects.filter(username1=username1, username2=username2):
            messages.append({
                'username1': message.username1,
                'username2': message.username2,
                'text': message.text,
                'date': message.date,
            })

        return Response(messages)

    def post(self, request):
        data = request.POST
        username1 = data.get("username1")
        username2 = data.get("username2")
        text = data.get("text")

        Message.objects.create(username1=username1, username2=username2, text=text)
