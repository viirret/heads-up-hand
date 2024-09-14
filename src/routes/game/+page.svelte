<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameData } from '$lib/gamedata';
	import { compareHands, createHand, getCardImage } from '$lib/poker';

	let g: GameData = {
		player1Hand: [],
		player2Hand: [],
		commonCards: [],
		role: undefined
	};

	// String values of hand "types"
	let yourHand = '';
	let opponentHand = '';

	// Victory, loss, split
	let resultString = '';

	// Different community cards
	let flopCards: string[] = [];
	let turnCard: string = '';
	let riverCard: string = '';

	let showOpponentCards = false;
	let showingFlop = false;
	let showingTurn = false;
	let showingRiver = false;

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Function to update the hand types
	function updateHandTypes(commonCards: string[]) {
		yourHand = createHand(g.player1Hand, commonCards).type.toString();
		opponentHand = createHand(g.player2Hand, commonCards).type.toString();
	}

	async function revealCards() {
		// Reveal own cards
		updateHandTypes([]);

		await delay(1000);
		showOpponentCards = true;

		// Reveal the flop (first 3 cards)
		await delay(1000);
		flopCards = g.commonCards.slice(0, 3);
		updateHandTypes(flopCards);
		showingFlop = true;

		// Reveal the turn (4th card)
		await delay(1000);
		turnCard = g.commonCards[3];
		updateHandTypes(g.commonCards.slice(0, 4));
		showingTurn = true;

		// Reveal the river (5th card)
		await delay(1000);
		riverCard = g.commonCards[4];
		showingRiver = true;

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
	{#if showOpponentCards}
		{#if g.role == 'player1'}
			<h2>Opponents hand: {g.player2Hand.join(', ')}</h2>
			<h2>{opponentHand}</h2>
			<img src={getCardImage(g.player2Hand[0])} alt={g.player2Hand[0]} width="100" height="150" />
			<img src={getCardImage(g.player2Hand[1])} alt={g.player2Hand[1]} width="100" height="150" />
		{:else if g.role == 'player2'}
			<h2>Opponents hand: {g.player1Hand.join(', ')}</h2>
			<h2>{opponentHand}</h2>
			<img src={getCardImage(g.player1Hand[0])} alt={g.player1Hand[0]} width="100" height="150" />
			<img src={getCardImage(g.player1Hand[1])} alt={g.player1Hand[1]} width="100" height="150" />
		{:else}
			<h1>No role!</h1>
		{/if}
	{/if}

	{#if showingFlop}
		<h2>Community cards:</h2>
		<img src={getCardImage(flopCards[0])} alt={flopCards[0]} width="100" height="150" />
		<img src={getCardImage(flopCards[1])} alt={flopCards[1]} width="100" height="150" />
		<img src={getCardImage(flopCards[2])} alt={flopCards[2]} width="100" height="150" />
	{/if}
	{#if showingTurn}
		<img src={getCardImage(turnCard)} alt={turnCard} width="100" height="150" />
	{/if}
	{#if showingRiver}
		<img src={getCardImage(riverCard)} alt={riverCard} width="100" height="150" />
	{/if}
	{#if g.role == 'player1'}
		<h2>Your hand: {g.player1Hand.join(', ')}</h2>
		<h2>{yourHand}</h2>
		<img src={getCardImage(g.player1Hand[0])} alt={g.player1Hand[0]} width="100" height="150" />
		<img src={getCardImage(g.player1Hand[1])} alt={g.player1Hand[1]} width="100" height="150" />
	{:else if g.role == 'player2'}
		<h2>Your hand: {g.player2Hand.join(', ')}</h2>
		<h2>{yourHand}</h2>
		<img src={getCardImage(g.player2Hand[0])} alt={g.player2Hand[0]} width="100" height="150" />
		<img src={getCardImage(g.player2Hand[1])} alt={g.player2Hand[1]} width="100" height="150" />
	{:else}
		<h1>No role!</h1>
	{/if}

	{#if showingRiver}
		<h2>Result: {resultString}</h2>
	{/if}
{/if}
