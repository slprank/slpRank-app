import type { PlayerType } from '@slippi/slippi-js';
import type { Character } from './types';

export function getPlayerCharacter(player: PlayerType): Character {
	return {
		characterId: player?.characterId,
		characterColorId: player?.characterColor
	} as Character;
}
