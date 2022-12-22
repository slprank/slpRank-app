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

	const storeData = () => {
		backgroundColor = tempBackgroundColor;
		textColor = tempTextColor;
		localStorage.setItem('background-color', tempBackgroundColor);
		localStorage.setItem('text-color', tempTextColor);
		start = true;
	};

	if (window.electron && browser) {
		window.electron.receive('player1-id', async (id: string) => {
			playerId1 = id;
			console.log('id1:', playerId1);
		});
		window.electron.receive('player2-id', async (id: string) => {
			playerId2 = id;
			console.log('id2:', playerId2);
		});
		window.electron.receive('game-end', async (data: any) => {
			console.log(data);
		});
	}
</script>

<main style={`background: ${tempBackgroundColor}`}>
	{#if !start}
		<div class="content" transition:fly={{ y: 200, duration: 300 }}>
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
			<button type="button" class="btn btn-success" on:click={storeData}>Start</button>
		</div>
	{/if}
	<!-- If game has no ending -->
	{#if start}
		<div>
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
