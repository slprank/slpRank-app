<script lang="ts">
	import type { RecentPlayer } from '$lib/util/types';
	import { fly } from 'svelte/transition';

	export let textColor = '';
	export let winColor = '';
	export let loseColor = '';
	export let recentPlayersByCode: Record<string, RecentPlayer> = {};

	let recentPlayers: RecentPlayer[] = [];

	$: {
		let _recentPlayers = Object.values(recentPlayersByCode).map((recentPlayer) => ({
			...recentPlayer,
			character: recentPlayer.rankedNetplayProfile.characters[0],
			dateStarted: new Date(recentPlayer.dateStarted)
		}));

		_recentPlayers.sort((a, b) => {
			if (a.dateStarted < b.dateStarted) return 1;
			if (a.dateStarted > b.dateStarted) return -1;
			return 0;
		});

		recentPlayers = _recentPlayers.slice(0, 3);
	}
</script>

<div class="container" style={`color: ${textColor}`}>
	<h5>Recent players</h5>
	<div class="players-row">
		{#each recentPlayers as player}
			<div class="player">
				{#if player.didUserWin}
					<h6 style={`color: ${winColor}`}>Win</h6>
				{:else}
					<h6 style={`color: ${loseColor}`}>Loss</h6>
				{/if}
				<span>{player.displayName} ({player.connectCode})</span>
				{#if player.character?.icon}
					<img
						style="width: 16px; height: 16px;"
						src={`./character-icons/${player.character.icon}`}
						alt={player.character.character}
					/>
				{/if}
				<span>{player.rankedNetplayProfile.rank}</span>
				<span>{Math.floor(player.rankedNetplayProfile.ratingOrdinal)}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		color: white;
		min-width: 480px;
		padding: 1em;
		display: flex;
		gap: 1em;
		flex-direction: column;
	}
	.players-row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.player {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
