from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=256, blank=True)
    openid = models.CharField(default="", max_length=50, blank=True, null=True)
    score = models.IntegerField(default=1500)

    def __str__(self):
        return str(self.user)


class Relation(models.Model):
    username1 = models.CharField(default="", max_length=50)
    username2 = models.CharField(default="", max_length=50)

    def __str__(self):
        return self.username1 + ' ' + self.username2


class Message(models.Model):
    username1 = models.CharField(default="", max_length=50, blank=True, null=True)
    username2 = models.CharField(default="", max_length=50, blank=True, null=True)
    text = models.CharField(default="", max_length=50, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username1 + ' -> ' + self.username2 + ' ' + self.text

