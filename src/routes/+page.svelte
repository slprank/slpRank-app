<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';
	import StatDisplay from '$lib/components/StatDisplay.svelte';
	import type { GameStartType, MetadataType, PlacementType, StatsType } from '@slippi/slippi-js';
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('here');
		window.electron.getDolphinStatus();
	});

	let tempPath: string = localStorage.getItem('slippi-path') ?? '';
	let tempBackgroundColor: string = localStorage.getItem('background-color') ?? '#333333';
	let tempTextColor: string = localStorage.getItem('text-color') ?? '#ffffff';

	let slippiStats = localStorage.getItem('slippi-stats') == 'true';

	$: backgroundColor = '';
	$: textColor = '';

	$: playerId1 = '';
	$: playerId2 = '';
	$: start = false;
	$: stats = {} as StatsType;
	$: settings = {} as GameStartType;
	$: gameOver = true;

	$: displayOptions = {
		playerTag: Boolean(localStorage.getItem('playerTag') == 'true'),
		playerCode: Boolean(localStorage.getItem('playerCode') == 'true'),
		rankIcon: Boolean(localStorage.getItem('rankIcon') == 'true'),
		rankText: Boolean(localStorage.getItem('rankText') == 'true'),
		playerRating: Boolean(localStorage.getItem('playerRating') == 'true'),
		playerPlacement: Boolean(localStorage.getItem('playerPlacement') == 'true'),
		playerWinLoss: Boolean(localStorage.getItem('playerWinLoss') == 'true'),
		playerCharacters: Boolean(localStorage.getItem('playerCharacters') == 'true')
	};

	$: console.log(displayOptions);

	$: dolphinStatus = 'connected';
	$: dolphinConnected = true;

	$: hasSlippiCriteria = !slippiStats || (slippiStats && tempPath);

	const storeData = () => {
		window.electron.getDolphinStatus();
		backgroundColor = tempBackgroundColor;
		textColor = tempTextColor;
		localStorage.setItem('slippi-path', tempPath);
		localStorage.setItem('background-color', tempBackgroundColor);
		localStorage.setItem('text-color', tempTextColor);
		localStorage.setItem('slippi-stats', slippiStats.toString());

		localStorage.setItem('playerTag', displayOptions.playerTag.toString());
		localStorage.setItem('playerCode', displayOptions.playerCode.toString());
		localStorage.setItem('rankIcon', displayOptions.rankIcon.toString());
		localStorage.setItem('rankText', displayOptions.rankText.toString());
		localStorage.setItem('playerRating', displayOptions.playerRating.toString());
		localStorage.setItem('playerWinLoss', displayOptions.playerWinLoss.toString());
		localStorage.setItem('playerCharacters', displayOptions.playerCharacters.toString());

		if (tempPath == 'undefined') tempPath = '';
		if (tempPath) window.electron.getStats(tempPath ?? '');
		start = true;
	};

	if (window.electron && browser) {
		window.electron.receive('player1-id', async (id: string) => {
			playerId1 = id;
		});
		window.electron.receive('player2-id', async (id: string) => {
			playerId2 = id;
		});
		window.electron.receive('settings', async (newSettings: GameStartType) => {
			settings = newSettings;
		});
		window.electron.receive('stats', async (newStats: StatsType) => {
			stats = newStats;
			console.log(newStats);
		});
		window.electron.receive('game-start', async (data: any) => {
			gameOver = false;
		});
		window.electron.receive('game-end', async (data: any) => {
			gameOver = true;
			console.log(data);
		});
		window.electron.receive('disconnected-event', async (data: string) => {
			dolphinConnected = false;
			dolphinStatus = data;
		});
		window.electron.receive('connected-event', async (data: string) => {
			dolphinConnected = true;
			dolphinStatus = data;
		});
		window.electron.receive('connecting-event', async (data: string) => {
			dolphinConnected = false;
			dolphinStatus = data;
		});
	}
	function SelectDirectory() {
		window.electron.selectFolder().then((result: any) => {
			tempPath = result ?? '';
			if (tempPath == 'undefined') tempPath = '';
			if (tempPath) window.electron.getStats(result);
		});
	}
</script>

<main style={`background: ${tempBackgroundColor}`}>
	{#if !start || !dolphinConnected}
		<div class="content" in:fly={{ y: 200, duration: 300 }} out:fly={{ y: -200, duration: 300 }}>
			<h1 style={`color: ${tempTextColor}`}>
				Dolphin: {dolphinStatus}
			</h1>
			<h2 style={`margin-top: 2em; color: ${tempTextColor}`}>Slippi game directory</h2>
			<div class="options-container">
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
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Post game stats:
					</h5>
					<input
						bind:checked={slippiStats}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
				<hr style="width: 95vw; margin-top: 0.5em; margin-bottom: 0.5em;" />
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Player tag:
					</h5>
					<input
						bind:checked={displayOptions.playerTag}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Player code:
					</h5>
					<input
						bind:checked={displayOptions.playerCode}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Rank icon:
					</h5>
					<input
						bind:checked={displayOptions.rankIcon}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Rank (text):
					</h5>
					<input
						bind:checked={displayOptions.rankText}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Player rating:
					</h5>
					<input
						bind:checked={displayOptions.playerRating}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Player placement:
					</h5>
					<input
						bind:checked={displayOptions.playerPlacement}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Player Win/Loss::
					</h5>
					<input
						bind:checked={displayOptions.playerWinLoss}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
				<div class="option">
					<h5 style={`margin-top: auto; margin-bottom: auto; color: ${tempTextColor}`}>
						Characters:
					</h5>
					<input
						bind:checked={displayOptions.playerCharacters}
						class="form-check-input"
						type="checkbox"
						id="flexCheckDefault"
						style="height: 35px; width: 47px"
					/>
				</div>
			</div>
			<button
				type="button"
				disabled={!hasSlippiCriteria}
				class="btn btn-success"
				on:click={storeData}>Start</button
			>
			<h6>
				<a href="https://twitter.com/SniderSSBM" target="_blank" style={`color: ${tempTextColor}`}
					>@SniderSSBM</a
				>
			</h6>
		</div>
	{:else if gameOver && hasSlippiCriteria}
		<div in:fly={{ y: 200, duration: 300, delay: 300 }} out:fly={{ y: -200, duration: 300 }}>
			<StatDisplay bind:playerId1 bind:playerId2 bind:stats bind:settings bind:textColor />
		</div>
	{:else}
		<div in:fly={{ y: 200, duration: 300, delay: 300 }} out:fly={{ y: -200, duration: 300 }}>
			<Display bind:playerId1 bind:playerId2 bind:textColor bind:displayOptions />
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
		gap: 0.5em;
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
