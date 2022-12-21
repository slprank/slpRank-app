<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';
	import StatDisplay from '$lib/components/StatDisplay.svelte';
	import type { GameStartType, MetadataType, PlacementType, StatsType } from '@slippi/slippi-js';

	// /Users/sindrevatnaland/Slippi

	let clear: NodeJS.Timeout;

	const ms = 1000;

	$: {
		clearInterval(clear);
		clear = setInterval(() => path && getData(path), ms);
	}

	let tempPath: string = localStorage.getItem('slippi-path') ?? '';
	let tempBackgroundColor: string = localStorage.getItem('background-color') ?? '';
	let tempTextColor: string = localStorage.getItem('text-color') ?? '';

	$: path = '';
	$: slippiStats = false;

	$: backgroundColor = '';
	$: textColor = '';

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

	$: playerId1 = '';
	$: playerId2 = '';
	$: stats = {} as StatsType;

	$: isGameOver = false;

	const setPath = () => {
		path = tempPath;
		slippiStats = tempSlippiStats;
		localStorage.setItem('slippi-path', tempPath);
		localStorage.setItem('slippi-stats', tempSlippiStats.toString());
		localStorage.setItem('background-color', tempBackgroundColor);
		localStorage.setItem('text-color', tempTextColor);
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
	}

	function SelectDirectory() {
		window.electron.selectFolder().then((result: any) => {
			tempPath = result;
		});
	}

	// Add slippi stats

	// Smooth out transitions
</script>

<main style={`background: ${tempBackgroundColor}`}>
	{#if !playerId1 || !playerId2}
		<div class="content" transition:fly={{ y: 200, duration: 300 }}>
			<h1 style={`margin-top: 2em; color: ${tempTextColor}`}>Slippi game directory</h1>
			<button on:click={SelectDirectory} type="button" class="btn btn-primary"
				>Select Directory</button
			>
			<p style={`color: ${tempTextColor}`}>{tempPath ?? 'No directory selected'}</p>
			<div class="options-container">
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Background color:
					</h5>
					<input
						bind:value={tempBackgroundColor}
						type="color"
						class="form-control form-control-color"
						id="exampleColorInput"
					/>
				</div>
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Text color:
					</h5>
					<input
						bind:value={tempTextColor}
						type="color"
						class="form-control form-control-color"
						id="exampleColorInput"
					/>
				</div>

				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Post game stats:
					</h5>
					<input
						bind:value={slippiStats}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
			</div>
			<button type="button" class="btn btn-success" on:click={setPath}>Start</button>
		</div>
	{/if}
	<!-- If game has no ending -->
	{#if isGameOver && slippiStats}
		<div>
			<StatDisplay bind:playerId1 bind:playerId2 bind:stats bind:textColor />
		</div>
	{:else}
		<div>
			<Display bind:playerId1 bind:playerId2 bind:textColor />
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
		overflow: hidden;
	}

	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		width: 420px;
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
