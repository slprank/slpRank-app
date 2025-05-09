<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import Display from '$lib/components/Display.svelte';
	import StatDisplay from '$lib/components/StatDisplay.svelte';
	import type { GameEndType, GameStartType, SlippiGame, StatsType } from '@slippi/slippi-js';
	import { onMount } from 'svelte';
	import Home from '$lib/components/Home.svelte';
	import type { Options, Player, PlayerStatsType, RecentPlayer } from '$lib/util/types';
	import {
		currentPlayerConnectCode,
		currentStats,
		isTest,
		sessionStartStats,
		setStartStats
	} from '$lib/util/store.svelte';
	import { fetchSlippiUser } from '$lib/util/api';
	import UpdateStats from '$lib/components/UpdateStats.svelte';
	import SessionStats from '$lib/components/SessionStats.svelte';
	import RecentPlayers from '$lib/components/RecentPlayers.svelte';
	import CurrentSet from '$lib/components/CurrentSet.svelte';
	import Leffen from '$lib/components/Leffen.svelte';
	import { getPlayerCharacter } from '$lib/util/character';
	import { getPlayerRank } from '$lib/util/rank';

	onMount(() => {
		window.electron.getDolphinStatus();
		document.body.scrollIntoView();
		window.electron.checkUpdate();
	});

	let setWon: HTMLAudioElement;
	let setLost: HTMLAudioElement;
	let setEnd: HTMLAudioElement;
	$: setWonDir = localStorage.getItem('setWonBase64') ?? './sounds/announcer/setWon.mp3';
	$: setLostDir = localStorage.getItem('setLostBase64') ?? './sounds/announcer/setLost.mp3';
	$: setEndDir = localStorage.getItem('setEndBase64') ?? './sounds/announcer/setEnd.mp3';

	let gamePath: string = localStorage.getItem('slippi-path') ?? '';
	let backgroundColor: string = localStorage.getItem('background-color') ?? '#2C2F33';
	let textColor: string = localStorage.getItem('text-color') ?? '#ffffff';
	let winColor: string = localStorage.getItem('win-color') ?? '#2ECC40';
	let loseColor: string = localStorage.getItem('lose-color') ?? '#FF4D00';
	let obsStartScene: string = localStorage.getItem('hot-key-start') ?? '';
	let obsEndScene: string = localStorage.getItem('hot-key-end') ?? '';
	let obsUpdateStatsScene: string = localStorage.getItem('hot-key-update') ?? '';
	let obsPostGameStatsScene: string = localStorage.getItem('hot-key-post-game-stats') ?? '';

	let sessionTitle: string;
	$: hasPlayers = players.filter((p) => p?.connectCode).length;

	$: start = false;
	$: gameOver = false;
	$: updatingStats = false;

	$: showPlayer = true;
	let showPlayerTimeout: NodeJS.Timeout;

	$: players = [] as (Player | undefined)[];
	$: recentPlayersByCode = {} as Record<string, Player>;

	$: displayOptions = {
		automaticSessionReset: localStorage.getItem('automatic-session-reset') == 'true',
		slippiStats: localStorage.getItem('slippi-stats') == 'true',
		statsRank: localStorage.getItem('stats-rank') == 'true',
		statsNeutralWins: localStorage.getItem('neutral-wins') == 'true',
		statsDamageOpening: localStorage.getItem('damage-opening') == 'true',
		statsOpeningsKill: localStorage.getItem('opening-kill') == 'true',
		statsRolls: localStorage.getItem('stats-rolls') == 'true',
		statsInputsMin: localStorage.getItem('inputs-min') == 'true',
		statsDigitalInputsMin: localStorage.getItem('digital-inputs-min') == 'true',
		statsTotalDamage: localStorage.getItem('total-damage') == 'true',
		statsLCancel: localStorage.getItem('stats-l-cancel') == 'true',
		statsSpotDodges: localStorage.getItem('stats-spot-dodges') == 'true',
		statsStocks: localStorage.getItem('stats-stocks') == 'true',
		session: localStorage.getItem('session') == 'true',
		recentPlayers: localStorage.getItem('recent-players') == 'true',
		playerDisplayName: localStorage.getItem('player-display-name') == 'true',
		playerConnectCode: localStorage.getItem('player-connect-code') == 'true',
		playerRankIcon: localStorage.getItem('player-rank-icon') == 'true',
		playerRankText: localStorage.getItem('player-rank-text') == 'true',
		playerRating: localStorage.getItem('player-rating') == 'true',
		playerPlacement: localStorage.getItem('player-regional-placement') == 'true',
		playerWinLoss: localStorage.getItem('player-win-loss') == 'true',
		playerCharacters: localStorage.getItem('player-characters') == 'true',
		currentGameCharacters: localStorage.getItem('current-game-characters') == 'true'
	} as Options;

	$: dolphinStatus = 'connecting';
	$: dolphinConnected = false;

	if (window.electron && browser) {
		window.electron.receive(
			'game-start',
			async (id1: string, id2: string, settings: GameStartType) => {
				console.log({ id1, id2, settings });
				window.electron.switchScene(obsStartScene);
				if (!id1 || !id2) return;
				players = [
					{ ...(await fetchSlippiUser(id1)), stats: players[0]?.stats } as Player,
					{ ...(await fetchSlippiUser(id2)), stats: players[1]?.stats } as Player
				];

				$currentStats = {
					...$currentStats,
					characters: [
						getPlayerCharacter(settings?.players[0]),
						getPlayerCharacter(settings?.players[1])
					],
					currentPlayerIndex: players[0]?.connectCode === $currentPlayerConnectCode ? 0 : 1, // Make more dynamic
					opponentPlayerIndex: players[0]?.connectCode === $currentPlayerConnectCode ? 1 : 0, // Make more dynamic
					players: [players[0]?.displayName ?? '', players[1]?.displayName ?? ''],
					stageId: settings.stageId ?? -1
				};

				setTimeout(() => {
					gameOver = false;
				}, 100);
				showPlayer = false;
				clearTimeout(showPlayerTimeout);

				const prevOpponentDisplayName =
					$setStartStats.players[$currentStats.opponentPlayerIndex] ?? '';
				const currentOpponentDisplayName =
					$currentStats.players[$currentStats.opponentPlayerIndex] ?? '';

				$setStartStats = {
					...$currentStats,
					rank: $currentStats.rank,
					characters: [
						getPlayerCharacter(settings?.players[0]),
						getPlayerCharacter(settings?.players[1])
					],
					players: [players[0]?.displayName ?? '', players[1]?.displayName ?? ''],
					scores:
						prevOpponentDisplayName === currentOpponentDisplayName ? $setStartStats.scores : [0, 0],
					stageId: settings.stageId ?? -1
				};
			}
		);
		window.electron.receive(
			'game-end',
			async (data: GameEndType, newStats: StatsType, settings: GameStartType) => {
				console.log(data, newStats, settings);
				if (!players[0] || !players[1]) return;
				players[0]!.character = getPlayerCharacter(settings?.players[0]);
				players[0]!.stats = {
					actionCounts: newStats.actionCounts[0],
					gameComplete: newStats.gameComplete,
					overall: newStats.overall[0],
					stocks: newStats.stocks.filter((s) => s.playerIndex === 0),
					conversions: newStats.conversions.filter((c) => c.playerIndex === 0),
					combos: newStats.combos.filter((c) => c.playerIndex === 0)
				};
				players[1]!.character = getPlayerCharacter(settings?.players[1]);
				players[1]!.stats = {
					actionCounts: newStats.actionCounts[1],
					gameComplete: newStats.gameComplete,
					overall: newStats.overall[1],
					stocks: newStats.stocks.filter((s) => s.playerIndex === 1),
					conversions: newStats.conversions.filter((c) => c.playerIndex === 1),
					combos: newStats.combos.filter((c) => c.playerIndex === 1)
				};

				if (!data) return;
				await HandleStatChange();

				gameOver = true;
				let player1won = data?.placements[0]?.position === 0;

				let placements = [data?.placements[0]?.position ?? 0, data?.placements[1]?.position ?? 0];

				if (data.lrasInitiatorIndex === 0) {
					placements = [0, 1];
				} else if (data.lrasInitiatorIndex === 1) {
					placements = [1, 0];
				} else if (player1won) {
					placements[0] = 1;
					placements[1] = 0;
				} else if (!player1won) {
					placements[0] = 0;
					placements[1] = 1;
				}

				console.log(placements);

				$setStartStats = {
					...$setStartStats,
					scores: $setStartStats.scores.map((score, i) => (score += placements[i]!))
				};

				for (const player of players) {
					if (player.connectCode === $currentPlayerConnectCode) continue;
					const { playerIndex } = player.stats.overall;

					fetchSlippiUser(player.connectCode).then((slippiUser) => {
						recentPlayersByCode[player.connectCode] = {
							...slippiUser,
							...player,
							name: player.displayName,
							playerIndex,
							didUserWin: placements[playerIndex] === 0,
							dateStarted: (new Date()).toISOString(),
						};
					});
				}

				ShowPostGameStats();
			}
		);
		window.electron.receive('init-stats', async () => {
			console.log('Initializing stats');
			let currentRankStats = await fetchSlippiUser($currentPlayerConnectCode);
			players[0] = await fetchSlippiUser($currentPlayerConnectCode);
			players[0]!.stats = {} as PlayerStatsType;
			players[1] = players[0];
			if (!currentRankStats) return;
			$currentStats = {
				displayName: currentRankStats.displayName,
				connectCode: currentRankStats.connectCode,
				characters: [],
				rating: currentRankStats.rankedNetplayProfile.ratingOrdinal,
				rank: currentRankStats.rankedNetplayProfile.rank,
				regionalPlacement: currentRankStats.rankedNetplayProfile.dailyRegionalPlacement,
				globalPlacement: currentRankStats.rankedNetplayProfile.dailyGlobalPlacement,
				wins: currentRankStats.rankedNetplayProfile.wins,
				losses: currentRankStats.rankedNetplayProfile.losses,
				timestamp: undefined,
				scores: [0, 0],
				stageId: -1,
				currentPlayerIndex: 0,
				opponentPlayerIndex: -1,
				players: [players[0]?.displayName ?? '']
			};
			$setStartStats = {
				...$currentStats
			};
		});

		window.electron.receive(
			'previous-opponents',
			async (_recentPlayers: Partial<RecentPlayer>[]) => {
				if (!_recentPlayers) return;

				for (const recentPlayer of _recentPlayers) {
					fetchSlippiUser(recentPlayer.connectCode).then((slippiUser) => {
						recentPlayersByCode[recentPlayer.connectCode] = {
							...slippiUser,
							...recentPlayer
						};
					});
				}
			}
		);

		window.electron.receive('reset-score', async () => {
			$setStartStats.scores = [0, 0];
		});
		window.electron.receive('increase-player1-score', async () => {
			$setStartStats.scores[0] += 1;
		});
		window.electron.receive('decrease-player1-score', async () => {
			$setStartStats.scores[0] -= 1;
		});
		window.electron.receive('increase-player2-score', async () => {
			$setStartStats.scores[1] += 1;
		});
		window.electron.receive('decrease-player2-score', async () => {
			$setStartStats.scores[1] -= 1;
		});
		window.electron.receive('return-home', async () => {
			start = false;
			gameOver = false;
			updatingStats = false;

			players = [] as (Player | undefined)[];
		});
		window.electron.receive('disconnected-event', async (data: string) => {
			dolphinConnected = false;
			dolphinStatus = data;
		});
		window.electron.receive('connected-event', async (data: string) => {
			dolphinConnected = true;
			dolphinStatus = data;
		});
		window.electron.receive('connecting-event', async (data: string) => {
			dolphinConnected = false;
			dolphinStatus = data;
		});
	}

	function ShowPostGameStats() {
		showPlayer = !displayOptions.slippiStats;
		if (!displayOptions.slippiStats) return;
		showPlayerTimeout = setTimeout(() => {
			showPlayer = true;
			window.electron.switchScene(obsPostGameStatsScene);
		}, 35000);
	}

	async function HandleStatChange() {
		showPlayer = false;
		if (!$currentPlayerConnectCode) return;
		let currentRankStats = await fetchSlippiUser($currentPlayerConnectCode);
		if (!currentRankStats) return;
		const RANDOM_RATING =
			((Math.random() < 0.5 ? -1 : 1) * (1 * Math.floor(Math.random() * 3500))) / 10;
		$currentStats = {
			...$currentStats,
			rank: !$isTest
				? currentRankStats.rankedNetplayProfile.rank
				: getPlayerRank(
						currentRankStats.rankedNetplayProfile.ratingOrdinal + RANDOM_RATING,
						currentRankStats.rankedNetplayProfile.dailyRegionalPlacement,
						currentRankStats.rankedNetplayProfile.dailyGlobalPlacement
				  ),
			rating: currentRankStats.rankedNetplayProfile.ratingOrdinal + ($isTest ? RANDOM_RATING : 0),
			regionalPlacement: currentRankStats.rankedNetplayProfile.dailyRegionalPlacement,
			globalPlacement: currentRankStats.rankedNetplayProfile.dailyGlobalPlacement,
			wins: currentRankStats.rankedNetplayProfile.wins + ($isTest && RANDOM_RATING > 0 ? 1 : 0),
			losses: currentRankStats.rankedNetplayProfile.losses + ($isTest && RANDOM_RATING <= 0 ? 1 : 0)
		};
		players[$currentStats.currentPlayerIndex] = {
			...players[$currentStats.currentPlayerIndex]!,
			rankedNetplayProfile: {
				...players[$currentStats.currentPlayerIndex]!.rankedNetplayProfile,
				ratingOrdinal:
					currentRankStats.rankedNetplayProfile.ratingOrdinal + ($isTest ? RANDOM_RATING : 0),
				rank: currentRankStats.rankedNetplayProfile.rank,
				wins: currentRankStats.rankedNetplayProfile.wins + ($isTest && RANDOM_RATING > 0 ? 1 : 0),
				losses:
					currentRankStats.rankedNetplayProfile.losses + ($isTest && RANDOM_RATING <= 0 ? 1 : 0)
			}
		};
		if ($currentStats.rating == $setStartStats.rating) {
			window.electron.switchScene(obsEndScene);
			return;
		}
		window.electron.switchScene(obsUpdateStatsScene?.length ? obsUpdateStatsScene : obsEndScene);
		updatingStats = true;
	}
