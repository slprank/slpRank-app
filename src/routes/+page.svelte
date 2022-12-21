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

	$: backgroundColor = '';

	/*
	$: textColor = '';

	$: updateTextColor(backgroundColor);

	function updateTextColor(backgroundColor: string) {
		const color = backgroundColor.slice(1, 7);
		var r = parseInt(color.substring(0, 2), 16) / 255;
		var g = parseInt(color.substring(2, 4), 16) / 255;
		var b = parseInt(color.substring(4, 6), 16) / 255;
		var hue = 0;
		if (r >= g && g >= b) {
			hue = (60 * (g - b)) / (r - b);
		} else if (g > r && r >= b) {
			hue = 60 * (2 - (r - b) / (g - b));
		}
		if (hue <= 7) {
			textColor = 'white';
		} else {
			textColor = 'black';
		}
	}
	*/

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

	function SelectDirectory() {
		window.electron.selectFolder().then((result: any) => {
			tempPath = result;
		});
	}

	// Add slippi stats

	// Smooth out transitions
</script>

<main style={`background: ${backgroundColor}`}>
	{#if !playerId1 || !playerId2}
		<div class="content" transition:fly={{ y: 200, duration: 300 }}>
			<h1 style="margin-top: 2em">Slippi game directory</h1>
			<div class="options-container">
				<button on:click={SelectDirectory} type="button" class="btn btn-primary"
					>Select Directory</button
				>
				<p>{tempPath}</p>
				<div class="option">
					<h5 style="margin-top: auto; margin-bottom: auto;">Background color:</h5>
					<input
						bind:value={backgroundColor}
						type="color"
						class="form-control form-control-color"
						id="exampleColorInput"
					/>
				</div>
				<!--
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Text color:</h5>
					<input
						bind:value={textColor}
						type="color"
						class="form-control form-control-color"
						id="exampleColorInput"
					/>
				</div>
				-->
			</div>
			<button type="button" class="btn btn-success" on:click={setPath}>Start</button>
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
		height: 95vh;
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

	.options-container {
		display: flex;
		height: 100%;
		width: 95%;
		flex-direction: column;
		padding: 1em;
		gap: 1em;
	}

	.option {
		display: flex;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
		align-content: space-around;
		justify-content: space-between;
	}
</style>
