<script lang="ts">
	import { fly } from 'svelte/transition';
	// Get slippi file directory

	import Display from '$lib/components/Display.svelte';

	$: playerId1 = 'IBDW#0';
	$: playerId2 = 'PLUB#754';

	// Read metadata

	// Parse playerids to display

	// If metadata - switch scene
</script>

<svelte:head>
	<title>Setup</title>
	<meta name="Setup" content="setup" />
</svelte:head>

<div class="content">
	{#if !playerId1 || !playerId2}
		<h1 transition:fly={{ y: 200, duration: 300 }}>input for slippi directory</h1>
	{/if}
	<Display bind:playerId1 bind:playerId2 />
</div>
