<script lang="ts">
	import type { Options, Player } from '$lib/util/types';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	onMount(() => {
		document.body.scrollIntoView();
	});

	export let textColor = '';
	export let winColor = '';
	export let loseColor = '';
	export let displayOptions = {} as Options;
	export let players: (Player | undefined)[];
</script>

{#if players[0] && players[1]}
	<div class="columns" style={`color: ${textColor}`}>
		<div class="column right rows">
			<div class="rating-columns">
				<img
					in:fly={{ x: -100, duration: 500, delay: 1800 }}
					out:fly={{ x: -100, duration: 300 }}
					src={`./rank-icons/${players[0]?.rankedNetplayProfile.rank}.svg`}
					style="width: 42px; height: 42px;"
					alt="rank"
					class="column right"
				/>
				<h4
					style={`color: ${textColor}`}
					in:fly={{ x: -100, duration: 300, delay: 950 }}
					out:fly={{ x: -100, duration: 300, delay: 550 }}
				>
					{players[0]?.rankedNetplayProfile.ratingOrdinal.toFixed(1)}
				</h4>
			</div>
			<h4
				style={`color: ${textColor}`}
				in:fly={{ x: -100, duration: 300, delay: 1000 }}
				out:fly={{ x: -100, duration: 300, delay: 500 }}
			>
				{players[0]?.rankedNetplayProfile.dailyRegionalPlacement
					? `#${players[0]?.rankedNetplayProfile.dailyRegionalPlacement}`
					: `${
							players[0]?.rankedNetplayProfile.dailyGlobalPlacement
								? `#${players[0]?.rankedNetplayProfile.dailyGlobalPlacement}`
								: ''
					  }`}
				{players[0]?.rankedNetplayProfile?.continentInitials
					? `[${
							players[0]?.rankedNetplayProfile.dailyRegionalPlacement
								? players[0]?.rankedNetplayProfile.continentInitials
								: `${
										players[0]?.rankedNetplayProfile.dailyGlobalPlacement
											? 'GL'
											: players[0]?.rankedNetplayProfile.continentInitials
								  }`
					  }]`
					: ''}
			</h4>
			<div class="win-loss right">
				<h4
					style={`color: ${winColor}`}
					in:fly={{ x: -100, duration: 300, delay: 1050 }}
					out:fly={{ x: -100, duration: 300, delay: 350 }}
				>
					{players[0]?.rankedNetplayProfile.wins ?? 0}
				</h4>
				<h4
					in:fly={{ x: -100, duration: 300, delay: 1100 }}
					out:fly={{ x: -100, duration: 300, delay: 400 }}
				>
					/
				</h4>
				<h4
					style={`color: ${loseColor}`}
					in:fly={{ x: -100, duration: 300, delay: 1150 }}
					out:fly={{ x: -100, duration: 300, delay: 450 }}
				>
					{players[0]?.rankedNetplayProfile.losses ?? 0}
				</h4>
			</div>
			{#if displayOptions.currentGameCharacters}
				<div
					class={`col-${players[0]?.rankedNetplayProfile?.characters.length}-container right`}
					style="display: flex"
					in:fly={{ x: -100, duration: 300, delay: 1200 }}
				>
					{#each players[0]?.rankedNetplayProfile?.characters
						.slice()
						.reverse() ?? [] as character, i}
						<div
							class="character-icon-box"
							in:fly={{ x: -100, duration: 300, delay: 1200 + 50 * i }}
							out:fly={{ x: -100, duration: 300, delay: 300 - 50 * i }}
						>
							<img
								style="width: 24px; height: 24px;"
								src={`./character-icons/${character.icon}`}
								alt={character.character}
							/>
							<h5 style={`color: ${textColor}; font-size: 1em`}>
								{`${((character.gameCount / players[0]?.totalGames) * 100).toFixed(1)}%`}
							</h5>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="column center rows">
			<h4
				style={`color: ${textColor}`}
				in:fly={{ y: -100, duration: 300, delay: 950 }}
				out:fly={{ y: -100, duration: 300, delay: 450 }}
			>
				RATING
			</h4>
			<h4
				style={`color: ${textColor}`}
				in:fly={{ y: -100, duration: 300, delay: 1000 }}
				out:fly={{ y: -100, duration: 300, delay: 400 }}
			>
				RANK
			</h4>
			<h4
				style={`color: ${textColor}`}
				in:fly={{ y: -100, duration: 300, delay: 1050 }}
				out:fly={{ y: -100, duration: 300, delay: 350 }}
			>
				W / L
			</h4>
			{#if displayOptions.currentGameCharacters}
				<div
					style={`color: ${textColor}`}
					in:fly={{ y: -100, duration: 300, delay: 1050 }}
					out:fly={{ y: -100, duration: 300, delay: 350 }}
				/>
			{/if}
		</div>
		<div class="column left rows">
			<div class="rating-columns">
				<h4
					style={`color: ${textColor}`}
					in:fly={{ x: 100, duration: 300, delay: 950 }}
					out:fly={{ x: 100, duration: 300, delay: 550 }}
				>
					{players[1]?.rankedNetplayProfile.ratingOrdinal.toFixed(1)}
				</h4>
				<img
					in:fly={{ x: 100, duration: 500, delay: 1800 }}
					out:fly={{ x: 100, duration: 300 }}
					src={`./rank-icons/${players[1]?.rankedNetplayProfile.rank}.svg`}
					style="width: 42px; height: 42px;"
					alt="rank"
					class="column left"
				/>
			</div>
			<h4
				style={`color: ${textColor}`}
				in:fly={{ x: 100, duration: 300, delay: 1000 }}
				out:fly={{ x: 100, duration: 300, delay: 500 }}
			>
				{players[1]?.rankedNetplayProfile.dailyRegionalPlacement
					? `#${players[1]?.rankedNetplayProfile.dailyRegionalPlacement}`
					: `${
							players[1]?.rankedNetplayProfile.dailyGlobalPlacement
								? `#${players[1]?.rankedNetplayProfile.dailyGlobalPlacement}`
								: ''
					  }`}
				{players[1]?.rankedNetplayProfile?.continentInitials
					? `[${
							players[1]?.rankedNetplayProfile.dailyRegionalPlacement
								? players[1]?.rankedNetplayProfile.continentInitials
								: `${
										players[1]?.rankedNetplayProfile.dailyGlobalPlacement
											? 'GL'
											: players[1]?.rankedNetplayProfile.continentInitials
								  }`
					  }]`
					: ''}
			</h4>
			<div class="win-loss left">
				<h4
					style={`color: ${winColor}`}
					in:fly={{ x: 100, duration: 300, delay: 1050 }}
					out:fly={{ x: 100, duration: 300, delay: 450 }}
				>
					{players[1]?.rankedNetplayProfile.wins ?? 0}
				</h4>
				<h4
					in:fly={{ x: 100, duration: 300, delay: 1100 }}
					out:fly={{ x: 100, duration: 300, delay: 400 }}
				>
					/
				</h4>
				<h4
					style={`color: ${loseColor}`}
					in:fly={{ x: 100, duration: 300, delay: 1150 }}
					out:fly={{ x: 100, duration: 300, delay: 350 }}
				>
					{players[1]?.rankedNetplayProfile.losses ?? 0}
				</h4>
			</div>
			{#if displayOptions.currentGameCharacters}
				<div
					class={`col-${players[1]?.rankedNetplayProfile?.characters.length}-container left`}
					style="display: flex"
					in:fly={{ x: 100, duration: 300, delay: 1200 }}
					out:fly={{ x: 100, duration: 300, delay: 300 }}
				>
					{#each players[1]?.rankedNetplayProfile?.characters ?? [] as character, i}
						<div
							class="character-icon-box"
							in:fly={{ x: 100, duration: 300, delay: 1200 + 50 * i }}
							out:fly={{ x: 100, duration: 300, delay: 300 - 50 * i }}
						>
							<img
								style="width: 24px; height: 24px;"
								src={`./character-icons/${character.icon}`}
								alt={character.character}
							/>
							<h5 style={`color: ${textColor}; font-size: 0.9em`}>
								{`${((character.gameCount / players[1]?.totalGames) * 100).toFixed(1)}%`}
							</h5>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.columns {
		top: 0;
		padding-left: 1em;
		padding-right: 1em;
		grid-template-columns: 5em 5em 5em;
		padding-top: 4em;
		height: 100vh;
		padding-bottom: 4em;
		width: 100vw;
		display: flex;
		gap: 1em;
	}

	.rating-columns {
		grid-template-columns: repeat(2, 1fr);
		width: inherit;
		min-width: 7em;
		display: flex;
		gap: 2em;
		justify-content: space-between;
		align-items: center;
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

	.rows {
		grid-template-rows: repeat(4, 2em);
		display: grid;
		gap: 1em;
		justify-content: center;
		align-items: center;
	}

	.column {
		flex: 1;
	}

	.left {
		justify-content: left;
		align-items: left;
		text-align: left;
	}

	.center {
		text-align: center;
		min-width: 5em;
	}

	.right {
		justify-content: right;
		align-items: right;
		text-align: right;
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
		align-items: center;
	}

	.content::-webkit-scrollbar {
		display: none;
	}
</style>
