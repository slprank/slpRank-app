<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';
	import StatDisplay from '$lib/components/StatDisplay.svelte';
	import type { GameStartType, MetadataType, PlacementType, StatsType } from '@slippi/slippi-js';

	// /Users/sindrevatnaland/Slippi

	let clear: NodeJS.Timeout;

	const ms = 1000;

	let tempPath: string = localStorage.getItem('slippi-path') ?? '';

	let path: string = '';

	$: {
		clearInterval(clear);
		clear = setInterval(() => path && getData(path), ms);
	}

	$: playerId1 = '';
	$: playerId2 = '';
	$: stats = {} as StatsType;

	$: isGameOver = false;

	const setPath = () => {
		path = tempPath;
		localStorage.setItem('slippi-path', tempPath);
	};

	const getData = async (dir: string) => {
		window.electron.getPlayers(dir);
	};

	if (window.electron && browser) {
		window.electron.receive('get-settings', async (settings: GameStartType) => {
			console.log('settings', settings);
		});
		window.electron.receive('get-metadata', async (metadata: MetadataType) => {
			console.log('metadata', metadata);
			playerId1 = metadata?.players[0].names?.code ?? '';
			playerId2 = metadata?.players[1].names?.code ?? '';
		});
		window.electron.receive('get-placements', async (placements: PlacementType[]) => {
			console.log('game end', placements);
			isGameOver = !!placements.length;
		});
		window.electron.receive('get-stats', async (gameStats: StatsType) => {
			console.log('stats', gameStats);
			stats = gameStats;
		});

		window.electron.receive('clear-data', async (err: any) => {
			console.log(err);
			path = '';
			playerId1 = '';
			playerId2 = '';
		});
	}

	// Fix input for slippi directory

	// Option to change background color

	// Add slippi stats

	// Smooth out transitions
</script>

<main>
	{#if !playerId1 || !playerId2}
		<div class="content">
			<h1 transition:fly={{ y: 200, duration: 300 }}>input for slippi directory</h1>
			<input bind:value={tempPath} />
			<button on:click={setPath}>Submit</button>
		</div>
	{/if}
	<!-- If game has no ending -->
	{#if isGameOver}
		<div>
			<StatDisplay bind:playerId1 bind:playerId2 bind:stats />
		</div>
	{:else}
		<div>
			<Display bind:playerId1 bind:playerId2 />
		</div>
	{/if}
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		flex-direction: column;
		gap: 1em;
	}

	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		flex-direction: column;
		gap: 1em;
	}
</style>
