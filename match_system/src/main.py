#! /usr/bin/env python3


import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from queue import Queue
from time import sleep
from threading import Thread
from asgiref.sync import async_to_sync
from django.core.cache import cache

from match_server.match_service import Match
from bbwar.asgi import channel_layer


queue = Queue()     # 消息队列


class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0


class Pool:
    def __init__(self):
        self.players = []

    def add_player(self, player):
        self.players.append(player)

    def check_match(self, player1, player2):
        dt = abs(player1.score - player2.score)
        player1_max_diff = player1.waiting_time * 5
        player2_max_diff = player2.waiting_time * 50
        return dt <= player1_max_diff and dt <= player2_max_diff

    def match_success(self, players):
        print("Match Success: %s %s %s" % (players[0].username, players[1].username, players[2].username))
        room_name = "room-%s-%s-%s" % (players[0].uuid, players[1].uuid, players[2].uuid)

        for player in players:
            async_to_sync(channel_layer.group_add)(room_name, player.channel_name)
            '''players.append({
                'uuid': player.uuid,
                'username': player.username,
                'photo': player.photo,
                'hp': 100,
            })'''

        cache.set(room_name, players, 3600)

        for player in players:
            async_to_sync(channel_layer.group_send) (
                room_name,
                {
                    'type': "group_send_event",
                    'event': "create player",
                    'uuid': player.uuid,
                    'photo': player.photo,
                }
            )

    def match(self):
        while len(self.players) >= 3:
            self.players = sorted(self.players, key=lambda player: player.score)
            flag = False
            for i in range(len(self.players) - 2):
                p1, p2, p3 = self.players[i], self.players[i + 1], self.players[i + 2]
                if self.check_match(p1, p2) and self.check_match(p1, p3) and self.check_match(p2, p3):
                    self.match_success([p1, p2, p3])
                    self.players = self.players[:i] + self.players[i + 3:]
                    flag = True
                    break
            if not flag:
                break

    def inc_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1


class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        print("Add player: %s %d" % (username, score))
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0


def get_player_from_queue():
    try:
        return queue.get_nowait();
    except:
        return None


def worker():
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)

    # You could do one of these for a multithreaded server
    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)
    # server = TServer.TThreadPoolServer(
    #     processor, transport, tfactory, pfactory)

    Thread(target=worker, daemon=True).start()

    print('Starting the server...')
    server.serve()
    print('done.')
