import type { GameStartType, OverallType, StatsType } from '@slippi/slippi-js';

interface Character {
	character: string;
	gameCount: number;
	icon: string;
}

export interface User {
	connectCode: string;
	displayName: string;
	rankedNetplayProfile: RankedNetplayProfile;
	totalGames: number;
}

export interface Player {
	stats: OverallType;
	characterId: number;
	stocks: number;
}

interface RankedNetplayProfile {
	continent: string;
	characters: Character[];
	dailyGlobalPlacement: number;
	dailyRegionalPlacement: number;
	losses: number;
	wins: number;
	ratingOrdinal: number;
	rank: string;
}