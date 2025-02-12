<script lang="ts">
	import { onMount } from 'svelte';
	import { type GameData } from '$lib/types/game_data';
	import { type Role } from '$lib/types/role';
	import { type Hand } from '$lib/types/hand';
	import { getCardImage } from '$lib/get_card_image';
	import { getOdds } from '$lib/odds';
	import { compareHands, createHand } from '$lib/poker';
	import { decompress } from '$lib/compressor';
	import { HandResult } from '$lib/constants/hand_result';

	let g: GameData = {
		player1Hand: [],
		player2Hand: [],
		communityCards: [],
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
	let showingPreFlop = false;
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

	function updateWinner(ownHand: Hand, opponentHand: Hand, communityCards: string[]) {
		if (communityCards.length === 5) {
			const res = compareHands(ownHand, opponentHand);
			switch (res) {
				case HandResult.victory:
					resultString = 'Winner!';
					winPercentage = 100;
					opponentWinPercentage = 0;
					break;
				case HandResult.loss:
					resultString = 'Loser!';
					winPercentage = 0;
					opponentWinPercentage = 100;
					break;
				case HandResult.split:
					resultString = 'Split!';
					winPercentage = 50;
					opponentWinPercentage = 50;
					break;
				case HandResult.error:
					console.error('HandResult: error');
					break;
			}
		}
	}

	// Function to update the hand types
	function updateHandTypes(communityCards: string[], role: Role) {
		if (role === 'player1') {
			playerHand = createHand(g.player1Hand, communityCards);
			playerHandString = playerHand.type.toString();
			opponentHand = createHand(g.player2Hand, communityCards);
			opponentHandString = opponentHand.type.toString();
		} else if (role === 'player2') {
			playerHand = createHand(g.player2Hand, communityCards);
			playerHandString = playerHand.type.toString();
			opponentHand = createHand(g.player1Hand, communityCards);
			opponentHandString = opponentHand.type.toString();
		} else {
			console.error('Undefined role!');
		}
		updateWinner(playerHand, opponentHand, communityCards);
	}

	function updateOdds(communityCards: string[], combinations: number) {
		const odds = getOdds(playerHand, opponentHand, communityCards, combinations);
		winPercentage = odds.playerOdds;
		opponentWinPercentage = odds.opponentOdds;
	}

	async function revealCards() {
		// Reveal own cards
		updateHandTypes([], g.role);
		updateOdds([], 10000);
		showingPreFlop = true;

		// Reveal the flop (first 3 cards)
		await delay(1000);
		flopCards = g.communityCards.slice(0, 3);
		updateHandTypes(flopCards, g.role);
		updateOdds(flopCards, 990);
		showingFlop = true;

		// Reveal the turn (4th card)
		await delay(1000);
		turnCard = g.communityCards[3];
		updateHandTypes(g.communityCards.slice(0, 4), g.role);
		updateOdds(g.communityCards.slice(0, 4), 44);
		showingTurn = true;

		// Reveal the river (5th card)
		await delay(1000);
		riverCard = g.communityCards[4];
		updateHandTypes(g.communityCards.slice(0, 5), g.role);
		showingRiver = true;
	}

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const compressedData = urlParams.get('data');
		if (compressedData) {
			const decompressedData = decompress(compressedData);
			if (decompressedData) {
				g = decompressedData;
			} else {
				console.error('Compression failed!');
			}
		} else {
			console.error('Invalid url');
		}
		revealCards();
	});
</script>

<div class="center-container">
	{#if g.player1Hand.length && g.player2Hand.length && g.communityCards.length}
		<!-- Opponent Section -->
		<div class="opponent-section">
			{#if g.role == 'player1'}
				<h2>Opponent</h2>
				<h2>{opponentHandString} {formatPercentage(opponentWinPercentage)}</h2>
				<div class="card-row">
					<img src={getCardImage(g.player2Hand[0])} alt={g.player2Hand[0]} />
					<img src={getCardImage(g.player2Hand[1])} alt={g.player2Hand[1]} />
				</div>
			{:else if g.role == 'player2'}
				<h2>Opponent</h2>
				<h2>{opponentHandString} {formatPercentage(opponentWinPercentage)}</h2>
				<div class="card-row">
					<img src={getCardImage(g.player1Hand[0])} alt={g.player1Hand[0]} />
					<img src={getCardImage(g.player1Hand[1])} alt={g.player1Hand[1]} />
				</div>
			{:else}
				<h1>No role!</h1>
			{/if}
		</div>

		<!-- Community Cards Section -->
		<div class="community-section">
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
		</div>

		<!-- Player's Section -->
		<div class="player-section">
			{#if g.role == 'player1'}
				<h2>{g.player1Hand.join(', ')}</h2>
				<h2>{playerHandString} {formatPercentage(winPercentage)}</h2>

				<div class="card-row">
					<img src={getCardImage(g.player1Hand[0])} alt={g.player1Hand[0]} />
					<img src={getCardImage(g.player1Hand[1])} alt={g.player1Hand[1]} />
				</div>
			{:else if g.role == 'player2'}
				<h2>{g.player2Hand.join(', ')}</h2>
				<h2>{playerHandString} {formatPercentage(winPercentage)}</h2>
				<div class="card-row">
					<img src={getCardImage(g.player2Hand[0])} alt={g.player2Hand[0]} />
					<img src={getCardImage(g.player2Hand[1])} alt={g.player2Hand[1]} />
				</div>
			{:else}
				<h1>No role!</h1>
			{/if}
		</div>

		{#if showingRiver}
			<div class="result-section">
				<h2>{resultString}</h2>
			</div>
		{/if}
	{:else}
		<h1>Calculating pre-flop odds.</h1>
	{/if}
</div>

<style>
	/* Full-page container to center all content */
	.center-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		height: 100vh;
		padding: 20px;
		box-sizing: border-box;
	}

	/* General player section styling */
	.player-section {
		width: 100%;
		text-align: center;
		margin-bottom: 20px;
	}

	/* Opponent and your sections distinction */
	.opponent-section {
		border-bottom: 2px solid #ccc;
		padding-bottom: 20px;
	}

	/* Row container for cards */
	.card-row {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 10px;
	}

	/* Community cards styling */
	.community-section {
		width: 100%;
		text-align: center;
	}

	/* Result section */
	.result-section {
		margin-top: 20px;
		font-size: 1.5em;
		font-weight: bold;
		color: #3b3b3b;
	}

	/* Card image styling */
	img {
		width: 100px;
		height: 150px;
		margin: 10px;
	}

	/* Hand strings */
	h2 {
		font-size: 1.5em;
		margin: 5px 0;
		color: #555;
	}

	h1 {
		text-align: center;
		font-size: 1.5em;
		margin: 5px 0;
		color: #555;
	}

	/* Responsive adjustments for smaller screens */
	@media (max-width: 768px) {
		/* Decrease card size on mobile */
		img {
			width: 70px;
			height: 105px;
			margin: 5px;
		}

		/* Make sure sections are well spaced on smaller devices */
		.opponent-section,
		.player-section,
		.community-section {
			padding: 10px;
		}
	}

	/* Further adjustments for very small screens */
	@media (max-width: 480px) {
		.center-container {
			padding: 10px;
			gap: 15px;
		}

		.card-row {
			justify-content: space-around;
		}

		img {
			width: 60px;
			height: 90px;
			margin: 3px;
		}
	}
</style>
