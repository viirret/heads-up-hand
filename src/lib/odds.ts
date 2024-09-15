import { createDeck } from '$lib/deck';
import { type Hand, createHand, HandType, compareHands, HandResult } from '$lib/poker';

// Get player odds of winning this hand.
export function getOdds(
	ownHand: Hand,
	opponentHand: Hand,
	communityCards: string[],
	combinationAmount: number
): number {
	const remainingDeck = generateRemainingDeck(ownHand, opponentHand, communityCards);

	// Determine how many cards are needed to complete the community cards (either 1 or 2)
	const cardsNeeded = 5 - communityCards.length;

	// Generate all combinations of remaining cards
	const allCombinations = getAllCombinations(remainingDeck, cardsNeeded);

	// Limit to the first 1000 combinations
	const combinationsToProcess = allCombinations.slice(0, combinationAmount);

	let wins = 0;
	let ties = 0;

	// Evaluate each combination of community cards
	for (const combination of combinationsToProcess) {
		const finalCommunityCards = [...communityCards, ...combination];

		// Evaluate both hands
		const myFinalHand = [...ownHand.hand, ...finalCommunityCards];
		const opponentFinalHand = [...opponentHand.hand, ...finalCommunityCards];

		const playerHand = createHand(myFinalHand, finalCommunityCards);
		const oppHand = createHand(opponentFinalHand, finalCommunityCards);

		const myScore = evaluateHand(playerHand);
		const opponentScore = evaluateHand(oppHand);

		// Compare the two scores
		if (myScore > opponentScore) {
			wins++;
		} else if (myScore === opponentScore) {
			switch (compareHands(playerHand, oppHand)) {
				case HandResult.victory:
					wins++;
					break;
				case HandResult.split:
					ties++;
					break;
				case HandResult.loss:
					break;
			}
		}
	}

	// Calculate the winning percentage
	const totalCombinationsProcessed = combinationsToProcess.length;
	const winPercentage =
		totalCombinationsProcessed > 0 ? (wins / totalCombinationsProcessed) * 100 : 0;
	const tiePercentage =
		totalCombinationsProcessed > 0 ? (ties / totalCombinationsProcessed) * 100 : 0;

	return winPercentage + tiePercentage / 2; // Ties split the percentage
}

// Normalize odds.
export function calculateOdds(
	playerWinPercent: number,
	opponentWinPercent: number
): { playerOdds: number; opponentOdds: number } {
	// Total percentage should be 100% ideally, but if it exceeds 100%, normalize it
	const totalPercent = playerWinPercent + opponentWinPercent;

	// Normalize the percentages
	const normalizedPlayerPercent = (playerWinPercent / totalPercent) * 100;
	const normalizedOpponentPercent = (opponentWinPercent / totalPercent) * 100;

	// Calculate the odds
	const playerOdds = normalizedPlayerPercent;
	const opponentOdds = normalizedOpponentPercent;

	return { playerOdds, opponentOdds };
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
	const usedCards = new Set([
		ownHand.hand[0],
		ownHand.hand[1],
		opponentHand.hand[0],
		opponentHand.hand[1],
		...communityCards
	]);

	// Remove known cards from the deck
	return deck.filter((card) => !usedCards.has(card));
}

// Dirty helper that basically reverses hand order.
function getStrenghtFromHandType(hand: HandType): number {
	switch (hand) {
		case HandType.royal_flush:
			return 9;
		case HandType.straight_flush:
			return 8;
		case HandType.four_of_a_kind:
			return 7;
		case HandType.full_house:
			return 6;
		case HandType.flush:
			return 5;
		case HandType.straight:
			return 4;
		case HandType.three_of_a_kind:
			return 3;
		case HandType.two_pair:
			return 2;
		case HandType.pair:
			return 1;
		case HandType.high_card:
			return 0;
	}
}

// We are basically checking which "type" the hand hit.
function evaluateHand(hand: Hand): number {
	const initialStrenght = getStrenghtFromHandType(hand.type);
	return initialStrenght;
}
