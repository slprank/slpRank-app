<script lang="ts">
	import {
		currentPlayerConnectCode,
		currentStats,
		isTest,
		sessionStartStats
	} from '$lib/util/store.svelte';
	import { browser } from '$app/environment';
	import type { Options, PlayerSessionStats, Player } from '$lib/util/types';
	import { fly } from 'svelte/transition';
	import { fetchSlippiUser } from '$lib/util/api';
	import Range from './Range.svelte';
	import { onMount } from 'svelte';
	export let textColor = '';
	export let winColor = '';
	export let loseColor = '';
	export let backgroundColor = '';
	export let dolphinStatus = '';
	export let dolphinConnected = false;
	export let gamePath = '';
	export let displayOptions = {} as Options;
	export let start = false;
	export let sessionTitle = localStorage.getItem('session-title') ?? "Today's stats";
	export let obsStartScene = '';
	export let obsEndScene = '';
	export let obsUpdateStatsScene = '';
	export let setWon: HTMLAudioElement;
	export let setLost: HTMLAudioElement;
	export let setEnd: HTMLAudioElement;
	export let setWonDir = localStorage.getItem('setWonBase64');
	export let setLostDir = localStorage.getItem('setLostBase64');
	export let setEndDir = localStorage.getItem('setEndBase64');

	let connectCode = localStorage.getItem('player-code') ?? '';
	let player: Player | undefined;
	let setWonVolume: number = parseInt(localStorage.getItem('setWon') ?? '0') ?? 0;
	let setLostVolume: number = parseInt(localStorage.getItem('setLost') ?? '0') ?? 0;
	let setEndVolume: number = parseInt(localStorage.getItem('setEnd') ?? '0') ?? 0;

	$: status = '';
	$: appVersion = '';
	$: downloadUrl = '';

	window.electron.receive('download-url', async (url: string) => {
		downloadUrl = url;
	});

	window.electron.receive('update-status', async (newStatus: string) => {
		status = newStatus;
	});

	window.electron.receive('version', async (version: string) => {
		appVersion = version;
	});

	function DownloadUpdate() {
		window.electron.downloadUpdate();
	}

	function InstallUpdate() {
		window.electron.installUpdate();
	}

	const storeData = () => {
		if (displayOptions.automaticSessionReset) resetSession();

		$currentPlayerConnectCode = player?.connectCode.toUpperCase().trim() ?? '';

		localStorage.setItem('slippi-path', gamePath);
		localStorage.setItem('background-color', backgroundColor);
		localStorage.setItem('text-color', textColor);
		localStorage.setItem('win-color', winColor);
		localStorage.setItem('lose-color', loseColor);
		localStorage.setItem('player-code', player?.connectCode.toUpperCase().trim() ?? '');

		localStorage.setItem('hot-key-start', obsStartScene.trim());
		localStorage.setItem('hot-key-end', obsEndScene.trim());
		localStorage.setItem('hot-key-update', obsUpdateStatsScene.trim());

		localStorage.setItem(
			'automatic-session-reset',
			displayOptions.automaticSessionReset.toString()
		);
		localStorage.setItem('slippi-stats', displayOptions.slippiStats.toString());
		localStorage.setItem(
			`session-stats-${connectCode}`,
			JSON.stringify($sessionStartStats) ?? ({} as PlayerSessionStats)
		);
		localStorage.setItem('session-title', sessionTitle);

		localStorage.setItem('stats-rank', displayOptions.statsRank.toString());
		localStorage.setItem('neutral-wins', displayOptions.statsNeutralWins.toString());
		localStorage.setItem('damage-opening', displayOptions.statsDamageOpening.toString());
		localStorage.setItem('opening-kill', displayOptions.statsOpeningsKill.toString());
		localStorage.setItem('inputs-min', displayOptions.statsInputsMin.toString());
		localStorage.setItem('digital-inputs-min', displayOptions.statsDigitalInputsMin.toString());
		localStorage.setItem('total-damage', displayOptions.statsTotalDamage.toString());
		localStorage.setItem('stats-rolls', displayOptions.statsRolls.toString());
		localStorage.setItem('stats-l-cancel', displayOptions.statsSpotDodges.toString());
		localStorage.setItem('stats-spot-dodges', displayOptions.statsSpotDodges.toString());
		localStorage.setItem('stats-stocks', displayOptions.statsStocks.toString());
		localStorage.setItem('session', displayOptions.session.toString());

		localStorage.setItem('player-display-name', displayOptions.playerDisplayName.toString());
		localStorage.setItem('player-connect-code', displayOptions.playerConnectCode.toString());
		localStorage.setItem('player-rank-icon', displayOptions.playerRankIcon.toString());
		localStorage.setItem('player-rank-text', displayOptions.playerRankText.toString());
		localStorage.setItem('player-regional-placement', displayOptions.playerPlacement.toString());
		localStorage.setItem('player-win-loss', displayOptions.playerWinLoss.toString());
		localStorage.setItem('player-characters', displayOptions.playerCharacters.toString());

		localStorage.setItem('setWon', setWonVolume.toString());
		localStorage.setItem('setLost', setLostVolume.toString());
		localStorage.setItem('setEnd', setEndVolume.toString());

		localStorage.setItem(
			'current-game-characters',
			displayOptions.currentGameCharacters.toString()
		);

		window.electron.initGame(gamePath, player?.connectCode.toUpperCase().trim() ?? '');

		setWon.volume = setWonVolume / 100;
		setLost.volume = setLostVolume / 100;
		setEnd.volume = setEndVolume / 100;

		start = true;
	};

	async function fetchPlayer() {
		if (!connectCode) return;
		connectCode = connectCode.toUpperCase();
		if (player?.connectCode == connectCode) return;
		player = await fetchSlippiUser(connectCode);
		if (!player) {
			player = undefined;
			return;
		}
		$currentStats = {
			displayName: player?.displayName,
			connectCode: player?.connectCode,
			rating: player?.rankedNetplayProfile.ratingOrdinal,
			regionalPlacement: player?.rankedNetplayProfile.dailyRegionalPlacement,
			globalPlacement: player?.rankedNetplayProfile.dailyGlobalPlacement,
			wins: player?.rankedNetplayProfile.wins,
			losses: player?.rankedNetplayProfile.losses,
			timestamp: undefined,
			characters: [],
			stageId: -1,
			currentPlayerIndex: -1,
			opponentPlayerIndex: -1,
			players: [],
			scores: []
		};

		$sessionStartStats = JSON.parse(
			`${localStorage.getItem(`session-stats-${connectCode}`)}` ?? '{null}'
		) as PlayerSessionStats;
		$sessionStartStats;
		if ($sessionStartStats) return;
		resetSession();
	}

	function resetSession() {
		if (!player) return;
		const date = new Date();
		$sessionStartStats = {
			displayName: player?.displayName,
			connectCode: player?.connectCode,
			regionalPlacement: player?.rankedNetplayProfile.dailyRegionalPlacement,
			globalPlacement: player?.rankedNetplayProfile.dailyGlobalPlacement,
			rating: player?.rankedNetplayProfile.ratingOrdinal ?? 0,
			wins: player?.rankedNetplayProfile.wins ?? 0,
			losses: player?.rankedNetplayProfile.losses ?? 0,
			timestamp: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${
				date.getHours().toString().length < 2 ? `0${date.getHours()}` : date.getHours()
			}:${date.getMinutes().toString().length < 2 ? `0${date.getMinutes()}` : date.getMinutes()}`,
			characters: [],
			stageId: -1,
			currentPlayerIndex: -1,
			opponentPlayerIndex: -1,
			players: [],
			scores: []
		};
	}

	function SelectDirectory() {
		window.electron.selectFolder().then((result: any) => {
			gamePath = result ?? '';
		});
	}

	function TestAnnouncer(sound: string) {
		setWon.volume = setWonVolume / 100;
		setLost.volume = setLostVolume / 100;
		setEnd.volume = setEndVolume / 100;
		if (sound == 'setWon') setWon.play();
		if (sound == 'setLost') setLost.play();
		if (sound == 'setEnd') setEnd.play();
	}

	function RunTests() {
		storeData();
		$isTest = true;
		window.electron.runTests();
	}

	function SetDefaultOptions() {
		displayOptions = {
			...defaultOptions
		};

		backgroundColor = '#2C2F33';
		textColor = '#ffffff';
		winColor = '#2ECC40';
		loseColor = '#FF4D00';
		obsStartScene = '';
		obsEndScene = '';
		obsUpdateStatsScene = '';
	}

	const defaultOptions = {
		automaticSessionReset: false,
		playerDisplayName: true,
		playerConnectCode: false,
		playerRating: true,
		playerPlacement: true,
		playerWinLoss: true,
		playerCharacters: false,
		playerRankIcon: true,
		playerRankText: true,
		slippiStats: true,
		displayOpponent: false,
		statsRank: false,
		statsNeutralWins: true,
		statsOpeningsKill: true,
		statsDamageOpening: true,
		statsInputsMin: true,
		statsDigitalInputsMin: false,
		statsRolls: false,
		statsLCancel: false,
		statsTotalDamage: true,
		statsSpotDodges: false,
		statsStocks: true,
		session: true,
		currentGameCharacters: false
	} as Options;

	function SwitchScene(sceneName: string) {
		window.electron.switchScene(sceneName);
	}

	async function UploadFile(file: string) {
		const base64String = await window.electron.selectFile();
		console.log(base64String);

		if (file === 'setWon.mp3') {
			localStorage.setItem('setWonBase64', base64String);
			setWonDir = base64String;
		}
		if (file === 'setLost.mp3') {
			localStorage.setItem('setLostBase64', base64String);
			setLostDir = base64String;
		}
		if (file === 'setEnd.mp3') {
			localStorage.setItem('setEndBase64', base64String);
			setEndDir = base64String;
		}
	}

	onMount(() => {
		$sessionStartStats = JSON.parse(
			`${localStorage.getItem(`session-stats-${connectCode}`)}` ?? '{null}'
		) as PlayerSessionStats;
		if (!$sessionStartStats?.timestamp) SetDefaultOptions();
		if (connectCode) {
			fetchPlayer();
		}
	});
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key == 'Enter') fetchPlayer();
	}}
/>

<div
	class="home"
	in:fly={{ y: 100, duration: 300, delay: 305 }}
	out:fly={{ y: -100, duration: 300 }}
>
	<div class="box">
		<div class="col-2-container">
			<h2 class="right" style={`color: ${textColor}`}>Dolphin:</h2>
			<h2 class="left" style={`color: ${dolphinStatus == 'connected' ? winColor : textColor}`}>
				{dolphinStatus}
			</h2>
		</div>

		<button
			class="btn btn-success"
			disabled={!['Download', 'Install'].includes(status)}
			on:click={() => (status == 'Download' ? DownloadUpdate() : InstallUpdate())}
			>{status ? status : 'Update'} - {`v${appVersion}`}</button
		>
		{#if downloadUrl}
			<p
				style={`color: ${textColor}`}
				in:fly={{ x: -20, duration: 300, delay: 305 }}
				out:fly={{ x: -20, duration: 300 }}
			>
				Trouble installing: <a href="" on:click={() => window.electron.externalUrl(downloadUrl)}
					>download</a
				>
			</p>
		{/if}
		<h3 style={`margin-top: 0.5em; color: ${textColor}`}>Slippi replays directory</h3>
		<button
			on:click={SelectDirectory}
			type="button"
			class="btn btn-primary"
			data-tooltip="Preferred not to use monthly sub folders for replays. Select most recent sub folder if you so chooses to use them"
			>Select Directory</button
		>
		<p style={`color: ${textColor}`}>{gamePath ?? 'No directory selected'}</p>
		<h3 style={`color: ${textColor}`}>Connect code</h3>
		<div class="col-2-container">
			<input bind:value={connectCode} placeholder="abcd#123" />
			<button
				class="btn btn-success"
				style="width: 5em"
				on:click={fetchPlayer}
				data-tooltip="Updating player will reset session">Update</button
			>
		</div>
		<div>
			{#if player}
				<h5
					class="left"
					style={`color: ${textColor};`}
					in:fly={{ x: -20, duration: 300, delay: 305 }}
					out:fly={{ x: -20, duration: 300 }}
				>
					Hi,
				</h5>
				{#key player?.displayName}
					<h3
						class="left"
						style={`color: ${textColor}`}
						in:fly={{ x: -20, duration: 300, delay: 350 }}
						out:fly={{ x: -20, duration: 300 }}
					>
						{player?.displayName}
					</h3>
				{/key}
			{/if}
		</div>
	</div>
	<div class="options-container">
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Background color:
			</h5>
			<input
				bind:value={backgroundColor}
				disabled={!connectCode.length}
				type="color"
				class="form-control form-control-color"
				id="exampleColorInput"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Text color:</h5>
			<input
				bind:value={textColor}
				type="color"
				class="form-control form-control-color"
				id="exampleColorInput"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>W/L color:</h5>
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${winColor}`}>W</h5>
			<input
				bind:value={winColor}
				type="color"
				class="form-control form-control-color"
				id="exampleColorInput"
			/>
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${loseColor}`}>L</h5>
			<input
				bind:value={loseColor}
				type="color"
				class="form-control form-control-color"
				id="exampleColorInput"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Display session stats:
			</h5>
			<input
				bind:checked={displayOptions.session}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Session title:</h5>
			<input bind:value={sessionTitle} placeholder="Today's session" />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Automatic session reset:
			</h5>
			<input
				bind:checked={displayOptions.automaticSessionReset}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
				data-tooltip="Reset session every time you press 'Start'"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Session: ({$sessionStartStats?.timestamp})
			</h5>
			<button
				class="btn btn-success"
				style="width: 4em"
				on:click={resetSession}
				data-tooltip="Session reset takes effect when pressing 'Start'"
				>{$sessionStartStats?.timestamp ? 'Reset' : 'Start'}</button
			>
		</div>
		<hr style="width: 95%; margin-top: 0.5em; margin-bottom: 0.5em;" />
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Slippi stats:</h5>
			<input
				bind:checked={displayOptions.slippiStats}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
				data-tooltip="Show post game stats"
			/>
		</div>
		<hr />

		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>During game:</h5>
			<div />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Characters:</h5>
			<input
				bind:checked={displayOptions.currentGameCharacters}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<hr />

		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Player stats:</h5>
			<div />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Display name:</h5>
			<input
				bind:checked={displayOptions.playerDisplayName}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Connect code:</h5>
			<input
				bind:checked={displayOptions.playerConnectCode}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Rank icon:</h5>
			<input
				bind:checked={displayOptions.playerRankIcon}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Rank (text):</h5>
			<input
				bind:checked={displayOptions.playerRankText}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Rating:</h5>
			<input
				bind:checked={displayOptions.playerRating}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Regional placement:
			</h5>
			<input
				bind:checked={displayOptions.playerPlacement}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Win/Loss:</h5>
			<input
				bind:checked={displayOptions.playerWinLoss}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Characters:</h5>
			<input
				bind:checked={displayOptions.playerCharacters}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<hr />
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Post game stats:</h5>
			<div />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Rank:</h5>
			<input
				bind:checked={displayOptions.statsRank}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Neutral wins:</h5>
			<input
				bind:checked={displayOptions.statsNeutralWins}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Opening/Kill</h5>
			<input
				bind:checked={displayOptions.statsOpeningsKill}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Damage/Opening:</h5>
			<input
				bind:checked={displayOptions.statsDamageOpening}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Inputs/Min:</h5>
			<input
				bind:checked={displayOptions.statsInputsMin}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Digital Inputs/Min:
			</h5>
			<input
				bind:checked={displayOptions.statsDigitalInputsMin}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Total damage:</h5>
			<input
				bind:checked={displayOptions.statsTotalDamage}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>L-cancel rate:</h5>
			<input
				bind:checked={displayOptions.statsLCancel}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Roll count:</h5>
			<input
				bind:checked={displayOptions.statsRolls}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Spot dodge count:
			</h5>
			<input
				bind:checked={displayOptions.statsSpotDodges}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Stocks:</h5>
			<input
				bind:checked={displayOptions.statsStocks}
				class="form-check-input"
				type="checkbox"
				id="flexCheckDefault"
				style="height: 35px; width: 47px"
			/>
		</div>
		<hr />

		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Automatic obs scene switch:
			</h5>
			<div />
		</div>
		<div class="option">
			<a
				href="./obs.txt"
				target="_blank"
				rel="noreferrer"
				style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Setup</a
			>
			<div />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Start game:</h5>
			<input
				bind:value={obsStartScene}
				placeholder="Scene 1"
				data-tooltip="Switches to scene when game is starting"
			/>
			<button
				on:click={() => SwitchScene(obsStartScene)}
				type="button"
				class="btn btn-success"
				style="width: 60px"
				data-tooltip="Should switch to game-start scene on click">Test</button
			>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>End game:</h5>
			<input
				bind:value={obsEndScene}
				placeholder="Scene 2"
				data-tooltip="Switches to scene after game and or after updating stats"
			/>
			<button
				on:click={() => SwitchScene(obsEndScene)}
				type="button"
				class="btn btn-success"
				style="width: 60px"
				data-tooltip="Should switch to game-end scene on click">Test</button
			>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Update stats:</h5>
			<input
				bind:value={obsUpdateStatsScene}
				placeholder="Scene 3"
				data-tooltip="Switching temporary to scene while updating stats, then back to end-game scene"
			/>
			<button
				on:click={() => SwitchScene(obsUpdateStatsScene)}
				type="button"
				class="btn btn-success"
				style="width: 60px"
				data-tooltip="Should switch to rank-up/down scene on click">Test</button
			>
		</div>
		<hr />
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Post set sound effects:
			</h5>
			<div />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Volume - set won:
			</h5>
			<Range bind:value={setWonVolume} />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Set won:</h5>
			<button
				type="button"
				class="btn btn-success"
				style="width: 120px"
				data-tooltip="File limit: ~5MB"
				on:click={() => UploadFile('setWon.mp3')}>Upload</button
			>
			<button
				type="button"
				class="btn btn-success"
				style="width: 150px"
				on:click={() => TestAnnouncer('setWon')}>Test</button
			>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Volume - set lost:
			</h5>
			<Range bind:value={setLostVolume} />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Set lost:</h5>
			<button
				type="button"
				class="btn btn-success"
				style="width: 120px"
				data-tooltip="File limit: ~5MB"
				on:click={() => UploadFile('setLost.mp3')}>Upload</button
			>
			<button
				type="button"
				class="btn btn-success"
				style="width: 150px"
				on:click={() => TestAnnouncer('setLost')}>Test</button
			>
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Volume - set end:
			</h5>
			<Range bind:value={setEndVolume} />
		</div>
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Set end:</h5>
			<button
				type="button"
				class="btn btn-success"
				style="width: 120px"
				data-tooltip="File limit: ~5MB"
				on:click={() => UploadFile('setEnd.mp3')}>Upload</button
			>
			<button
				type="button"
				class="btn btn-success"
				style="width: 150px"
				on:click={() => TestAnnouncer('setEnd')}>Test</button
			>
		</div>

		<hr />
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>Test overlay:</h5>
			<button
				disabled={!gamePath || !player || !connectCode}
				type="button"
				class="btn btn-success"
				style="width: 150px"
				data-tooltip="Saves settings and runs through 10 of your recent games which has been online. (Some data might not be correct) Restart application when done"
				on:click={RunTests}>Test</button
			>
		</div>
		<hr />
		<div class="option">
			<h5 style={`margin-top: auto; margin-bottom: auto; color: ${textColor}`}>
				Default settings:
			</h5>
			<button
				type="button"
				class="btn btn-success"
				style="width: 150px"
				on:click={SetDefaultOptions}>Reset</button
			>
		</div>
	</div>
	<div class="box-bottom">
		<button
			type="button"
			disabled={!gamePath || !dolphinConnected || !player || !connectCode}
			class="btn btn-success"
			style="width: 200px"
			on:click={storeData}>Start</button
		>
		<h6>
			<a
				href=""
				on:click={() => window.electron.externalUrl('https://twitter.com/SniderSSBM')}
				style={`color: ${textColor}`}>@SniderSSBM</a
			>
		</h6>
	</div>
</div>

<style>
	.home {
		padding-top: 1em;
		padding-bottom: 1em;
		display: flex;
		grid-template-rows: repeat(3, 1fr);
		grid-template-columns: repeat(1);
		grid-gap: auto;
		align-items: center;
		justify-content: center;
		height: 95vh;
		flex-direction: column;
		gap: 2em;
		padding: 2em;
	}

	.box {
		display: flex;
		align-items: left;
		justify-content: space-evenly;
		flex-direction: column;
		gap: 1em;
	}

	.box-bottom {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		flex-direction: column;
		gap: 1em;
	}

	.options-container {
		display: flex;
		min-height: 200px;
		height: 100%;
		width: 100%;
		flex-direction: column;
		gap: 1em;
		overflow-x: auto;
	}

	.option {
		display: flex;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
		align-content: space-around;
		justify-content: space-between;
	}

	input {
		text-align: center;
	}

	.col-2-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(1);
		grid-gap: 10px;
		justify-content: space-around;
	}

	.left {
		display: flex;
		justify-content: left;
		align-items: left;
		text-align: left;
	}
	.right {
		display: flex;
		justify-content: right;
		align-items: right;
		text-align: right;
	}

	[data-tooltip] {
		position: relative;
		z-index: 2;
		display: block;
	}

	[data-tooltip]:before,
	[data-tooltip]:after {
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		transition: 0.2s ease-out;
		transform: translate(-50%, 5px);
	}

	[data-tooltip]:before {
		position: absolute;
		bottom: 100%;
		left: 50%;
		margin-bottom: 5px;
		padding: 7px;
		width: 100%;
		min-width: 70px;
		max-width: 250px;
		-webkit-border-radius: 3px;
		-moz-border-radius: 3px;
		border-radius: 3px;
		background-color: #000;
		background-color: hsla(0, 0%, 20%, 0.9);
		color: #fff;
		content: attr(data-tooltip);
		text-align: center;
		font-size: 14px;
		line-height: 1.2;
		transition: 0.2s ease-out;
	}

	[data-tooltip]:after {
		position: absolute;
		bottom: 100%;
		left: 50%;
		width: 0;
		border-top: 5px solid #000;
		border-top: 5px solid hsla(0, 0%, 20%, 0.9);
		border-right: 5px solid transparent;
		border-left: 5px solid transparent;
		content: ' ';
		font-size: 0;
		line-height: 0;
	}

	[data-tooltip]:hover:before,
	[data-tooltip]:hover:after {
		visibility: visible;
		opacity: 1;
		transform: translate(-50%, 0);
	}
	[data-tooltip='false']:hover:before,
	[data-tooltip='false']:hover:after {
		visibility: hidden;
		opacity: 0;
	}
</style>