</script>

<svelte:head>
	<title>Stat Display</title>
</svelte:head>

<main
	style={`background: ${backgroundColor};min-height: ${!start ? '820' : '0'}px; ${
		displayOptions.session ? '' : 'padding-bottom: 0'
	}`}
>
	{#if start && $setStartStats?.players && !updatingStats}
		<CurrentSet {textColor} />
	{/if}
	<div />
	{#if !start}
		<div in:fly={{ y: -100, duration: 300, delay: 305 }} out:fly={{ y: -100, duration: 300 }}>
			<Home
				bind:textColor
				bind:winColor
				bind:loseColor
				bind:backgroundColor
				bind:dolphinStatus
				bind:dolphinConnected
				bind:gamePath
				bind:displayOptions
				bind:start
				bind:sessionTitle
				bind:obsStartScene
				bind:obsEndScene
				bind:obsUpdateStatsScene
				bind:obsPostGameStatsScene
				bind:setWon
				bind:setLost
				bind:setEnd
				bind:setWonDir
				bind:setLostDir
				bind:setEndDir
			/>
		</div>
	{:else if players[$setStartStats?.currentPlayerIndex ?? 0] && showPlayer}
		<div in:fly={{ y: -100, duration: 300, delay: 305 }} out:fly={{ y: -100, duration: 300 }}>
			<Display
				{textColor}
				{displayOptions}
				player={players[$setStartStats?.currentPlayerIndex ?? 0]}
				{recentPlayersByCode}
				{winColor}
				{loseColor}
			/>
		</div>
	{:else if updatingStats && start}
		<div
			in:fly={{ y: -100, duration: 300, delay: 1105 }}
			out:fly={{ y: -100, duration: 300, delay: 800 }}
		>
			<UpdateStats
				bind:updatingStats
				bind:setWon
				bind:setLost
				bind:setEnd
				{textColor}
				{winColor}
				{loseColor}
				{obsEndScene}
			/>
		</div>
		<!-- Prevent these to render at once -->
	{:else if gameOver && displayOptions?.slippiStats && start}
		<div in:fly={{ y: -100, duration: 300, delay: 1105 }} out:fly={{ y: -100, duration: 300 }}>
			<StatDisplay {textColor} {displayOptions} bind:players />
		</div>
	{:else if (!gameOver || !displayOptions?.slippiStats) && hasPlayers && start}
		<div
			in:fly={{ y: -100, duration: 300, delay: 305 }}
			out:fly={{ y: -100, duration: 300, delay: 800 }}
		>
			<Leffen {players} {displayOptions} {textColor} {winColor} {loseColor} />
		</div>
	{:else}
		<h1
			style={`color: ${textColor}`}
			in:fly={{ y: -100, duration: 300, delay: 305 }}
			out:fly={{ y: -100, duration: 300 }}
		>
			Waiting for game..
		</h1>
	{/if}
	<div />
	{#if !updatingStats && start && displayOptions.session}
		<SessionStats {textColor} {winColor} {loseColor} {sessionTitle} />
	{/if}

	<audio src={setWonDir ?? ''} bind:this={setWon} />
	<audio src={setLostDir ?? ''} bind:this={setLost} />
	<audio src={setEndDir ?? ''} bind:this={setEnd} />
</main>

<style>
	main {
		top: 0;
		padding-top: 1em;
		padding-bottom: 1em;
		display: flex;
		grid-template-rows: repeat(3, 1fr);
		grid-template-columns: repeat(1);
		grid-gap: 10px;
		align-items: center;
		justify-content: space-between;
		height: 100vh;
		min-width: 480px;
		flex-direction: column;
		gap: 1em;
		overflow: hidden;
	}
</style>
