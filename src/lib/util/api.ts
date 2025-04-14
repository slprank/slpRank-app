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
		const response = await axios.post(
			"https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql",
			{
				query: `query AccountManagementPageQuery($cc: String!) {
			          getConnectCode(code: $cc) {
			            user {
			              fbUid
			              displayName
			              connectCode {
			                code
			              }
			              status
			              activeSubscription {
			                level
			                hasGiftSub
			              }
			              rankedNetplayProfile {
			                id
			                ratingOrdinal
			                ratingUpdateCount
					ratingMu
					ratingSigma
			                wins
			                losses
			                dailyGlobalPlacement
			                dailyRegionalPlacement
			                continent
			                characters {
			                  character
			                  gameCount
			                }
			              }
			            }
			          }
			        }`,
				variables: { cc: connectCode },
			},
			{
				headers: {
					"Content-Type": "application/json",
					Accept: "*/*",
					"apollographql-client-name": "slippi-web",
				},
			}
		);

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
