import axios from 'axios';
import { getPlayerRank } from './rank';
import type { Character, Player, slpPlayer } from './types';

export async function fetchSlippiUser(connectCode: string): Promise<Player | undefined> {
	if (!connectCode) return;

	try {
		let slpPlayer: slpPlayer = (
			await axios.get(`http://slprank.com/rank/${connectCode.replace('#', '-')}?raw`)
		).data;
		console.log(slpPlayer);
		return {
			connectCode: connectCode,
			displayName: slpPlayer.displayName,
			totalGames: slpPlayer.characters
				.map((c: any) => c.gameCount)
				.reduce((a: number, b: number) => a + b, 0),
			rankedNetplayProfile: {
				...slpPlayer,
				continentInitials:
					slpPlayer.continent?.split(' ').length == 2
						? slpPlayer.continent
								.split(' ')
								.map((c: string) => c[0])
								.join('')
								.toUpperCase()
						: slpPlayer.continent?.substring(0, 2).toUpperCase() ?? '',
				characters: slpPlayer?.characters
					.sort((a: Character, b: Character) => b.gameCount - a.gameCount)
					.slice(0, 3)
					.map(
						(c: Character): Character => ({
							character: c.characterName?.toUpperCase() ?? '',
							characterName: c.characterName?.toUpperCase() ?? '',
							gameCount: c.gameCount,
							icon: `${c.characterName?.toUpperCase().replace(/\s+/g, '_')}.png`,
							characterId: -1,
							characterColorId: -1
						})
					) as unknown as Character,
				dailyGlobalPlacement: slpPlayer.dailyGlobalPlacement,
				dailyRegionalPlacement: slpPlayer.dailyRegionalPlacement,
				wins: slpPlayer.wins ?? 0,
				losses: slpPlayer.losses ?? 0,
				ratingOrdinal: slpPlayer.rating,
				rank: slpPlayer.rank.toUpperCase()
			},
			stats: undefined
		};
	} catch (error) {
		console.log(error);
	}

	try {
		let res = await fetch('https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: '*/*',
				'Accept-Encoding': 'gzip, deflate, br',
				Host: 'gql-gateway-dot-slippi.uc.r.appspot.com',
				'Accept-Language': 'en-GB,en;q=0.9',
				Origin: 'https://slippi.gg',
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
				Connection: 'keep-alive',
				Referer: 'https://slippi.gg/',
				'Content-Length': '838',
				Priority: 'u=3, i',
				'apollographql-client-name': 'slippi-web'
			},
			body: JSON.stringify({
				operationName: 'AccountManagementPageQuery',
				variables: {
					cc: `${connectCode}`,
					uid: `${connectCode}`
				},
				query:
					'fragment userProfilePage on User {\n  fbUid\n  displayName\n  connectCode {\n    code\n    __typename\n  }\n  status\n  activeSubscription {\n    level\n    hasGiftSub\n    __typename\n  }\n  rankedNetplayProfile {\n    id\n    ratingOrdinal\n    ratingUpdateCount\n    wins\n    losses\n    dailyGlobalPlacement\n    dailyRegionalPlacement\n    continent\n    characters {\n      id\n      character\n      gameCount\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nquery AccountManagementPageQuery($cc: String!, $uid: String!) {\n  getUser(fbUid: $uid) {\n    ...userProfilePage\n    __typename\n  }\n  getConnectCode(code: $cc) {\n    user {\n      ...userProfilePage\n      __typename\n    }\n    __typename\n  }\n}\n'
			})
		});

		let resUnpacked = await res.json();
		let player: Player = resUnpacked?.data?.getConnectCode?.user;
		if (!res) return;

		return {
			connectCode: connectCode,
			displayName: player.displayName,
			totalGames: player.rankedNetplayProfile.characters
				.map((c: any) => c.gameCount)
				.reduce((a: number, b: number) => a + b, 0),
			rankedNetplayProfile: {
				...player,
				continentInitials:
					player.rankedNetplayProfile.continent?.split('_').length == 2
						? player.rankedNetplayProfile.continent
								.split('_')
								.map((c: string) => c[0])
								.join('')
						: player.rankedNetplayProfile.continent?.substring(0, 2) ?? '',
				characters: player?.rankedNetplayProfile?.characters
					.sort((a: Character, b: Character) => b.gameCount - a.gameCount)
					.slice(0, 3)
					.map(
						(c: Character): Character => ({
							character: c.character,
							gameCount: c.gameCount,
							icon: `${c.character.replace(/\s+/g, '_')}.png`,
							characterId: -1,
							characterColorId: -1,
							characterName: c.characterName?.toUpperCase() ?? ''
						})
					) as unknown as Character,
				dailyGlobalPlacement: player.rankedNetplayProfile.dailyGlobalPlacement,
				dailyRegionalPlacement:
					player.rankedNetplayProfile.leaderboardPlacement ??
					player.rankedNetplayProfile.dailyRegionalPlacement,
				wins: player.rankedNetplayProfile.wins ?? 0,
				losses: player.rankedNetplayProfile.losses ?? 0,
				ratingOrdinal: player.rankedNetplayProfile.ratingOrdinal,
				rank: getPlayerRank(
					player.rankedNetplayProfile.ratingOrdinal,
					player.rankedNetplayProfile.dailyRegionalPlacement
				)
			},
			stats: undefined
		};
	} catch (error) {
		console.log(error);
	}
}
