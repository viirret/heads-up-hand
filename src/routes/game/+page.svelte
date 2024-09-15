<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameData, Role } from '$lib/gamedata';
	import { getCardImage } from '$lib/card_image';
	import { calculateOdds, getOdds } from '$lib/odds';
	import { compareHands, createHand, type Hand, HandResult } from '$lib/poker';

	let g: GameData = {
		player1Hand: [],
		player2Hand: [],
		commonCards: [],
		role: undefined
	};

	// String values of hand "types"
	let playerHandString = '';
	let opponentHandString = '';

	// Victory, loss, split
	let resultString = '';

	// Different community cards
	let flopCards: string[] = [];
	let turnCard: string = '';
	let riverCard: string = '';

	// What cards to show
	let showingFlop = false;
	let showingTurn = false;
	let showingRiver = false;

	// Winning percentages
	let winPercentage = 0;
	let opponentWinPercentage = 0;

	// Player hands
	let playerHand: Hand;
	let opponentHand: Hand;

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function formatPercentage(percentage: number): string {
		return percentage.toFixed(2) + '%';
	}

	function updateWinner(ownHand: Hand, opponentHand: Hand, commonCards: string[]) {
		if (commonCards.length === 5) {
			const res = compareHands(ownHand, opponentHand);
			switch (res) {
				case HandResult.victory:
					resultString = 'Winner!';
					winPercentage = 100;
					break;
				case HandResult.loss:
					resultString = 'Loser!';
					winPercentage = 0;
					break;
				case HandResult.split:
					resultString = 'Split!';
					winPercentage = 50;
					break;
				case HandResult.error:
					console.error('HandResult: error');
					break;
			}
		}
	}

	// Function to update the hand types
	function updateHandTypes(commonCards: string[], role: Role) {
		if (role === 'player1') {
			playerHand = createHand(g.player1Hand, commonCards);
			playerHandString = playerHand.type.toString();
			opponentHand = createHand(g.player2Hand, commonCards);
			opponentHandString = opponentHand.type.toString();
		} else if (role === 'player2') {
			playerHand = createHand(g.player2Hand, commonCards);
			playerHandString = playerHand.type.toString();
			opponentHand = createHand(g.player1Hand, commonCards);
			opponentHandString = opponentHand.type.toString();
		} else {
			console.error('Undefined role!');
		}
		updateWinner(playerHand, opponentHand, commonCards);
	}

	function updateOdds(communityCards: string[], combinations: number) {
		winPercentage = getOdds(playerHand, opponentHand, communityCards, combinations);
		opponentWinPercentage = getOdds(opponentHand, playerHand, communityCards, combinations);

		// Normalize
		let odds = calculateOdds(winPercentage, opponentWinPercentage);
		winPercentage = odds.playerOdds;
		opponentWinPercentage = odds.opponentOdds;
	}

	async function revealCards() {
		// Reveal own cards
		updateHandTypes([], g.role);
		updateOdds([], 10000);

		// Reveal the flop (first 3 cards)
		await delay(1000);
		flopCards = g.commonCards.slice(0, 3);
		updateHandTypes(flopCards, g.role);
		updateOdds(flopCards, 1035);
		showingFlop = true;

		// Reveal the turn (4th card)
		await delay(1000);
		turnCard = g.commonCards[3];
		updateHandTypes(g.commonCards.slice(0, 4), g.role);
		updateOdds(g.commonCards.slice(0, 4), 45);
		showingTurn = true;

		// Reveal the river (5th card)
		await delay(1000);
		riverCard = g.commonCards[4];
		updateHandTypes(g.commonCards.slice(0, 5), g.role);
		showingRiver = true;
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

<div class="center-container">
	{#if g.player1Hand.length && g.player2Hand.length && g.commonCards.length}
		{#if g.role == 'player1'}
			<h2>Opponent</h2>
			<h2>{opponentHandString} {formatPercentage(100 - winPercentage)}</h2>
			<div class="card-row">
				<img src={getCardImage(g.player2Hand[0])} alt={g.player2Hand[0]} />
				<img src={getCardImage(g.player2Hand[1])} alt={g.player2Hand[1]} />
			</div>
		{:else if g.role == 'player2'}
			<h2>Opponent</h2>
			<h2>{opponentHandString} {formatPercentage(100 - winPercentage)}</h2>
			<div class="card-row">
				<img src={getCardImage(g.player1Hand[0])} alt={g.player1Hand[0]} />
				<img src={getCardImage(g.player1Hand[1])} alt={g.player1Hand[1]} />
			</div>
		{:else}
			<h1>No role!</h1>
		{/if}

		<div class="card-row">
			{#if showingFlop}
				<img src={getCardImage(flopCards[0])} alt={flopCards[0]} />
				<img src={getCardImage(flopCards[1])} alt={flopCards[1]} />
				<img src={getCardImage(flopCards[2])} alt={flopCards[2]} />
			{/if}
			{#if showingTurn}
				<img src={getCardImage(turnCard)} alt={turnCard} />
			{/if}
			{#if showingRiver}
				<img src={getCardImage(riverCard)} alt={riverCard} />
			{/if}
		</div>
		{#if g.role == 'player1'}
			<h2>Your hand: {g.player1Hand.join(', ')}</h2>
			<h2>{playerHandString} {formatPercentage(winPercentage)}</h2>

			<div class="card-row">
				<img src={getCardImage(g.player1Hand[0])} alt={g.player1Hand[0]} />
				<img src={getCardImage(g.player1Hand[1])} alt={g.player1Hand[1]} />
			</div>
		{:else if g.role == 'player2'}
			<h2>Your hand: {g.player2Hand.join(', ')}</h2>
			<h2>{playerHandString} {formatPercentage(winPercentage)}</h2>
			<div class="card-row">
				<img src={getCardImage(g.player2Hand[0])} alt={g.player2Hand[0]} />
				<img src={getCardImage(g.player2Hand[1])} alt={g.player2Hand[1]} />
			</div>
		{:else}
			<h1>No role!</h1>
		{/if}

		{#if showingRiver}
			<h2>Result: {resultString}</h2>
		{/if}
	{/if}
</div>

<style>
	/* Full-page container to center all content */
	.center-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	/* Row container for cards */
	.card-row {
		display: flex;
		justify-content: center;
		margin-bottom: 10px;
	}

	img {
		width: 100px;
		height: 150px;
		margin: 10px;
	}
</style>
