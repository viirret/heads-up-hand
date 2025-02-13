// Check if player cards, opponent cards or community cards contain duplicates.
export function verifyUniqueness(
	hand1: string[],
	hand2: string[],
	communityCards: string[]
): boolean {
	const allCards = [...hand1, ...hand2, ...communityCards];

	// Set automatically removes duplicates.
	const uniqueCards = new Set(allCards);
	return uniqueCards.size === allCards.length;
}
