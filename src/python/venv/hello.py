import sys
import os

from slippi import Game;

game = Game('/Users/sindrevatnaland/Slippi/Game_20221014T153531.slp')

player1 = game.metadata.players[0].netplay.code
player2 = game.metadata.players[1].netplay.code
print(f"{player1} {player2}")

sys.stdout.flush()