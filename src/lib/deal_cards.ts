import { shuffle } from '$lib/shuffle';
import { createDeck } from '$lib/create_deck';
import { extractRank, extractSuit } from '$lib/util';

// Deal random cards for certain amount
export function dealRandomAmount(amount: number): string[] {
	let randomDeck = shuffle(createDeck());
	return randomDeck.slice(0, amount);
}

// Deal two cards that are suited.
export function dealSuitedHand(): string[] {
	let cards: string[];
	let suits: string[];

	// Keep dealing until a suited hand is found
	do {
		cards = dealRandomAmount(2);
		suits = cards.map((card) => extractSuit(card));
	} while (suits[0] !== suits[1]);

	return cards;
}

// Deal two cards that are offsuit.
export function dealOffsuitHand(): string[] {
	let cards: string[];
	let suits: string[];

	// Keep dealing until a offsuite hand is found
	do {
		cards = dealRandomAmount(2);
		suits = cards.map((card) => extractSuit(card));
	} while (suits[0] === suits[1]);

	return cards;
}

// Deal two cards that form a pair.
export function dealPairedHand(): string[] {
	let deck = shuffle(createDeck());

	// Extract only the ranks from the deck
	const ranks = deck.map((card) => extractRank(card));

	// Find the first rank that appears twice
	const pairRank = ranks.find((rank, index) => ranks.indexOf(rank) !== index);

	// Find the first two cards in the deck with that rank
	const pair = deck.filter((card) => extractRank(card) === pairRank).slice(0, 2);

	return pair;
}

// Deal a hand that is either pocket pair or strong suited connector.
export function dealStrongHand(): string[] {
	let deck = shuffle(createDeck());

	const strongSuitedConnectors = [
		['T', 'J'],
		['J', 'Q'],
		['Q', 'K'],
		['K', 'A']
	];

	// Find either a pocket pair or a suited hand
	for (let i = 0; i < deck.length - 1; i++) {
		const card1 = deck[i];
		const card2 = deck[i + 1];

		const rank1 = extractRank(card1);
		const rank2 = extractRank(card2);

		const suit1 = extractSuit(card1);
		const suit2 = extractSuit(card2);

		// Check for a pocket pair
		if (rank1 === rank2) {
			return [card1, card2];
		}

		// Check for a suited hand
		if (suit1 === suit2) {
			// Check if the suited hand is one of the strong connectors
			for (let connector of strongSuitedConnectors) {
				if (
					(rank1 === connector[0] && rank2 === connector[1]) ||
					(rank1 === connector[1] && rank2 === connector[0])
				) {
					return [card1, card2]; // Return strong suited connector hand
				}
			}
		}
	}

	// Fallback in case no strong hand is found (which shouldn't happen)
	return deck.slice(0, 2);
}

// Deal a hand that is not pocket pair or suited or any connector.
export function dealWeakHand(): string[] {
	let deck = shuffle(createDeck());

	// Function to check if two ranks are consecutive
	function areRanksConsecutive(rank1: string, rank2: string): boolean {
		const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
		const index1 = rankOrder.indexOf(rank1);
		const index2 = rankOrder.indexOf(rank2);

		// Check if the ranks are consecutive in order
		return Math.abs(index1 - index2) === 1;
	}

	// Loop through the deck to find a weak hand
	for (let i = 0; i < deck.length - 1; i++) {
		const card1 = deck[i];
		const card2 = deck[i + 1];

		const rank1 = extractRank(card1);
		const rank2 = extractRank(card2);

		const suit1 = extractSuit(card1);
		const suit2 = extractSuit(card2);

		// Ensure it's not a pair, not suited, and not a connector
		if (
			rank1 !== rank2 && // Not a pair
			suit1 !== suit2 && // Not suited
			!areRanksConsecutive(rank1, rank2) // Not a connector
		) {
			// Return weak hand
			return [card1, card2];
		}
	}

	// Fallback in case no weak hand is found (shouldn't happen)
	return deck.slice(0, 2);
}
