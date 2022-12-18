<script lang="ts">
	import { onMount } from 'svelte';

	let ready: boolean = false;
	onMount(() => (ready = true));
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" />
</svelte:head>

<div class="dragbar" />

{#if ready}
	<slot />
{/if}

<style>
	.dragbar {
		-webkit-app-region: drag;
		position: absolute;
		z-index: 99999;
		height: 20px;
		width: 100%;
	}
</style>
