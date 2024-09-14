<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameData } from '$lib/gamedata';
	import { compareHands, createHand } from '$lib/poker';

	let g: GameData = {
		player1Hand: [],
		player2Hand: [],
		commonCards: [],
		role: undefined
	};

	let resultString = '';
	let yourHand = '';
	let opponentHand = '';
	let flopCards: string[] = [];
	let turnCard: string = '';
	let riverCard: string = '';

	let showingFlop = false;
	let showingTurn = false;
	let showingRiver = false;

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function revealCards() {
		// Reveal the flop (first 3 cards)
		showingFlop = true;
		flopCards = g.commonCards.slice(0, 3);
		await delay(1000);

		// Reveal the turn (4th card)
		showingTurn = true;
		turnCard = g.commonCards[3];
		await delay(1000);

		// Reveal the river (5th card)
		showingRiver = true;
		riverCard = g.commonCards[4];
		await delay(1000);

		// Compare hands after all cards are revealed
		if (g.role === 'player1') {
			const playerHand = createHand(g.player1Hand, g.commonCards);
			yourHand = playerHand.type.toString();
			const player2Hand = createHand(g.player2Hand, g.commonCards);
			opponentHand = player2Hand.type.toString();
			resultString = compareHands(playerHand, player2Hand).toString();
		} else if (g.role === 'player2') {
			const playerHand = createHand(g.player2Hand, g.commonCards);
			yourHand = playerHand.type.toString();
			const player1Hand = createHand(g.player1Hand, g.commonCards);
			opponentHand = player1Hand.type.toString();
			resultString = compareHands(playerHand, player1Hand).toString();
		}
	}

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const hash = urlParams.get('hash');

		if (hash) {
			const gameDataString = localStorage.getItem(`game-${hash}`);

			if (gameDataString) {
				try {
					const gameData = JSON.parse(gameDataString);
					g.player1Hand = gameData.player1Hand;
					g.player2Hand = gameData.player2Hand;
					g.commonCards = gameData.commonCards;
					g.role = gameData.role;
					revealCards();
				} catch (error) {
					console.error('Error parsing game data:', error);
				}
			} else {
				console.error('Game data not found for hash:', hash);
			}
		} else {
			console.error('Hash not provided in URL');
		}
	});
</script>

{#if g.player1Hand.length && g.player2Hand.length && g.commonCards.length}
	{#if g.role == 'player1'}
		<h2>Your hand: {g.player1Hand.join(', ')}</h2>
		<h2>Your hand type: {yourHand}</h2>
		<h2>Opponents hand: {g.player2Hand.join(', ')}</h2>
		<h2>Your opponent hand type: {opponentHand}</h2>
	{:else if g.role == 'player2'}
		<h2>Your hand: {g.player2Hand.join(', ')}</h2>
		<h2>Your hand type: {yourHand}</h2>
		<h2>Challengers hand: {g.player1Hand.join(', ')}</h2>
		<h2>Your challengers hand type: {opponentHand}</h2>
	{:else}
		<h1>No role!</h1>
	{/if}

	<h2>Common Cards:</h2>
	{#if showingFlop}
		<h3>Flop: {flopCards.join(', ')}</h3>
	{/if}
	{#if showingTurn}
		<h3>Turn: {turnCard}</h3>
	{/if}
	{#if showingRiver}
		<h3>River: {riverCard}</h3>
	{/if}
	<h2>Result: {resultString}</h2>
{/if}
