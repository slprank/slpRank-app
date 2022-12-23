<script lang="ts">
	import { GetCurlRequest } from '$lib/helpers/Api.svelte';
	import type { User } from '$lib/components/Types.svelte';
	import { fly } from 'svelte/transition';

	$: player1 = {} as User;
	$: player2 = {} as User;

	export let playerId1: string = '';
	export let playerId2: string = '';
	export let textColor = '';
	export let displayOptions = {} as any;

	async function UpdatePlayer1(playerId: string) {
		player1 = (await GetCurlRequest(playerId)) ?? ({} as User);
		console.log(player1);
	}

	async function UpdatePlayer2(playerId: string) {
		player2 = (await GetCurlRequest(playerId)) ?? ({} as User);
		console.log(player1);
	}

	function GetPlayerRank(player: User) {
		const rating = parseInt(player?.rankedNetplayProfile?.ratingOrdinal.toFixed());
		const regionalPlacement = player?.rankedNetplayProfile?.dailyRegionalPlacement;
		switch (true) {
			case rating < 766:
				return 'BRONZE 1';
			case rating < 914:
				return 'BRONZE 2';
			case rating < 1055:
				return 'BRONZE 3';
			case rating < 1189:
				return 'SILVER 1';
			case rating < 1316:
				return 'SILVER 2';
			case rating < 1436:
				return 'SILVER 3';
			case rating < 1549:
				return 'GOLD 1';
			case rating < 1654:
				return 'GOLD 2';
			case rating < 1752:
				return 'GOLD 3';
			case rating < 1843:
				return 'PLATINUM 1';
			case rating < 1928:
				return 'PLATINUM 2';
			case rating < 2004:
				return 'PLATINUM 3';
			case rating < 2074:
				return 'DIAMOND 1';
			case rating < 2137:
				return 'DIAMOND 2';
			case rating < 2192:
				return 'DIAMOND 3';
			case rating < 2275 && regionalPlacement > 50:
				return 'MASTER 1';
			case rating < 2350 && regionalPlacement > 50:
				return 'MASTER 2';
			case rating >= 2350 && regionalPlacement > 50:
				return 'MASTER 3';
			case rating >= 2192 && regionalPlacement <= 50:
				return 'GRANDMASTER';
			default:
				return 'NONE';
		}
	}

	$: playerRank1 = GetPlayerRank(player1);
	$: playerRank2 = GetPlayerRank(player2);

	$: UpdatePlayer1(playerId1);
	$: UpdatePlayer2(playerId2);
</script>

<svelte:head>
	<title>Overview</title>
	<meta name="Overview" content="overview" />
</svelte:head>

