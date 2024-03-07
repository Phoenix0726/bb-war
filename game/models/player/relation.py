from django.db import models


class Relation(models.Model):
    username1 = models.CharField(default="", max_length=50, blank=True, null=True)
    username2 = models.CharField(default="", max_length=50, blank=True, null=True)

    def __str__(self):
        return username1
