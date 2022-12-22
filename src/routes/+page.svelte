<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';
	import StatDisplay from '$lib/components/StatDisplay.svelte';
	import type { GameStartType, MetadataType, PlacementType, StatsType } from '@slippi/slippi-js';

	let tempPath: string = localStorage.getItem('slippi-path') ?? '';
	let tempBackgroundColor: string = localStorage.getItem('background-color') ?? '';
	let tempTextColor: string = localStorage.getItem('text-color') ?? '';

	$: slippiStats = false;

	$: backgroundColor = '';
	$: textColor = '';

	$: playerId1 = '';
	$: playerId2 = '';
	$: start = false;
	//$: stats = {} as StatsType;
	//$: settings = {} as GameStartType;
	$: gameOver = true;

	$: dolphinConnected = false;

	const storeData = () => {
		backgroundColor = tempBackgroundColor;
		textColor = tempTextColor;
		localStorage.setItem('slippi-path', tempPath);
		localStorage.setItem('background-color', tempBackgroundColor);
		localStorage.setItem('text-color', tempTextColor);
		window.electron.getStats(tempPath);
		start = true;
	};

	if (window.electron && browser) {
		window.electron.receive('player1-id', async (id: string) => {
			playerId1 = id;
			gameOver = false;
			console.log('id1:', playerId1);
		});
		window.electron.receive('player2-id', async (id: string) => {
			playerId2 = id;
			gameOver = false;
			console.log('id2:', playerId2);
		});
		window.electron.receive('settings', async (newSettings: GameStartType) => {
			//settings = newSettings;
		});
		window.electron.receive('stats', async (newStats: StatsType) => {
			//stats = newStats;
			//console.log(stats);
		});
		window.electron.receive('game-end', async (data: any) => {
			gameOver = true;
			console.log(data);
		});
		window.electron.receive('disconnected-event', async (data: boolean) => {
			dolphinConnected = data;
		});
		window.electron.receive('connected-event', async (data: boolean) => {
			dolphinConnected = data;
		});
	}
	function SelectDirectory() {
		window.electron.selectFolder().then((result: any) => {
			tempPath = result;
			window.electron.getStats(result);
		});
	}
</script>

<main style={`background: ${tempBackgroundColor}`}>
	{#if !start && !dolphinConnected}
		<div class="content" transition:fly={{ y: 200, duration: 300 }}>
			<div class="options-container">
				<h1 style={`margin-top: 2em; color: ${tempTextColor}`}>Slippi game directory</h1>
				<button on:click={SelectDirectory} type="button" class="btn btn-primary"
					>Select Directory</button
				>
				<p style={`color: ${tempTextColor}`}>{tempPath ?? 'No directory selected'}</p>
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
				<!--
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
				-->
			</div>
			<button type="button" class="btn btn-success" on:click={storeData}>Start</button>
		</div>
		<!--
	{:else if gameOver && slippiStats}
		<div>
			<StatDisplay bind:playerId1 bind:playerId2 bind:stats bind:settings bind:textColor />
		</div>
	-->
	{:else}
		<div transition:fly={{ y: 200, duration: 300 }}>
			<Display bind:playerId1 bind:playerId2 bind:textColor />
		</div>
	{/if}
</main>

<style>
	main {
		padding: 1em;
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
