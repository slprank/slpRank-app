import axios from 'axios';
import { getPlayerRank } from './rank';
import type { User } from './types';

export async function fetchSlippiUser(code: string): Promise<User | undefined> {
	let res = (await axios.get(`http://slprank.com/rank/${code.replace('#', '-')}?raw`)).data;
	if (!res) return;

	return {
		connectCode: code,
		displayName: res.displayName,
		totalGames: res.characters.map((c: any) => c.gameCount).reduce((a: number, b: number) => a + b, 0),
		rankedNetplayProfile: {
			continent: res.continent,
			characters: res.characters.map((c: any) => ({
				character: c.characterName,
				gameCount: c.gameCount,
				icon: `${c.characterName}.png`
			})),
			dailyGlobalPlacement: res.dailyGlobalPlacement,
			dailyRegionalPlacement: res.dailyRegionalPlacement,
			wins: res.wins,
			losses: res.losses,
			ratingOrdinal: res.rating,
			rank: getPlayerRank(res.number, res.dailyRegionalPlacement)
		}
	}
}
