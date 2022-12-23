<script lang="ts">
	import { fetchSlippiUser } from '$lib/util/api';
	import { getPlayerRank } from '$lib/util/rank';
	import type { User } from '$lib/util/types';
	import { fly } from 'svelte/transition';
	import PlayerDisplay from './PlayerDisplay.svelte';

	export let playerIds: string[] = ['', ''];
	export let textColor = '';
	export let displayOptions = {} as any;

	$: players = [] as (User | undefined)[];
	$: playerIds.forEach(async (id, i) => players[i] = await fetchSlippiUser(id))
</script>

<svelte:head>
	<title>Overview</title>
	<meta name="Overview" content="overview" />
</svelte:head>

{#if players[0] && players[1]}
	<div
		class="content"
		in:fly={{ y: 200, duration: 300, delay: 300 }}
		out:fly={{ y: -200, duration: 300 }}
	>
		<PlayerDisplay player={players[0]} textColor={textColor} displayOptions={displayOptions} />
		<hr style="width: 95vw; margin-top: 0.5em; margin-bottom: 0.5em;" />
		<PlayerDisplay player={players[1]} textColor={textColor} displayOptions={displayOptions} />
	</div>
{:else}
	<h1
		style={`color: ${textColor}`}
		in:fly={{ y: 200, duration: 300, delay: 300 }}
		out:fly={{ y: -200, duration: 150 }}
	>
		Waiting for game..
	</h1>
{/if}

<style>
	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 1024px;
		flex-direction: column;
		gap: 1em;
	}

	.character-box {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 500px;
		width: 400px;
		flex-direction: column;
		gap: 1em;
	}

	.character-icon-box {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.col-3-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
	}

	.col-2-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
	}

	.grid-item {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5em;
	}

	h1 {
		font-size: 2.8rem;
		text-align: center;
		margin: 0;
	}

	h2 {
		font-weight: 600;
		font-size: 2.2em;
		margin: 0;
	}

	h3 {
		font-size: 1.8rem;
		margin: 0;
	}
</style>
