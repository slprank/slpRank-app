<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import Logo from '$lib/Logo.svelte';
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';

	let desktop: string;

	$: playerId1 = 'PIP#827';
	$: playerId2 = 'LIAX#424';

	if (window.electron && browser) {
		window.electron.receive('from-main', (data: any) => {
			desktop = `Received Message "${data}" from Electron`;
			console.log(desktop);
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
