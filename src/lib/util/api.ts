import axios from 'axios';
import { getPlayerRank } from './rank';
import type { Character, Player } from './types';

export async function fetchSlippiUser(connectCode: string): Promise<Player | undefined> {
	if (!connectCode) return;

	try {
		const response = await axios.post(
			"https://internal.slippi.gg/graphql",
			{
				query: `
				fragment profileFields on NetplayProfile {
					id
					ratingMu
					ratingSigma
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
						...profileFields
						__typename
					}
					rankedNetplayProfileHistory {
						...profileFields
						season {
							id
							startedAt
							endedAt
							name
							status
							__typename
						}
						__typename
					}
					__typename
				}
				query UserProfilePageQuery($cc: String, $uid: String) {
					getUser(fbUid: $uid, connectCode: $cc) {
						...userProfilePage
						__typename
					}
				}
			`,
				variables: { cc: connectCode, uid: null },
			},
			{
				headers: {
					"Content-Type": "application/json",
					Accept: "*/*",
					"apollographql-client-name": "slippi-web",
				},
			}
		);

		const data =
			response?.data.data;


		let player: Player = await data?.getUser;
		if (!player) {
			console.log('No player data found in response:', response.data.data);
			return;
		}

		const profile = player.rankedNetplayProfile;
		if (!profile) {
			console.log('No ranked profile found for player:', player);
			return;
		}

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
		if (axios.isAxiosError(error)) {
			console.log('Response data:', error.response?.data);
			console.log('Response status:', error.response?.status);
		}
	}
}
