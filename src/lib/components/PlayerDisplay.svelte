<script lang="ts">
	import type { User } from "$lib/util/types";

    export let player: User;
	export let textColor = '';
	export let displayOptions = {} as any;
</script>

<div class="character-box">
    {#if displayOptions.playerTag}
        <h1 style={`color: ${textColor}`}>{player.displayName}</h1>
    {/if}
    {#if displayOptions.playerCode}
        <h3 style={`color: ${textColor}`}>{player.connectCode}</h3>
    {/if}
    {#if displayOptions.rankIcon}
        <img
            style="width: 56px; height: 56px;"
            src={`./rank-icons/${player.rankedNetplayProfile.rank}.svg`}
            alt={'rank'}
        />
    {/if}
    {#if displayOptions.rankText}
        <h2 style={`color: ${textColor}`}>{player.rankedNetplayProfile.rank}</h2>
    {/if}
    {#if displayOptions.playerRating}
        <h2 style={`color: ${textColor}`}>
            {player?.rankedNetplayProfile?.ratingOrdinal.toFixed(1)}
        </h2>
    {/if}
    {#if displayOptions.playerWinLoss}
        <h3 style={`color: ${textColor}`}>
            Regional placement: {player?.rankedNetplayProfile?.dailyRegionalPlacement ?? 'N/A'}
        </h3>
    {/if}
    {#if displayOptions.playerWinLoss}
        <div class="col-2-container">
            <h2 class="grid-item" style={`color: ${textColor}`}>
                Wins: {player?.rankedNetplayProfile?.wins}
            </h2>
            <h2 class="grid-item" style={`color: ${textColor}`}>
                Losses: {player?.rankedNetplayProfile?.losses}
            </h2>
        </div>
    {/if}
    {#if displayOptions.playerCharacters}
        <div class={`col-${player?.rankedNetplayProfile?.characters.length}-container`}>
            {#each player?.rankedNetplayProfile?.characters ?? [] as character}
                <div class="character-icon-box">
                    <img
                        style="width: 24px; height: 24px;"
                        src={`./character-icons/${character.icon}`}
                        alt={character.character}
                    />
                    <h5 style={`color: ${textColor}`}>
                        {`${((character.gameCount / player?.totalGames) * 100).toFixed(1)}%`}
                    </h5>
                </div>
            {/each}
        </div>
    {/if}
</div>