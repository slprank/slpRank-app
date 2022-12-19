<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';

	let clear: NodeJS.Timeout;

	const ms = 1000;

	$: {
		clearInterval(clear);
		clear = setInterval(getData, ms);
	}

	const getData = async () => {
		// Add directory
		window.electron.getPlayers(/* Directory */);
		// Save directory to localStorage

		// Run function on interval
	};

	$: playerId1 = 'PIP#827';
	$: playerId2 = 'DISB#606';

	if (window.electron && browser) {
		window.electron.receive('get-data', async (data: any) => {
			const players = data.split(' ');
			playerId1 = players[0];
			playerId2 = players[1];
		});
	}

	const agent = window.electron ? 'Electron' : 'Browser';
</script>

<main>
	{#if !playerId1 || !playerId2}
		<h1 transition:fly={{ y: 200, duration: 300 }}>input for slippi directory</h1>
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
</style>
