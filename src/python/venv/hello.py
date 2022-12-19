import sys
import os

from slippi import Game;

game = Game('/Users/sindrevatnaland/Slippi/Game_20221014T153531.slp')

print(game.metadata.players[0].netplay.code)
print(game.metadata.players[1].netplay.code)

sys.stdout.flush()