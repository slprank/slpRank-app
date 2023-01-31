<script lang="ts">
	import { currentStats, setStartStats } from '$lib/util/store.svelte';
	import type { PlayerSessionStats } from '$lib/util/types';
	import { fly } from 'svelte/transition';

	export let updatingStats = true;
	export let textColor = '';
	export let winColor = '';
	export let loseColor = '';
	export let obsEndScene = '';
	export let setWon: HTMLAudioElement;
	export let setLost: HTMLAudioElement;
	export let setEnd: HTMLAudioElement;

	$: statDifference = {
		rating: 0,
		regionalPlacement: 0,
		globalPlacement: 0,
		wins: 0,
		losses: 0
	} as PlayerSessionStats;

	function PlayAnnouncer(sound: string) {
		if (sound == 'setWon') setWon.play();
		if (sound == 'setLost') setLost.play();
		if (sound == 'setEnd') setEnd.play();
	}

	PlayAnnouncer('setEnd');
	setTimeout(() => {
		statDifference = {
			...statDifference,
			rating: $currentStats.rating - $setStartStats.rating,
			regionalPlacement: $currentStats.regionalPlacement - $setStartStats.regionalPlacement,
			globalPlacement: $currentStats.globalPlacement - $setStartStats.globalPlacement,
			wins: $currentStats.wins - $setStartStats.wins,
			losses: $currentStats.losses - $setStartStats.losses
		};
		PlayAnnouncer(statDifference.rating >= 0 ? 'setWon' : 'setLost');
	}, 2500);
	setTimeout(() => {
		console.log($setStartStats, $currentStats);
		$setStartStats = {
			...$currentStats,
			scores: $setStartStats?.scores,
			players: $setStartStats?.players,
			currentPlayerIndex: $setStartStats?.currentPlayerIndex
		};
		console.log($setStartStats, $currentStats);
	}, 4000);
	setTimeout(() => {
		updatingStats = false;
		window.electron.switchScene(obsEndScene);
	}, 8000);
</script>

<div class="content">
	<div class="player-box">
		<h3 style={`color: ${textColor}`} in:fly={{ y: -100, duration: 350 }}>
			{$setStartStats?.displayName}
		</h3>
		{#key $setStartStats.rank}
			<img
				in:fly={{ y: -10, duration: 350 }}
				style="width: 56px; height: 56px;"
				src={`./rank-icons/${$setStartStats.rank}.svg`}
				alt={'rank'}
			/>

			<h3 style={`color: ${textColor}`} in:fly={{ y: -10, duration: 350 }}>
				{$setStartStats.rank}
			</h3>
		{/key}
		<div class="col-3-container">
			<div />
			{#key $setStartStats.rating}
				<h3 class="grid-item" style={`color: ${textColor}`} in:fly={{ y: -10, duration: 350 }}>
					{$setStartStats?.rating.toFixed(1)}
				</h3>
			{/key}
			{#if statDifference.rating}
				<h3
					in:fly={{ x: 20, duration: 350 }}
					class="grid-item"
					style={`left: 0; color: ${statDifference.rating >= 0 ? winColor : loseColor};`}
				>
					{statDifference.rating >= 0 ? '+' : ''}{statDifference.rating.toFixed(1)}
				</h3>
			{/if}
		</div>
	</div>
</div>

<style>
	.player-box {
		display: flex;
		align-items: center;
		padding-top: 2em;
		justify-content: center;
		min-width: 100%;
		flex-direction: column;
		gap: 0.5em;
		overflow: hidden;
	}

	.col-2-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
		justify-content: space-around;
	}

	.col-3-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
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

	*::-webkit-scrollbar {
		display: none;
	}
</style>
