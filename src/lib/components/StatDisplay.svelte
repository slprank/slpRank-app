<script lang="ts">
	import { GetCurlRequest } from '$lib/helpers/Api.svelte';
	import type { User } from '$lib/components/Types.svelte';
	import { fly } from 'svelte/transition';
	import type { GameStartType, OverallType, StatsType } from '@slippi/slippi-js';

	$: player1 = {} as User;
	$: player2 = {} as User;

	export let playerId1: string = '';
	export let playerId2: string = '';
	export let stats: StatsType = {} as StatsType;
	export let settings: GameStartType = {} as GameStartType;
	export let textColor = '';

	$: player1Stats = {} as OverallType;
	$: player2Stats = {} as OverallType;
	$: player1Stocks = 4;
	$: player2Stocks = 4;
	$: player1CharacterId = 0;
	$: player2CharacterId = 0;

	async function UpdatePlayer1(playerId: string) {
		player1 = (await GetCurlRequest(playerId)) ?? ({} as User);
		player1Stats = stats?.overall[0];
		player1Stocks = stats?.stocks?.filter((s) => s.playerIndex == 0).length;
		player1CharacterId = settings?.players[0]?.characterId ?? 0;
		console.log(player1);
	}

	async function UpdatePlayer2(playerId: string) {
		player2 = (await GetCurlRequest(playerId)) ?? ({} as User);
		player2Stats = stats?.overall[1];
		player2Stocks = stats?.stocks?.filter((s) => s.playerIndex == 1).length;
		player2CharacterId = settings?.players[1]?.characterId ?? 0;
	}

	$: UpdatePlayer1(playerId1);
	$: UpdatePlayer2(playerId2);

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

	$: console.log(player2);
</script>

<svelte:head>
	<title>Overview</title>
	<meta name="Overview" content="overview" />
</svelte:head>

{#if player1.displayName && player2.displayName}
	<div
		class="content"
		in:fly={{ y: 200, duration: 300, delay: 300 }}
		out:fly={{ y: -200, duration: 300 }}
	>
		<div class="character-box">
			<h2 style={`color: ${textColor}`}>{player1.displayName}</h2>
			<h5 style={`color: ${textColor}`}>{player1.connectCode.code}</h5>
			<img
				style="width: 24px; height: 24px;"
				src={`./rank-icons/${playerRank1}.svg`}
				alt={'rank'}
			/>
			<div class="stat-container">
				<div class="stat">
					<h4 style={`color: ${textColor}`}>NEUTRAL WINS</h4>
					<h4 style={`color: ${textColor}`}>
						{((player1Stats?.neutralWinRatio?.ratio ?? 0) * 100).toFixed(1)}%
					</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4 style={`color: ${textColor}`}>OPENINGS / KILL</h4>
					<h4 style={`color: ${textColor}`}>
						{(player1Stats?.openingsPerKill?.ratio ?? 0).toFixed(1)}
					</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4 style={`color: ${textColor}`}>INPUTS / SEC</h4>
					<h4 style={`color: ${textColor}`}>
						{((player1Stats?.inputsPerMinute?.ratio ?? 0) / 60).toFixed(1)}
					</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4 style={`color: ${textColor}`}>TOTAL DAMAGE</h4>
					<h4 style={`color: ${textColor}`}>{(player1Stats?.totalDamage ?? 0).toFixed(1)}%</h4>
				</div>
				<hr class="hr" />
			</div>
			<h5 style={`color: ${textColor}`}>
				Regional placement: {player1?.rankedNetplayProfile?.dailyRegionalPlacement ?? 'N/A'}
			</h5>
			<h2 style={`color: ${textColor}`}>{player1.rankedNetplayProfile.ratingOrdinal.toFixed(1)}</h2>
		</div>
		<hr style="width: 95vw" />
		<div class="character-box">
			<h2 style={`color: ${textColor}`}>{player2.displayName}</h2>
			<h5 style={`color: ${textColor}`}>{player2.connectCode.code}</h5>
			<img
				style="width: 24px; height: 24px;"
				src={`./rank-icons/${playerRank2}.svg`}
				alt={'rank'}
			/>
			<div class="stat-container">
				<div class="stat">
					<h4 style={`color: ${textColor}`}>NEUTRAL WINS</h4>
					<h4 style={`color: ${textColor}`}>
						{((player2Stats?.neutralWinRatio?.ratio ?? 0) * 100).toFixed(1)}%
					</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4 style={`color: ${textColor}`}>OPENINGS / KILL</h4>
					<h4 style={`color: ${textColor}`}>
						{(player2Stats?.openingsPerKill?.ratio ?? 0).toFixed(1)}
					</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4 style={`color: ${textColor}`}>INPUTS / SEC</h4>
					<h4 style={`color: ${textColor}`}>
						{((player2Stats?.inputsPerMinute?.ratio ?? 0) / 60).toFixed(1)}
					</h4>
				</div>
				<hr class="hr" />
				<div class="stat">
					<h4 style={`color: ${textColor}`}>TOTAL DAMAGE</h4>
					<h4 style={`color: ${textColor}`}>{(player2Stats?.totalDamage ?? 0).toFixed(1)}%</h4>
				</div>
				<hr class="hr" />
			</div>
			<div class="col-2-container">
				<h2 class="grid-item" style={`color: ${textColor}`}>
					Wins: {player2?.rankedNetplayProfile?.wins ?? 0}
				</h2>
				<h2 class="grid-item" style={`color: ${textColor}`}>
					Losses: {player2?.rankedNetplayProfile?.losses ?? 0}
				</h2>
			</div>
			<h5 style={`color: ${textColor}`}>
				Regional placement: {player2?.rankedNetplayProfile?.dailyRegionalPlacement ?? 'N/A'}
			</h5>
			<h2 style={`color: ${textColor}`}>{player2.rankedNetplayProfile.ratingOrdinal.toFixed(1)}</h2>
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
		padding: 1em;
		gap: 1em;
	}
	.stat-container {
		display: flex;
		height: 100%;
		width: 100%;
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

	.col-3-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
	}

	.stock-container {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
	}

	.stock {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5em;
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
	h4 {
		font-size: 1.6rem;
		margin: 0;
	}
	h5 {
		font-size: 1.2rem;
		margin: 0;
	}
</style>
