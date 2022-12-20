<script lang="ts">
	import { GetCurlRequest } from '$lib/helpers/Api.svelte';
	import type { User } from '$lib/components/Types.svelte';
	import { fly } from 'svelte/transition';
	import type { StatsType } from '@slippi/slippi-js';

	$: player1 = {} as User;
	$: player2 = {} as User;

	export let playerId1: string = '';
	export let playerId2: string = '';
	export let stats: StatsType = {} as StatsType;

	async function UpdatePlayer1(playerId: string) {
		player1 = (await GetCurlRequest(playerId)) ?? ({} as User);
		console.log('player1', player1);
	}

	async function UpdatePlayer2(playerId: string) {
		player2 = (await GetCurlRequest(playerId)) ?? ({} as User);
		console.log('player2', player2);
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

	$: console.log(stats); // Utilize

	$: playerRank1 = GetPlayerRank(player1);
	$: playerRank2 = GetPlayerRank(player2);

	$: UpdatePlayer1(playerId1);
	$: UpdatePlayer2(playerId2);
</script>

<svelte:head>
	<title>Overview</title>
	<meta name="Overview" content="overview" />
</svelte:head>

{#if player1.displayName && player2.displayName}
	<div class="content" transition:fly={{ y: 200, duration: 300 }}>
		<div class="character-box">
			<h2>{player1.displayName}</h2>
			<img
				style="width: 24px; height: 24px;"
				src={`./rank-icons/${playerRank1}.svg`}
				alt={'rank'}
			/>
			<div class="stat-container">
				<div class="stat">
					<h4>NEUTRAL WINS</h4>
					<h4>{'28'}%</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4>AVERAGE PUNISH</h4>
					<h4>{'42.5'}%</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4>OPENINGS / KILL</h4>
					<h4>{'6.8'}</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4>CENTER CONTROL</h4>
					<h4>{'37'}%</h4>
				</div>
				<hr class="hr" />
			</div>
			<h5>{player1.connectCode.code}</h5>
			<h2>{player1.rankedNetplayProfile.ratingOrdinal.toFixed(1)}</h2>
		</div>
		<hr style="width: 100vw" />
		<div class="character-box">
			<h2>{player2.displayName}</h2>
			<img
				style="width: 24px; height: 24px;"
				src={`./rank-icons/${playerRank1}.svg`}
				alt={'rank'}
			/>
			<div class="stat-container">
				<div class="stat">
					<h4>NEUTRAL WINS</h4>
					<h4>{'28'}%</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4>AVERAGE PUNISH</h4>
					<h4>{'42.5'}%</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4>OPENINGS / KILL</h4>
					<h4>{'6.8'}</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4>CENTER CONTROL</h4>
					<h4>{'37'}%</h4>
				</div>
				<hr class="hr" />
			</div>
			<h5>{player2.connectCode.code}</h5>
			<h2>{player2.rankedNetplayProfile.ratingOrdinal.toFixed(1)}</h2>
		</div>
	</div>
{/if}

<style>
	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 800px;
		flex-direction: column;
		gap: 1em;
	}

	.character-box {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 300px;
		width: 350px;
		flex-direction: column;
		padding: 1em;
		gap: 0.6em;
	}
	.stat-container {
		display: flex;
		height: 100%;
		width: 70%;
		flex-direction: column;
		padding: 1em;
		gap: 0.2em;
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

	.stat {
		display: flex;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
		align-content: space-around;
		justify-content: space-between;
	}

	.value {
		display: flex;
		right: 0;
	}

	.grid_item {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5em;
	}

	hr {
		width: 100%;
		margin: 0.2em;
	}

	h1 {
		font-size: 2rem;
		text-align: center;
		margin: 0;
	}

	h2 {
		font-weight: 600;
		font-size: 1.5em;
		margin: 0;
	}

	h3 {
		font-size: 1.2rem;
		margin: 0;
	}
	h4 {
		font-size: 1rem;
		margin: 0;
	}
	h5 {
		font-size: 0.8rem;
		margin: 0;
	}
</style>
