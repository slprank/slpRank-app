<script lang="ts" context="module">
	import { writable } from 'svelte/store';
	import type { PlayerSessionStats } from './types';

	const isTest = writable<boolean>();

	const currentPlayerConnectCode = writable<string>();

	const sessionStartStats = writable<PlayerSessionStats>();
	const setStartStats = writable<PlayerSessionStats>();
	const currentStats = writable<PlayerSessionStats>();

	export { currentPlayerConnectCode, sessionStartStats, setStartStats, currentStats, isTest };
</script>
