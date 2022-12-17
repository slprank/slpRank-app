<script lang="ts">
	import { GetCurlRequest } from '$lib/helpers/Api.svelte';
	import type { User } from '$lib/components/Types.svelte';
	import { fly } from 'svelte/transition';

	// Listen for changes in playerIds
	$: player1 = {} as User;
	$: player2 = {} as User;
	// If id changes - request data for new Ids
	export let playerId1: string = '';
	export let playerId2: string = '';

	async function UpdatePlayer1(playerId: string) {
		player1 = (await GetCurlRequest(playerId)) ?? ({} as User);
		console.log('player1', player1);
	}

	async function UpdatePlayer2(playerId: string) {
		player2 = (await GetCurlRequest(playerId)) ?? ({} as User);
		console.log('player2', player2);
	}

	$: UpdatePlayer1(playerId1);
	$: UpdatePlayer2(playerId2);

	$: console.log(player1);
</script>

<svelte:head>
	<title>Overview</title>
	<meta name="Overview" content="overview" />
</svelte:head>

{#if player1.displayName && player2.displayName}
	<div class="content" transition:fly={{ y: 200, duration: 300 }}>
		<div class="character-box">
			<h1>{player1.displayName}</h1>
			<h2>{player1.connectCode.code}</h2>
			<img style="width: 56px; height: 56px;" src={`./rank-icons/GRANDMASTER.svg`} alt={'rank'} />
			<h2>{player1.rankedNetplayProfile.ratingOrdinal.toFixed(1)}</h2>
			<div class="grid grid-cols-auto gap-4">
				{#each player1.rankedNetplayProfile.characters as character}
					<div class="character-icon-box">
						<img
							style="width: 24px; height: 24px;"
							src={`./character-icons/${character.icon}`}
							alt={character.character}
						/>
						<div>{`${((character.gameCount / player1.totalGames) * 100).toFixed(1)}%`}</div>
					</div>
				{/each}
			</div>
		</div>
		<hr />
		<div class="character-box">
			<h1>{player2.displayName}</h1>
			<h3>{player2.connectCode.code}</h3>
			<img style="width: 56px; height: 56px;" src={`./rank-icons/GRANDMASTER.svg`} alt={'rank'} />
			<h2>GRANDMASTER</h2>
			<h2>{player2.rankedNetplayProfile.ratingOrdinal.toFixed(1)}</h2>
			<div class="grid grid-cols-3 gap-2">
				{#each player2.rankedNetplayProfile.characters as character}
					<div class="character-icon-box">
						<img
							style="width: 24px; height: 24px;"
							src={`./character-icons/${character.icon}`}
							alt={character.character}
						/>
						<div>{`${((character.gameCount / player2.totalGames) * 100).toFixed(1)}%`}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
