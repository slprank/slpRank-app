<script lang="ts">
	import { setStartStats } from '$lib/util/store.svelte';
	import { fly } from 'svelte/transition';
	import { textfit } from 'svelte-textfit';

	export let textColor = '';
	let parent: Node;
</script>

{#if $setStartStats && $setStartStats?.players[0] && $setStartStats?.players[1]}
	{#key $setStartStats?.scores}
		<div
			class="content-head"
			style={`z-index: 10;`}
			in:fly={{ y: -100, duration: 300, delay: 950 }}
			out:fly={{ y: -100, duration: 300 }}
		>
			<div
				bind:this={parent}
				class="left"
				style="height: 35px; align-items: center"
				use:textfit={{
					mode: 'multi',
					width: 145,
					height: 35,
					forceSingleModeWidth: false
				}}
			>
				<h4 style={`color: ${textColor}; width: 145px; `} use:textfit={{ parent, mode: 'multi' }}>
					{$setStartStats?.players[0] ?? ''}
				</h4>
			</div>
			<img
				src={`./characters/${$setStartStats?.characters[0]?.characterId}/${$setStartStats?.characters[0]?.characterColorId}/stock.png`}
				style="width: 1.6em; height: 1.6em;"
				alt="rank"
				class="column right"
			/>
			<h1 style={`color: ${textColor}`}>{$setStartStats?.scores[0]}</h1>
			<h1 style={`color: ${textColor}`}>-</h1>
			<h1 style={`color: ${textColor}`}>{$setStartStats?.scores[1]}</h1>
			<img
				src={`./characters/${$setStartStats?.characters[1]?.characterId}/${$setStartStats?.characters[1]?.characterColorId}/stock.png`}
				style="width: 1.6em; height: 1.6em;"
				alt="rank"
				class="column right"
			/>

			<div bind:this={parent} class="right" style="height: 35px; align-items: center">
				<h4 style={`color: ${textColor}; width: 145px; `} use:textfit={{ parent, mode: 'multi' }}>
					{$setStartStats?.players[1] ?? ''}
				</h4>
			</div>
		</div>
	{/key}
{/if}

<style>
	.content-head {
		position: fixed;
		padding: 1em;
		padding-top: 0;
		padding-bottom: 0;
		top: 0;
		width: 100vw;
		height: 5em;
		display: grid;
		grid-template-columns: 1fr 2em 1em 1em 1em 2em 1fr;
		grid-template-rows: repeat(1);
		grid-gap: 0.5em;
		justify-content: center;
		justify-items: center;
		align-items: center;
	}

	h4 {
		display: flex;
		justify-content: center;
		justify-items: center;
		font-size: 1em;
		margin: 0;
		white-space: nowrap;
		max-width: 150px;
	}

	.left {
		display: flex;
		justify-content: flex-start;
		text-align: start;
	}

	.right {
		display: flex;
		justify-content: flex-end;
		text-align: end;
	}

	.text-center {
		display: flex;
		justify-content: center;
		text-align: center;
	}
</style>
