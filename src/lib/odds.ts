import { createDeck } from '$lib/create_deck';
import { createHand, compareHands } from '$lib/poker';
import { type Hand } from '$lib/types/hand';
import { HandResult } from '$lib/constants/hand_result';
import { shuffle } from '$lib/shuffle';

// Get players odds of winning this hand.
export function getOdds(
	ownHand: Hand,
	opponentHand: Hand,
	communityCards: string[],
	combinationAmount: number
): { playerOdds: number; opponentOdds: number } {
	const remainingDeck = generateRemainingDeck(ownHand, opponentHand, communityCards);

	// Determine how many cards are needed to complete the community cards.
	const cardsNeeded = 5 - communityCards.length;

	const shuffledCombinations = shuffle(getAllCombinations(remainingDeck, cardsNeeded)).slice(
		0,
		combinationAmount
	);

	let playerWins = 0;
	let opponentWins = 0;
	let splits = 0;
	let errors = 0;

	// Evaluate each combination of community cards
	for (const combination of shuffledCombinations) {
		const finalCommunityCards = [...communityCards, ...combination];

		if (finalCommunityCards.length !== 5) {
			console.error('Invalid community card count:', finalCommunityCards);
			errors++;
			continue;
		}

		const playerHand = createHand([ownHand.hand[0], ownHand.hand[1]], finalCommunityCards);
		const oppHand = createHand([opponentHand.hand[0], opponentHand.hand[1]], finalCommunityCards);

		switch (compareHands(playerHand, oppHand)) {
			case HandResult.victory:
				playerWins++;
				break;

			case HandResult.loss:
				opponentWins++;
				break;

			case HandResult.split:
				splits++;
				break;

			case HandResult.error:
				console.error('Error in hand comparison:', { playerHand, oppHand, finalCommunityCards });
				errors++;
				break;
		}
	}

	const totalValidCombinations = shuffledCombinations.length - errors || 1; // Prevent division by zero
	const playerWinPercentage = (playerWins / totalValidCombinations) * 100;
	const opponentWinPercentage = (opponentWins / totalValidCombinations) * 100;

	//const tiePercentage = (splits/ totalValidCombinations) * 100;
	//console.log("Tie: ", tiePercentage);

	return {
		playerOdds: playerWinPercentage,
		opponentOdds: opponentWinPercentage
	};
}

// Generate all combinations of 'k' cards from a deck
function getAllCombinations(deck: string[], k: number): string[][] {
	const combinations: string[][] = [];

	const generate = (currentCombo: string[], start: number) => {
		if (currentCombo.length === k) {
			combinations.push([...currentCombo]);
			return;
		}
		for (let i = start; i < deck.length; i++) {
			currentCombo.push(deck[i]);
			generate(currentCombo, i + 1);
			currentCombo.pop();
		}
	};
	generate([], 0);
	return combinations;
}

// Generate remaining deck by removing known cards
function generateRemainingDeck(
	ownHand: Hand,
	opponentHand: Hand,
	communityCards: string[]
): string[] {
	const deck = createDeck();
	const usedCards = new Set([...ownHand.hand, ...opponentHand.hand, ...communityCards]);

	// Remove known cards from the deck
	return deck.filter((card) => !usedCards.has(card));
}
