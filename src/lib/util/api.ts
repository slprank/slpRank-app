import axios from 'axios';
import { getPlayerRank } from './rank';
import type { Character, Player, slpPlayer } from './types';

export async function fetchSlippiUser(connectCode: string): Promise<Player | undefined> {
	if (!connectCode) return;

	await new Promise((resolve) => setTimeout(resolve, 2000));

	try {
		let slpPlayer: slpPlayer = (
			await axios.get(`http://slprank.com/rank/${connectCode.replace('#', '-')}?raw`)
		).data;
		console.log(slpPlayer);
		const characters = slpPlayer?.characters
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
			) as unknown as Character[];
		return {
			connectCode: connectCode,
			displayName: slpPlayer.displayName,
			character: characters[0],
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
				characters,
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
		let res = await axios.post('https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql', {
			operationName: 'AccountManagementPageQuery',
			variables: {
				cc: connectCode,
				uid: connectCode
			},
			query: `fragment profileFieldsV2 on NetplayProfileV2 {
				id
				ratingOrdinal
				ratingUpdateCount
				wins
				losses
				dailyGlobalPlacement
				dailyRegionalPlacement
				continent
				characters {
					character
					gameCount
					__typename
				}
				__typename
			}

			fragment userProfilePage on User {
				fbUid
				displayName
				connectCode {
					code
					__typename
				}
				status
				activeSubscription {
					level
					hasGiftSub
					__typename
				}
				rankedNetplayProfile {
					...profileFieldsV2
					__typename
				}
				__typename
			}

			query AccountManagementPageQuery($cc: String!, $uid: String!) {
				getUser(fbUid: $uid) {
					...userProfilePage
					__typename
				}
				getConnectCode(code: $cc) {
					user {
						...userProfilePage
						__typename
					}
					__typename
				}
			}`
		}, {
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
				'apollographql-client-name': 'slippi-web'
			}
		});

		let player = res.data?.data?.getConnectCode?.user;
		if (!player) return;

		const profile = player.rankedNetplayProfile;
		const characters = profile.characters
			.sort((a: any, b: any) => b.gameCount - a.gameCount)
			.slice(0, 3)
			.map((c: any): Character => ({
				character: c.character,
				characterName: c.character,
				gameCount: c.gameCount,
				icon: `${c.character.replace(/\s+/g, '_')}.png`,
				characterId: -1,
				characterColorId: -1
			}));

		return {
			connectCode: connectCode,
			displayName: player.displayName,
			character: characters[0],
			totalGames: profile.characters
				.map((c: any) => c.gameCount)
				.reduce((a: number, b: number) => a + b, 0),
			rankedNetplayProfile: {
				...profile,
				continentInitials:
					profile.continent?.split('_').length == 2
						? profile.continent
							.split('_')
							.map((c: string) => c[0])
							.join('')
						: profile.continent?.substring(0, 2) ?? '',
				characters,
				dailyGlobalPlacement: profile.dailyGlobalPlacement,
				dailyRegionalPlacement: profile.dailyRegionalPlacement,
				wins: profile.wins ?? 0,
				losses: profile.losses ?? 0,
				ratingOrdinal: profile.ratingOrdinal,
				rank: getPlayerRank(
					profile.ratingOrdinal,
					profile.dailyRegionalPlacement,
					profile.dailyGlobalPlacement
				)
			},
			stats: undefined
		};
	} catch (error) {
		console.log('Error fetching player data:', error);
	}
}
