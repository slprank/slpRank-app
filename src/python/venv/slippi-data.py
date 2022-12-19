import sys
import os

from slippi import Game;

path = sys.argv[1]

# Get recent file in path

game = Game(path)

player1 = game.metadata.players[0].netplay.code
player2 = game.metadata.players[1].netplay.code
print(f"{player1} {player2} {path}")

sys.stdout.flush()