<script lang="ts">
	import { fetchSlippiUser } from '$lib/util/api';
	import type { Options, Player } from '$lib/util/types';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import PlayerDisplay from './PlayerDisplay.svelte';
	import RecentPlayers from '$lib/components/RecentPlayers.svelte';

	export let textColor = '';
	export let displayOptions = {} as Options;
	export let winColor: string;
	export let loseColor: string;
	export let recentPlayersByCode: Record<string, RecentPlayer> = {};

	onMount(() => {
		document.body.scrollIntoView();
	});

	export let player: Player | undefined;
</script>

{#if player}
	<div
		class="content"
		in:fly={{ y: 100, duration: 300, delay: 305 }}
		out:fly={{ y: -100, duration: 300 }}
	>
		<PlayerDisplay {player} {textColor} {displayOptions} {winColor} {loseColor} />
		{#if displayOptions.recentPlayers}
			<RecentPlayers {recentPlayersByCode} {textColor} {winColor} {loseColor} />
		{/if}
	</div>
{/if}

<style>
</style>
