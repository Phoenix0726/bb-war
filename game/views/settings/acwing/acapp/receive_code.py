from django.http import JsonResponse
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from random import randint
from rest_framework_simplejwt.tokens import RefreshToken

from game.models.player.player import Player


def receive_code(request):
    data = request.GET

    if 'errcode' in data:
        return JsonResponse({
            'result': "apply failed",
            'errcode': data['errcode'],
            'errmsg': data['errmsg'],
        })

    code = data.get('code')
    state = data.get('state')
    
    if not cache.has_key(state):
        return JsonResponse({
            'result': "state not exist",
        })
    cache.delete(state)

    ### step2: 申请授权令牌 access_token 和用户的 openid
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "6552",
        'secret': "04b291498953415fb1f474e1b768acee",
        'code': code,
    }

    access_token_res = requests.get(apply_access_token_url, params=params).json()

    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)
    # 如果用户已存在，直接登录
    if players.exists():
        player = players[0]
        refresh = RefreshToken.for_user(player.user)
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

    ### step3: 申请用户信息
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token': access_token,
        'openid': openid,
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    # 找到一个新用户名
    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    refresh = RefreshToken.for_user(user)
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })
