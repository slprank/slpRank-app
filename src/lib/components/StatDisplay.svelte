<script lang="ts">
	import { fetchSlippiUser } from '$lib/util/api';
	import type { Options, Player } from '$lib/util/types';
	import { fly } from 'svelte/transition';
	import type { GameStartType, StatsType } from '@slippi/slippi-js';
	import { onDestroy, onMount } from 'svelte';
	import { each } from 'svelte/internal';
	import { setStartStats } from '$lib/util/store.svelte';

	export let textColor = '';
	export let displayOptions = {} as Options;
	export let players = [] as (Player | undefined)[];

	onMount(() => {
		document.body.scrollIntoView();
	});
</script>

{#if players[0] && players[1]}
	<div class="content">
		<div class="stat-container">
			{#if displayOptions?.statsRank}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1000 }}
						out:fly={{ x: -100, duration: 300, delay: 150 }}
					>
						{players[0]?.rankedNetplayProfile?.dailyRegionalPlacement
							? `#${players[0]?.rankedNetplayProfile.dailyRegionalPlacement}`
							: 'N/A'}
						{players[0]?.rankedNetplayProfile?.continentInitials
							? `[${players[0]?.rankedNetplayProfile.continentInitials}]`
							: ''}
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1000 }}
						out:fly={{ y: -100, duration: 300, delay: 150 }}
					>
						RANK
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1000 }}
						out:fly={{ x: 100, duration: 300, delay: 150 }}
					>
						{players[1]?.rankedNetplayProfile?.dailyRegionalPlacement
							? `#${players[1]?.rankedNetplayProfile?.dailyRegionalPlacement}`
							: 'N/A'}
						{players[1]?.rankedNetplayProfile?.continentInitials
							? `[${players[1]?.rankedNetplayProfile?.continentInitials}]`
							: ''}
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsNeutralWins}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 950 }}
						out:fly={{ x: -100, duration: 300, delay: 200 }}
					>
						{((players[0]?.stats?.overall?.neutralWinRatio?.ratio ?? 0) * 100).toFixed(1)}%
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 950 }}
						out:fly={{ y: -100, duration: 300, delay: 200 }}
					>
						NEUTRAL WINS
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 950 }}
						out:fly={{ x: 100, duration: 300, delay: 200 }}
					>
						{((players[1]?.stats?.overall?.neutralWinRatio?.ratio ?? 0) * 100).toFixed(1)}%
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsOpeningsKill}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1000 }}
						out:fly={{ x: -100, duration: 300, delay: 150 }}
					>
						{(players[0]?.stats?.overall?.openingsPerKill?.ratio ?? 0).toFixed(1)}
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1000 }}
						out:fly={{ y: -100, duration: 300, delay: 150 }}
					>
						OPENINGS / KILL
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1000 }}
						out:fly={{ x: 100, duration: 300, delay: 150 }}
					>
						{(players[1]?.stats?.overall?.openingsPerKill?.ratio ?? 0).toFixed(1)}
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsDamageOpening}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1050 }}
						out:fly={{ x: -100, duration: 300, delay: 100 }}
					>
						{(players[0]?.stats?.overall?.damagePerOpening?.ratio ?? 0).toFixed(1)}
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1050 }}
						out:fly={{ y: -100, duration: 300, delay: 100 }}
					>
						DAMAGE/OPENING
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1050 }}
						out:fly={{ x: 100, duration: 300, delay: 100 }}
					>
						{(players[1]?.stats?.overall?.damagePerOpening?.ratio ?? 0).toFixed(1)}
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions.statsInputsMin}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1100 }}
						out:fly={{ x: -100, duration: 300, delay: 50 }}
					>
						{(players[0]?.stats?.overall?.inputsPerMinute?.ratio ?? 0).toFixed(1)}
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1100 }}
						out:fly={{ y: -100, duration: 300, delay: 50 }}
					>
						INPUTS / MIN
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1100 }}
						out:fly={{ x: 100, duration: 300, delay: 50 }}
					>
						{(players[1]?.stats?.overall?.inputsPerMinute?.ratio ?? 0).toFixed(1)}
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsDigitalInputsMin}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1100 }}
						out:fly={{ x: -100, duration: 300, delay: 50 }}
					>
						{(players[0]?.stats?.overall?.digitalInputsPerMinute?.ratio ?? 0).toFixed(1)}
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1100 }}
						out:fly={{ y: -100, duration: 300, delay: 50 }}
					>
						DIGITAL INPUTS / MIN
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1100 }}
						out:fly={{ x: 100, duration: 300, delay: 50 }}
					>
						{(players[1]?.stats?.overall?.digitalInputsPerMinute?.ratio ?? 0).toFixed(1)}
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsTotalDamage}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1150 }}
						out:fly={{ x: -100, duration: 300 }}
					>
						{(players[0]?.stats?.overall?.totalDamage ?? 0).toFixed(1)}%
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1150 }}
						out:fly={{ y: -100, duration: 300 }}
					>
						TOTAL DAMAGE
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1150 }}
						out:fly={{ x: 100, duration: 300 }}
					>
						{(players[1]?.stats?.overall?.totalDamage ?? 0).toFixed(1)}%
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsSpotDodges}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1150 }}
						out:fly={{ x: -100, duration: 300 }}
					>
						{players[0]?.stats?.actionCounts?.spotDodgeCount ?? 0}
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1150 }}
						out:fly={{ y: -100, duration: 300 }}
					>
						SPOT DODGE COUNT
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1150 }}
						out:fly={{ x: 100, duration: 300 }}
					>
						{players[1]?.stats?.actionCounts?.spotDodgeCount ?? 0}
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsSpotDodges}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1150 }}
						out:fly={{ x: -100, duration: 300 }}
					>
						{players[0]?.stats?.actionCounts.rollCount ?? 0}
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1150 }}
						out:fly={{ y: -100, duration: 300 }}
					>
						ROLL COUNT
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1150 }}
						out:fly={{ x: 100, duration: 300 }}
					>
						{players[1]?.stats?.actionCounts?.rollCount ?? 0}
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsLCancel}
				<div class="stat">
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: -100, duration: 300, delay: 1150 }}
						out:fly={{ x: -100, duration: 300 }}
					>
						{(
							((players[0]?.stats?.actionCounts?.lCancelCount?.success ?? 0) /
								((players[0]?.stats?.actionCounts?.lCancelCount?.success ?? 0) +
									(players[0]?.stats?.actionCounts?.lCancelCount?.fail ?? 0))) *
							100
						).toFixed(1)}%
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ y: -100, duration: 300, delay: 1150 }}
						out:fly={{ y: -100, duration: 300 }}
					>
						L-CANCEL
					</h4>
					<h4
						style={`color: ${textColor}`}
						in:fly={{ x: 100, duration: 300, delay: 1150 }}
						out:fly={{ x: 100, duration: 300 }}
					>
						{(
							((players[1]?.stats?.actionCounts?.lCancelCount?.success ?? 0) /
								((players[1]?.stats?.actionCounts?.lCancelCount?.success ?? 0) +
									(players[1]?.stats?.actionCounts?.lCancelCount?.fail ?? 0))) *
							100
						).toFixed(1)}%
					</h4>
				</div>
				<hr />
			{/if}
			{#if displayOptions?.statsStocks}
				<div class="stat">
					<div class="stocks left">
						{#each [...Array(4).keys()] as _, i}
							<img
								style={`height: 28px; width: 28px; filter: brightness(${
									(players[0].stats?.stocks[3 - i]?.deathAnimation ?? null) === null ? '100' : '50'
								}%)`}
								src={`./characters/${$setStartStats?.characters[0]?.characterId}/${$setStartStats?.characters[0]?.characterColorId}/stock.png`}
								alt="character icon"
								in:fly={{ x: -100, duration: 300, delay: 1100 + i * 175 }}
								out:fly={{ x: -100, duration: 300 }}
							/>
						{/each}
					</div>
					<img
						class="stocks"
						style={`height: 64px; width: 96px; object-fit: cover; border-radius: 0.7em`}
						src={`./stages/${$setStartStats?.stageId}.png`}
						alt="character icon"
						in:fly={{ x: 100, duration: 300, delay: 1100 }}
						out:fly={{ x: 100, duration: 300 }}
					/>
					<div class="stocks right">
						{#each [...Array(4).keys()] as _, i}
							<img
								style={`height: 28px; width: 28px; filter: brightness(${
									(players[1].stats?.stocks[3 - i]?.deathAnimation ?? null) == null ? '100' : '50'
								}%)`}
								src={`./characters/${$setStartStats?.characters[1]?.characterId}/${$setStartStats?.characters[1]?.characterColorId}/stock.png`}
								alt="character icon"
								in:fly={{ x: 100, duration: 300, delay: 1100 + i * 175 }}
								out:fly={{ x: 100, duration: 300 }}
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.stat-container {
		padding-left: 1.5em;
		padding-right: 1.5em;
		padding-top: 2em;
		display: flex;
		height: 100%;
		width: inherit;
		flex-direction: column;
		gap: 0.7em;
	}

	.stat {
		display: flex;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(1);
		gap: 1em;
		align-content: center;
		justify-content: space-between;
	}

	.stocks {
		display: flex;
		grid-template-rows: repeat(1);
		grid-gap: 1em;
		justify-content: center;
		align-items: center;
		margin-top: 2em;
	}

	.left {
		display: flex;
		align-content: flex-start;
	}
	.left {
		display: flex;
		align-content: flex-end;
	}

	hr {
		width: 100%;
		margin: 0;
		margin-bottom: 0.2em;
	}

	*::-webkit-scrollbar {
		display: none;
	}
</style>
