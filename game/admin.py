from django.contrib import admin
from game.models.player.player import Player, Relation, Message

# Register your models here.

admin.site.register(Player)
admin.site.register(Relation)
admin.site.register(Message)
