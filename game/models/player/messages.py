from django.db import models


class Message(models.Model):
    username1 = models.CharField(default="", max_length=50, blank=True, null=True)
    username2 = models.CharField(default="", max_length=50, blank=True, null=True)
    text = models.CharField(default="", max_length=50, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return username1
