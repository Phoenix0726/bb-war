from django.urls import path, include


urlpatterns = [
    path("web/", include("game.urls.settings.acwing.web.index")),
    path("acapp/", include("game.urls.settings.acwing.acapp.index")),
]
