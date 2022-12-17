<script lang="ts">
	import {
		currentPlayerConnectCode,
		currentStats,
		sessionStartStats,
		setStartStats
	} from '$lib/util/store.svelte';
	import { fly } from 'svelte/transition';

	export let textColor = '';
	export let winColor = '';
	export let loseColor = '';
	export let sessionTitle = '';

	$: currentWins = isNaN($currentStats?.wins - $sessionStartStats?.wins)
		? 0
		: $currentStats?.wins - $sessionStartStats?.wins;
	$: currentLosses = isNaN($currentStats?.losses - $sessionStartStats?.losses)
		? 0
		: $currentStats?.losses - $sessionStartStats?.losses;
	$: currentRating = isNaN($currentStats?.rating - $sessionStartStats?.rating)
		? 0
		: $currentStats?.rating - $sessionStartStats?.rating;
</script>

<div class="content-foot">
	{#if $currentStats.rating}
		<h4
			class="today"
			style={`color: ${textColor}`}
			in:fly={{ y: 100, duration: 300, delay: 10000 }}
			out:fly={{ y: 100, duration: 300, delay: 700 }}
		>
			{sessionTitle}
		</h4>
	{/if}
	{#key $currentStats.rating}
		<div
			class="stats"
			in:fly={{ y: 100, duration: 300, delay: 10000 }}
			out:fly={{ y: 100, duration: 300, delay: 650 }}
		>
			<div class="win-loss">
				<h4 style={`color: ${textColor}`}>W:</h4>
				<h4 style={`color: ${winColor}`}>
					{currentWins}
				</h4>
			</div>
			<div class="rating">
				<h4 style={`color: ${textColor}`}>
					{$currentStats?.rating.toFixed(1) ?? ''}
				</h4>
				<h4 style={`color: ${currentRating >= 0 ? winColor : loseColor}`}>
					({currentRating >= 0 ? '+' : ''}{currentRating.toFixed(1) ?? 0})
				</h4>
			</div>
			<div class="win-loss">
				<h4 style={`color: ${textColor}`}>L:</h4>
				<h4 style={`color: ${loseColor}`}>
					{currentLosses}
				</h4>
			</div>
		</div>
	{/key}
</div>

<style>
	.content-foot {
		position: fixed;
		bottom: 0.5em;
		min-width: 480px;
		height: 4em;
		display: grid;
		grid-template-rows: 1em 3em;
		grid-template-rows: repeat(1);
	}
	.stats {
		position: fixed;
		padding: 1em;
		bottom: 0.5em;
		min-width: 480px;
		max-width: 560px;
		height: 3em;
		display: grid;
		grid-template-columns: 5em 1fr 5em;
		grid-template-rows: repeat(1);
		grid-gap: 1em;
		justify-content: space-between;
	}

	.rating {
		grid-template-columns: repeat(2, 1fr);
		width: 100%;
		display: flex;
		gap: 2em;
		align-items: center;
		justify-content: center;
	}

	.win-loss {
		grid-template-columns: repeat(2, 1fr);
		width: 100%;
		display: flex;
		gap: 0.5em;
		align-items: center;
		justify-content: center;
	}

	.today {
		display: flex;
		justify-content: center;
		justify-items: center;
		margin: 0;
	}
</style>