{#if player1.displayName || player2.displayName}
	<div
		class="content"
		in:fly={{ y: 200, duration: 300, delay: 300 }}
		out:fly={{ y: -200, duration: 300 }}
	>
		<div class="character-box">
			{#if displayOptions.playerTag}
				<h1 style={`color: ${textColor}`}>{player1.displayName}</h1>
			{/if}
			{#if displayOptions.playerCode}
				<h3 style={`color: ${textColor}`}>{player1?.connectCode?.code}</h3>
			{/if}
			{#if displayOptions.rankIcon}
				<img
					style="width: 56px; height: 56px;"
					src={`./rank-icons/${playerRank1}.svg`}
					alt={'rank'}
				/>
			{/if}
			{#if displayOptions.rankText}
				<h2 style={`color: ${textColor}`}>{playerRank1}</h2>
			{/if}
			{#if displayOptions.playerRating}
				<h2 style={`color: ${textColor}`}>
					{player1?.rankedNetplayProfile?.ratingOrdinal.toFixed(1)}
				</h2>
			{/if}
			{#if displayOptions.playerWinLoss}
				<h3 style={`color: ${textColor}`}>
					Regional placement: {player1?.rankedNetplayProfile?.dailyRegionalPlacement ?? 'N/A'}
				</h3>
			{/if}
			{#if displayOptions.playerWinLoss}
				<div class="col-2-container">
					<h2 class="grid-item" style={`color: ${textColor}`}>
						Wins: {player1?.rankedNetplayProfile?.wins ?? 0}
					</h2>
					<h2 class="grid-item" style={`color: ${textColor}`}>
						Losses: {player1?.rankedNetplayProfile?.losses ?? 0}
					</h2>
				</div>
			{/if}
			{#if displayOptions.playerCharacters}
				<div class={`col-${player1?.rankedNetplayProfile?.characters.length}-container`}>
					{#each player1?.rankedNetplayProfile?.characters ?? [] as character}
						<div class="character-icon-box">
							<img
								style="width: 24px; height: 24px;"
								src={`./character-icons/${character.icon}`}
								alt={character.character}
							/>
							<h5 style={`color: ${textColor}`}>
								{`${((character.gameCount / player1?.totalGames) * 100).toFixed(1)}%`}
							</h5>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<hr style="width: 95vw; margin-top: 0.5em; margin-bottom: 0.5em;" />
		<div class="character-box">
			{#if displayOptions.playerTag}
				<h1 style={`color: ${textColor}`}>{player2.displayName}</h1>
			{/if}
			{#if displayOptions.playerCode}
				<h3 style={`color: ${textColor}`}>{player2?.connectCode?.code}</h3>
			{/if}
			{#if displayOptions.rankIcon}
				<img
					style="width: 56px; height: 56px;"
					src={`./rank-icons/${playerRank2}.svg`}
					alt={'rank'}
				/>
			{/if}
			{#if displayOptions.rankText}
				<h2 style={`color: ${textColor}`}>{playerRank2}</h2>
			{/if}
			{#if displayOptions.playerRating}
				<h2 style={`color: ${textColor}`}>
					{player2?.rankedNetplayProfile?.ratingOrdinal.toFixed(1)}
				</h2>
			{/if}
			{#if displayOptions.playerWinLoss}
				<h3 style={`color: ${textColor}`}>
					Regional placement: {player2?.rankedNetplayProfile?.dailyRegionalPlacement ?? 'N/A'}
				</h3>
			{/if}
			{#if displayOptions.playerWinLoss}
				<div class="col-2-container">
					<h2 class="grid-item" style={`color: ${textColor}`}>
						Wins: {player2?.rankedNetplayProfile?.wins ?? 0}
					</h2>
					<h2 class="grid-item" style={`color: ${textColor}`}>
						Losses: {player2?.rankedNetplayProfile?.losses ?? 0}
					</h2>
				</div>
			{/if}
			{#if displayOptions.playerCharacters}
				<div class={`col-${player2?.rankedNetplayProfile?.characters.length}-container`}>
					{#each player2?.rankedNetplayProfile?.characters ?? [] as character}
						<div class="character-icon-box">
							<img
								style="width: 24px; height: 24px;"
								src={`./character-icons/${character.icon}`}
								alt={character.character}
							/>
							<h5 style={`color: ${textColor}`}>
								{`${((character.gameCount / player2?.totalGames) * 100).toFixed(1)}%`}
							</h5>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<h1
		style={`color: ${textColor}`}
		in:fly={{ y: 200, duration: 300, delay: 300 }}
		out:fly={{ y: -200, duration: 150 }}
	>
		Waiting for game..
	</h1>
{/if}

<style>
	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 1024px;
		flex-direction: column;
		gap: 1em;
	}

	.character-box {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 500px;
		width: 400px;
		flex-direction: column;
		gap: 1em;
	}

	.character-icon-box {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.col-3-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
	}

	.col-2-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
	}

	.grid-item {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5em;
	}

	h1 {
		font-size: 2.8rem;
		text-align: center;
		margin: 0;
	}

	h2 {
		font-weight: 600;
		font-size: 2.2em;
		margin: 0;
	}

	h3 {
		font-size: 1.8rem;
		margin: 0;
	}
</style>
