<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';

	let clear: NodeJS.Timeout;

	const ms = 1000;

	let tempPath: string = '';
	//localStorage.removeItem('slippi-path');

	// /Users/sindrevatnaland/Slippi/Game_20221014T153837.slp

	let path = localStorage.getItem('slippi-path') ?? '';

	console.log(path);

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
		window.electron.receive('get-data', async (data: any) => {
			console.log(data);
			const players = data.split(' ');
			playerId1 = players[0];
			playerId2 = players[1];
			console.log(players[2]);
		});
		window.electron.receive('remove-data', async (data: any) => {
			console.log(data);
			path = '';
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
	<Display bind:playerId1 bind:playerId2 />
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
