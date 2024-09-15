import { extractSuit, countSuits, extractRank } from '$lib/poker';

// Create a deck of all cards.
export function createDeck(): string[] {
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

	const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

	let deck = [];

	// Create a full deck (52 cards)
	for (let suit of suits) {
		for (let value of values) {
			deck.push(`${value}-${suit}`);
		}
	}
	return deck;
}

// This is like a "ready deck",
// we are only using these cards of the full deck.
export type DeckType = {
	player1Hand: string[];
	player2Hand: string[];
	communityCards: string[];
};

// Deal random cards for certain amount
export function dealRandomAmount(amount: number): string[] {
	let randomDeck = shuffleDeck(createDeck());
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
	let deck = shuffleDeck(createDeck());

	// Extract only the ranks from the deck
	const ranks = deck.map((card) => extractRank(card));

	// Find the first rank that appears twice
	const pairRank = ranks.find((rank, index) => ranks.indexOf(rank) !== index);

	// Find the first two cards in the deck with that rank
	const pair = deck.filter((card) => extractRank(card) === pairRank).slice(0, 2);

	return pair;
}

// Check if player cards, opponent cards or community cards contain duplicates.
export function verifyUniqueness(
	hand1: string[],
	hand2: string[],
	communityCards: string[]
): boolean {
	return (
		hand1.every((card) => !hand2.includes(card)) &&
		hand1.every((card) => !communityCards.includes(card)) &&
		hand2.every((card) => !communityCards.includes(card))
	);
}

// Fisher-Yates shuffle algorithm
function shuffleDeck(deck: string[]): string[] {
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]]; // Swap cards
	}
	return deck;
}
