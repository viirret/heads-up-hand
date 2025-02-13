// Extract suit from a card (e.g., "2-Hearts" -> "Hearts")
export function extractSuit(card: string): string {
	return card.split('-')[1];
}

// Extract rank from a card (e.g., "2-Hearts" -> "2")
export function extractRank(card: string): string {
	return card.split('-')[0];
}

// Convert card rank to numeric value (e.g., "A" -> 14, "K" -> 13, etc.)
export function rankValue(rank: string): number {
	if (rank === 'A') return 14;
	else if (rank === 'K') return 13;
	else if (rank === 'Q') return 12;
	else if (rank === 'J') return 11;
	else if (rank === 'T') return 10;
	else return parseInt(rank, 10); // For numeric values like '2', '9', etc.
}
