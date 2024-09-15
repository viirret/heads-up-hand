import { extractRank, extractSuit, rankValue } from '$lib/poker';

// Get file path for a specific card.
export function getCardImage(card: string): string {
	const rank = extractRank(card);
	const suit = extractSuit(card);
	const rankStrength = rankValue(rank);

	let cardPath = '/cards/English_pattern_';

	if (rankStrength < 10) {
		cardPath += rank;
	} else if (rankStrength === 10) {
		cardPath += '10';
	} else if (rankStrength === 11) {
		cardPath += 'jack';
	} else if (rankStrength === 12) {
		cardPath += 'queen';
	} else if (rankStrength === 13) {
		cardPath += 'king';
	} else if (rankStrength === 14) {
		cardPath += 'ace';
	} else {
		console.error('Undefined card strenght');
	}

	cardPath += '_of_' + suit + '.svg';
	return cardPath;
}
