<script lang="ts" context="module">
	interface Character {
		character: string;
		gameCount: number;
		icon: string;
	}

	interface User {
		connectCode: Code;
		displayName: string;
		rankedNetplayProfile: RankedNetplayProfile;
		totalGames: number;
	}

	interface Code {
		code: string;
	}

	interface RankedNetplayProfile {
		continent: string;
		characters: Character[];
		dailyGlobalPlacement: number;
		dailyRegionalPlacement: number;
		losses: number;
		wins: number;
		ratingOrdinal: number;
	}

	export type { User };
</script>
