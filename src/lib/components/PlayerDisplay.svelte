<script lang="ts">
	import type { Options, Player } from '$lib/util/types';
	import { fly } from 'svelte/transition';

	export let player: Player;
	export let textColor = '';
	export let displayOptions = {} as Options;
	export let winColor: string;
	export let loseColor: string;
</script>

<div class="player-box">
	{#if displayOptions?.playerDisplayName}
		<h3
			style={`color: ${textColor}`}
			in:fly={{ x: 100, duration: 300, delay: 305 }}
			out:fly={{ x: -100, duration: 300, delay: 50 }}
		>
			{player?.displayName}
		</h3>
	{/if}
	{#if displayOptions?.playerRankIcon}
		<img
			in:fly={{ x: 100, duration: 300, delay: 400 }}
			out:fly={{ x: -100, duration: 300, delay: 100 }}
			style="width: 56px; height: 56px;"
			src={`./rank-icons/${player?.rankedNetplayProfile?.rank}.svg`}
			alt={'rank'}
		/>
	{/if}
	{#if displayOptions?.playerRankText}
		<h3
			style={`color: ${textColor}`}
			in:fly={{ x: 100, duration: 300, delay: 450 }}
			out:fly={{ x: -100, duration: 300, delay: 150 }}
		>
			{player?.rankedNetplayProfile?.rank}
		</h3>
	{/if}
	{#if displayOptions?.playerRating}
		<h3
			style={`color: ${textColor}`}
			in:fly={{ x: 100, duration: 300, delay: 500 }}
			out:fly={{ x: -100, duration: 300, delay: 200 }}
		>
			{player?.rankedNetplayProfile?.ratingOrdinal.toFixed(1)}
		</h3>
	{/if}
	{#if displayOptions?.playerPlacement}
		<h3
			style={`color: ${textColor}`}
			in:fly={{ x: 100, duration: 300, delay: 550 }}
			out:fly={{ x: -100, duration: 300, delay: 250 }}
		>
			{player?.rankedNetplayProfile.dailyRegionalPlacement
				? `#${player?.rankedNetplayProfile.dailyRegionalPlacement}`
				: `${
						player?.rankedNetplayProfile.dailyGlobalPlacement
							? `#${player?.rankedNetplayProfile.dailyGlobalPlacement}`
							: ''
				  }`}
			{player?.rankedNetplayProfile?.continentInitials
				? `[${
						player?.rankedNetplayProfile.dailyRegionalPlacement
							? player?.rankedNetplayProfile.continentInitials
							: `${
									player?.rankedNetplayProfile.dailyGlobalPlacement
										? 'GL'
										: player?.rankedNetplayProfile.continentInitials
							  }`
				  }]`
				: ''}
		</h3>
	{/if}
	{#if displayOptions?.playerWinLoss}
		<div class="col-2-container">
			<div
				class="win-loss"
				in:fly={{ x: 100, duration: 300, delay: 600 }}
				out:fly={{ x: -100, duration: 300, delay: 350 }}
			>
				<h3 style={`color: ${textColor}`}>W:</h3>
				<h3 style={`color: ${winColor}`}>
					{player?.rankedNetplayProfile?.wins ?? 0}
				</h3>
			</div>
			<div
				class="win-loss"
				in:fly={{ x: 100, duration: 300, delay: 650 }}
				out:fly={{ x: -100, duration: 300, delay: 400 }}
			>
				<h3 style={`color: ${textColor}`}>L:</h3>
				<h3 style={`color: ${loseColor}`}>
					{player?.rankedNetplayProfile?.losses ?? 0}
				</h3>
			</div>
		</div>
	{/if}
	{#if displayOptions?.playerCharacters}
		<div
			class={`col-${player?.rankedNetplayProfile?.characters?.length}-container`}
			in:fly={{ x: 100, duration: 300, delay: 700 }}
			out:fly={{ x: -100, duration: 300, delay: 450 }}
		>
			{#each player?.rankedNetplayProfile?.characters ?? [] as character}
				<div class="character-icon-box">
					<img
						style="width: 24px; height: 24px;"
						src={`./character-icons/${character.icon}`}
						alt={character.character}
					/>
					<h5 style={`color: ${textColor}`}>
						{`${((character.gameCount / player?.totalGames) * 100).toFixed(1)}%`}
					</h5>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.player-box {
		display: flex;
		padding-top: 2em;
		margin-top: 1em;
		align-items: center;
		justify-content: center;
		width: 100%;
		flex-direction: column;
		gap: 0.3em;
		overflow: hidden;
	}

	.win-loss {
		grid-template-columns: repeat(3, 1fr);
		width: 100%;
		display: flex;
		gap: 0.5em;
		align-items: center;
		justify-content: center;
		font-weight: 600;
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
		justify-content: space-between;
	}

	.grid-item {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5em;
	}
</style>
