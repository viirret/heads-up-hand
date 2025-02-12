// Create a deck of all cards.
export function createDeck(): string[] {
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
	const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
	let deck = [];

	// Create a full deck (52 cards).
	for (let suit of suits) {
		for (let value of values) {
			deck.push(`${value}-${suit}`);
		}
	}
	return deck;
}
