from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():
    state = ""
    for i in range(8):
        state += str(randint(0, 9))
    return state


def apply_code(request):
    ### step1: 申请授权码 code
    appid = "6552"
    redirect_uri = quote("https://app6552.acapp.acwing.com.cn/settings/acwing/acapp/receive_code/")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200)    # 有效期2小时
    
    return JsonResponse({
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })
