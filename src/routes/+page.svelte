<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { dealGame } from '$lib/deck';
	import { createHash } from '$lib/hash';
	import type { GameData } from '$lib/gamedata';

	let g: GameData = {
		player1Hand: [],
		player2Hand: [],
		commonCards: [],
		role: 'player1'
	};

	let shareableLink = '';
	let ownLink = '';

	function createLink(gameData: GameData) {
		const gameDataString = JSON.stringify(gameData);
		const hash = createHash(gameDataString);
		localStorage.setItem(`game-${hash}`, gameDataString);
		return `${window.location.origin}/game?hash=${hash}`;
	}

	function startGame() {
		const cardData = dealGame();
		g.player1Hand = cardData.player1Hand;
		g.player2Hand = cardData.player2Hand;
		g.commonCards = cardData.commonCards;

		shareableLink = createLink({
			player1Hand: g.player1Hand,
			player2Hand: g.player2Hand,
			commonCards: g.commonCards,
			role: 'player2'
		});

		ownLink = createLink(g);
	}
	onMount(() => {
		startGame();
	});
</script>

<h1>Player 1 - Deal Your Hand</h1>
{#if g.player1Hand.length && g.player2Hand.length && g.commonCards.length}
	<p>Share this link with Player 2:</p>
	<input readonly value={shareableLink} />
	<p>Check hand</p>
	<button on:click={() => goto(ownLink)}>Go to hand!</button>
{/if}
