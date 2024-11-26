<script lang="ts">
	import * as LZString from 'lz-string';
	import { goto } from '$app/navigation';
	import {
		dealOffsuitHand,
		dealPairedHand,
		dealRandomAmount,
		dealStrongHand,
		dealSuitedHand,
		dealWeakHand,
		verifyUniqueness,
		type DeckType
	} from '$lib/deck';
	import type { GameData } from '$lib/gamedata';

	let g: GameData = {
		player1Hand: [],
		player2Hand: [],
		communityCards: [],
		role: 'player1'
	};

	// Links
	let shareableLink = '';
	let ownLink = '';

	// Input field value.
	enum Choice {
		random = 'Random',
		weak = 'Weak',
		strong = 'Strong',
		suited = 'Suited',
		offsuit = 'Offsuit',
		pair = 'Pair'
	}

	// Input field choices.
	let player1Choice = Choice.random;
	let player2Choice = Choice.random;

	let handsCreated = false;

	// Create link from gamedata.
	function createLink(gameData: GameData) {
		const jsonData = JSON.stringify(gameData);
		const compressedData = LZString.compressToEncodedURIComponent(jsonData);
		let link = `${window.location.origin}`;

		if (window.location.pathname !== '/') {
			link += `${window.location.pathname}`;
		} else {
			link += '/';
		}
		link += `game?data=${compressedData}`;
		return link;
	}

	// Initialize page components.
	function initializeComponents(deck: DeckType) {
		g.player1Hand = deck.player1Hand;
		g.player2Hand = deck.player2Hand;
		g.communityCards = deck.communityCards;

		shareableLink = createLink({
			player1Hand: g.player1Hand,
			player2Hand: g.player2Hand,
			communityCards: g.communityCards,
			role: 'player2'
		});
		ownLink = createLink(g);
	}

	// Create player cards based on choice.
	function dealPlayerCardsFromChoice(choice: Choice): string[] {
		switch (choice) {
			case Choice.random:
				return dealRandomAmount(2);
			case Choice.weak:
				return dealWeakHand();
			case Choice.strong:
				return dealStrongHand();
			case Choice.suited:
				return dealSuitedHand();
			case Choice.offsuit:
				return dealOffsuitHand();
			case Choice.pair:
				return dealPairedHand();
			default:
				return dealRandomAmount(2); // Default case if no match
		}
	}

	// Create hand based on user choices.
	function createHand() {
		const playerHand = dealPlayerCardsFromChoice(player1Choice);
		const opponentHand = dealPlayerCardsFromChoice(player2Choice);
		const communityCards = dealRandomAmount(5);

		if (verifyUniqueness(playerHand, opponentHand, communityCards)) {
			const deck: DeckType = {
				player1Hand: playerHand,
				player2Hand: opponentHand,
				communityCards: communityCards
			};
			initializeComponents(deck);
			handsCreated = true;
			console.log('Created hand!');

			// Re-try if uniqueness fails.
		} else {
			console.log('Uniqueness failure, retrying.');
			createHand();
		}
	}

	// Log the selected player choices when they change
	function logChoice(player: string, choice: Choice) {
		console.log(`${player} selected: ${choice}`);
	}
</script>

<div class="container">
	<!-- Input fields for Player 1 and Player 2 choices -->
	<p>Select Player 1's Hand:</p>
	<select bind:value={player1Choice} on:change={() => logChoice('Player 1', player1Choice)}>
		{#each Object.values(Choice) as choice}
			<option value={choice}>{choice}</option>
		{/each}
	</select>

	<p>Select Player 2's Hand:</p>
	<select bind:value={player2Choice} on:change={() => logChoice('Player 2', player2Choice)}>
		{#each Object.values(Choice) as choice}
			<option value={choice}>{choice}</option>
		{/each}
	</select>

	<br />
	<button on:click={() => createHand()}>Create hand!</button>

	{#if handsCreated}
		{#if g.player1Hand.length && g.player2Hand.length && g.communityCards.length}
			<p>Share this link with Player 2:</p>
			<input readonly value={shareableLink} />
			<button on:click={() => goto(ownLink)}>Go to hand!</button>
		{/if}
	{/if}
</div>

<style>
	p {
		font-family: Arial, sans-serif;
		font-size: 1rem;
		color: #555;
		margin-bottom: 8px;
	}

	select,
	input[readonly] {
		width: 100%;
		padding: 8px;
		margin-bottom: 15px;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 1rem;
	}

	button {
		background-color: #4caf50;
		color: white;
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		font-size: 1rem;
		cursor: pointer;
		margin-top: 10px;
	}

	button:hover {
		background-color: #45a049;
	}

	input[readonly] {
		background-color: #f9f9f9;
		color: #777;
		cursor: not-allowed;
	}

	.container {
		max-width: 400px;
		margin: 0 auto;
		padding: 20px;
		background-color: #f4f4f4;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.container button {
		width: 100%;
	}

	.container select,
	.container input {
		margin-bottom: 20px;
	}
</style>
