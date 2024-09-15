<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		dealOffsuitHand,
		dealPairedHand,
		dealRandomAmount,
		dealSuitedHand,
		verifyUniqueness,
		type DeckType
	} from '$lib/deck';
	import { createHash } from '$lib/hash';
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
		random = 'RANDOM',
		weak = 'WEAK',
		strong = 'STRONG',
		suited = 'SUITED',
		offsuit = 'OFFSUIT',
		pair = 'PAIR',
		custom = 'CUSTOM'
	}

	// Input field choices.
	let player1Choice = Choice.random;
	let player2Choice = Choice.random;

	// Store the custom input if "Custom" is selected
	let player1CustomInput = '';
	let player2CustomInput = '';

	let handsCreated = false;

	// Create link from gamedata.
	function createLink(gameData: GameData) {
		const gameDataString = JSON.stringify(gameData);
		const hash = createHash(gameDataString);
		localStorage.setItem(`game-${hash}`, gameDataString);
		return `${window.location.origin}/game?hash=${hash}`;
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

	// Create hand based on user choices.
	function createHand() {
		let playerHand: string[] = [];
		let opponentHand: string[] = [];
		switch (player1Choice) {
			case Choice.random:
				playerHand = dealRandomAmount(2);
				break;
			case Choice.weak:
				break;
			case Choice.strong:
				break;
			case Choice.suited:
				playerHand = dealSuitedHand();
				break;
			case Choice.offsuit:
				playerHand = dealOffsuitHand();
			case Choice.pair:
				playerHand = dealPairedHand();
				break;
			case Choice.custom:
				break;
		}

		switch (player2Choice) {
			case Choice.random:
				opponentHand = dealRandomAmount(2);
				break;
			case Choice.weak:
				break;
			case Choice.strong:
				break;
			case Choice.suited:
				opponentHand = dealSuitedHand();
				break;
			case Choice.offsuit:
				opponentHand = dealOffsuitHand();
				break;
			case Choice.pair:
				opponentHand = dealPairedHand();
				break;
			case Choice.custom:
				break;
		}

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
	<p>Select Player 1's Hand Strength:</p>
	<select bind:value={player1Choice} on:change={() => logChoice('Player 1', player1Choice)}>
		{#each Object.values(Choice) as choice}
			<option value={choice}>{choice}</option>
		{/each}
	</select>

	<!-- If Player 1 selects "Custom", show a text input for custom input -->
	{#if player1Choice === Choice.custom}
		<p>Enter custom hand strength for Player 1:</p>
		<input type="text" bind:value={player1CustomInput} placeholder="Enter custom hand strength" />
	{/if}

	<p>Select Player 2's Hand Strength:</p>
	<select bind:value={player2Choice} on:change={() => logChoice('Player 2', player2Choice)}>
		{#each Object.values(Choice) as choice}
			<option value={choice}>{choice}</option>
		{/each}
	</select>

	<!-- If Player 2 selects "Custom", show a text input for custom input -->
	{#if player2Choice === Choice.custom}
		<p>Enter custom hand strength for Player 2:</p>
		<input type="text" bind:value={player2CustomInput} placeholder="Enter custom hand strength" />
	{/if}

	<br />
	<button on:click={() => createHand()}>Create hand!</button>

	{#if handsCreated}
		{#if g.player1Hand.length && g.player2Hand.length && g.communityCards.length}
			<p>Share this link with Player 2:</p>
			<input readonly value={shareableLink} />
			<p>Check hand</p>
			<button on:click={() => goto(ownLink)}>Go to hand!</button>
		{/if}
	{/if}
</div>

<style>
	p {
		font-family: Arial, sans-serif;
		font-size: 1rem;
		color: #333;
		margin-bottom: 8px;
	}

	select,
	input[type='text'],
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

	input[type='text'] {
		border: 1px solid #ddd;
		box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.1);
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
