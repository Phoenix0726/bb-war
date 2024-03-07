from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from game.models.player.player import Player


class FriendsView(APIView):
    permission_classes = ([IsAuthenticated])

    def get(self, request):
        friends = Player.objects.all()
        resp = []
        for friend in friends:
            resp.append({
                'username': friend.user.username,
                'photo': friend.photo,
            })
        return Response(resp)
