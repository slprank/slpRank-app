<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';
	import StatDisplay from '$lib/components/StatDisplay.svelte';
	import type { GameStartType, MetadataType, StatsType } from '@slippi/slippi-js';

	let clear: NodeJS.Timeout;

	const ms = 1000;

	let tempPath: string = localStorage.getItem('slippi-path') ?? '';

	// Make "Submit" button required
	// /Users/sindrevatnaland/Slippi/Game_20221014T153837.slp

	let path: string;

	$: {
		clearInterval(clear);
		clear = setInterval(() => path && getData(path), ms);
	}

	const setPath = () => {
		path = tempPath;
		localStorage.setItem('slippi-path', tempPath);
		tempPath = '';
	};

	const getData = async (path: string) => {
		window.electron.getPlayers(path);
	};

	$: playerId1 = '';
	$: playerId2 = '';

	if (window.electron && browser) {
		window.electron.receive('get-settings', async (data: GameStartType) => {
			console.log('settings', data);
			playerId1 = data?.players[0].names?.code ?? '';
			playerId2 = data?.players[1].names?.code ?? '';
		});
		window.electron.receive('get-metadata', async (data: MetadataType) => {
			console.log('metadata', data);
			playerId1 = data?.players[0].names?.code ?? '';
			playerId2 = data?.players[1].names?.code ?? '';
		});
		window.electron.receive('get-stats', async (data: StatsType) => {
			console.log('stats', data);
			playerId1 = data?.players[0].names?.code ?? '';
			playerId2 = data?.players[1].names?.code ?? '';
		});

		window.electron.receive('clear-data', async (err: any) => {
			console.log(err);
			path = '';
			playerId1 = '';
			playerId2 = '';
			localStorage.removeItem('slippi-path');
		});
	}
</script>

<main>
	{#if !playerId1 || !playerId2}
		<div class="content">
			<h1 transition:fly={{ y: 200, duration: 300 }}>input for slippi directory</h1>
			<input bind:value={tempPath} />
			<button on:click={setPath}>Submit</button>
		</div>
	{/if}
	<!-- In game display -->
	<Display bind:playerId1 bind:playerId2 />

	<!-- Stats display -->
	<StatDisplay />
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
