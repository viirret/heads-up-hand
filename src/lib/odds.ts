import { createDeck } from '$lib/deck';
import { type Hand, createHand, HandType, compareHands, HandResult } from '$lib/poker';
import { shuffle } from '$lib/shuffle';

// Get players odds of winning this hand.
export function getOdds(
	ownHand: Hand,
	opponentHand: Hand,
	communityCards: string[],
	combinationAmount: number
): { playerOdds: number; opponentOdds: number } {
	const remainingDeck = generateRemainingDeck(ownHand, opponentHand, communityCards);

	// Determine how many cards are needed to complete the community cards (either 1 or 2)
	const cardsNeeded = 5 - communityCards.length;

	// Generate all combinations of remaining cards
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

		// Evaluate both hands
		const myFinalHand = [...ownHand.hand, ...finalCommunityCards];
		const opponentFinalHand = [...opponentHand.hand, ...finalCommunityCards];

		const playerHand = createHand(myFinalHand, finalCommunityCards);
		const oppHand = createHand(opponentFinalHand, finalCommunityCards);

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
	const playerWinPercentage = ((playerWins + splits / 2) / totalValidCombinations) * 100;
	const opponentWinPercentage = ((opponentWins + splits / 2) / totalValidCombinations) * 100;

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
