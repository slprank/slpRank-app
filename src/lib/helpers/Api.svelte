<script lang="ts" context="module">
	import type { User } from '../components/Types.svelte';

	export async function GetCurlRequest(playerId: string): Promise<User | null> {
		let response = await fetch('https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql', {
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
					cc: `${playerId}`,
					uid: `${playerId}`
				},
				query:
					'fragment userProfilePage on User {\n  fbUid\n  displayName\n  connectCode {\n    code\n    __typename\n  }\n  status\n  activeSubscription {\n    level\n    hasGiftSub\n    __typename\n  }\n  rankedNetplayProfile {\n    id\n    ratingOrdinal\n    ratingUpdateCount\n    wins\n    losses\n    dailyGlobalPlacement\n    dailyRegionalPlacement\n    continent\n    characters {\n      id\n      character\n      gameCount\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nquery AccountManagementPageQuery($cc: String!, $uid: String!) {\n  getUser(fbUid: $uid) {\n    ...userProfilePage\n    __typename\n  }\n  getConnectCode(code: $cc) {\n    user {\n      ...userProfilePage\n      __typename\n    }\n    __typename\n  }\n}\n'
			})
		});

		let rawPlayerData = await response.json();
		if (!rawPlayerData.data.getConnectCode) return;
		let userData = rawPlayerData.data.getConnectCode.user as User;
		userData.totalGames = userData.rankedNetplayProfile.characters
			.map((c) => c.gameCount)
			.reduce((partialSum, a) => partialSum + a, 0);

		userData.rankedNetplayProfile.characters = userData.rankedNetplayProfile.characters
			.sort((a, b) => b.gameCount - a.gameCount)
			.slice(0, 3);
		userData.rankedNetplayProfile.characters.forEach(
			(character) => (character.icon = `${character.character}.png`)
		);

		return userData;
	}
</script>
