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

// The "type" of "class" of a hand.
export enum HandType {
	royal_flush = 'Royal flush',
	straight_flush = 'Straight flush',
	four_of_a_kind = 'Four of a kind',
	full_house = 'Full house',
	flush = 'Flush',
	straight = 'Straight',
	three_of_a_kind = 'Three of a kind',
	two_pair = 'Two pair',
	pair = 'One pair',
	high_card = 'High card'
}

// Hand in poker.ts
export type Hand = {
	type: HandType;
	order: (typeof handOrder)[HandType];
	hand: string[];
};

// Result of river hand comparison.
export enum HandResult {
	victory = 'VICTORY',
	loss = 'LOSS',
	split = 'SPLIT',
	error = 'ERROR'
}

const handOrder = {
	[HandType.royal_flush]: 1,
	[HandType.straight_flush]: 2,
	[HandType.four_of_a_kind]: 3,
	[HandType.full_house]: 4,
	[HandType.flush]: 5,
	[HandType.straight]: 6,
	[HandType.three_of_a_kind]: 7,
	[HandType.two_pair]: 8,
	[HandType.pair]: 9,
	[HandType.high_card]: 10
};

// Compare two hands against each other.
export function compareHands(ownHand: Hand, opponentHand: Hand): HandResult {
	// Ensure both hands have a valid order before comparison
	if (ownHand.order === null || opponentHand.order === null) {
		return HandResult.error;
	}

	if (ownHand.order < opponentHand.order) {
		return HandResult.victory;
	} else if (ownHand.order > opponentHand.order) {
		return HandResult.loss;
	}
	return compareSameStrenght(ownHand, opponentHand);
}

// Get hand "type" from hand.
export function createHand(ownHand: string[], communityCards: string[]): Hand {
	if (isRoyalFlush(ownHand, communityCards)) {
		return {
			type: HandType.royal_flush,
			order: handOrder[HandType.royal_flush],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else if (isStraightFlush(ownHand, communityCards)) {
		return {
			type: HandType.straight_flush,
			order: handOrder[HandType.straight_flush],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else if (isFourOfAKind(ownHand, communityCards)) {
		return {
			type: HandType.four_of_a_kind,
			order: handOrder[HandType.four_of_a_kind],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else if (isFullHouse(ownHand, communityCards)) {
		return {
			type: HandType.full_house,
			order: handOrder[HandType.full_house],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else if (isFlush(ownHand, communityCards)) {
		return {
			type: HandType.flush,
			order: handOrder[HandType.flush],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else if (isStraight(ownHand, communityCards)) {
		return {
			type: HandType.straight,
			order: handOrder[HandType.straight],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else if (isThreeOfAKind(ownHand, communityCards)) {
		return {
			type: HandType.three_of_a_kind,
			order: handOrder[HandType.three_of_a_kind],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else if (isTwoPair(ownHand, communityCards)) {
		return {
			type: HandType.two_pair,
			order: handOrder[HandType.two_pair],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else if (isPair(ownHand, communityCards)) {
		return {
			type: HandType.pair,
			order: handOrder[HandType.pair],
			hand: combineReadyHand(ownHand, communityCards)
		};
	} else {
		return {
			type: HandType.high_card,
			order: handOrder[HandType.high_card],
			hand: combineReadyHand(ownHand, communityCards)
		};
	}
}

function combineReadyHand(ownHand: string[], communityCards: string[]): string[] {
	return [...ownHand, ...communityCards];
}

// Count occurrences of each rank
export function countRanks(ranks: string[]): Record<string, number> {
	return ranks.reduce(
		(count, rank) => {
			count[rank] = (count[rank] || 0) + 1;
			return count;
		},
		{} as Record<string, number>
	);
}

// Count occurrences of each suit
export function countSuits(suits: string[]): Record<string, number> {
	return suits.reduce(
		(count, suit) => {
			count[suit] = (count[suit] || 0) + 1;
			return count;
		},
		{} as Record<string, number>
	);
}

// Checking if Royal Flush cards are indeed royal.
function isRoyal(ownHand: string[], communityCards: string[]): boolean {
	const cards = [...communityCards, ...ownHand];

	const royalRanks = ['10', 'J', 'Q', 'K', 'A'];
	const ranks = cards.map((card) => extractRank(card));
	return royalRanks.every((rank) => ranks.includes(rank));
}

// Does the hand form royal flush?
function isRoyalFlush(ownHand: string[], communityCards: string[]): boolean {
	if (isStraightFlush(ownHand, communityCards)) {
		if (isRoyal(ownHand, communityCards)) {
			return true;
		}
	}
	return false;
}

// Does the hand form straight flush?
function isStraightFlush(ownHand: string[], communityCards: string[]): boolean {
	if (isFlush(ownHand, communityCards)) {
		if (isStraight(ownHand, communityCards)) {
			return true;
		}
	}
	return false;
}

// Does the hand form quads?
function isFourOfAKind(ownHand: string[], communityCards: string[]): boolean {
	const cards = [...communityCards, ...ownHand];

	const ranks = cards.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);

	return Object.values(rankCount).some((count) => count === 4);
}

// Does the hand form full house?
function isFullHouse(ownHand: string[], communityCards: string[]): boolean {
	const cards = [...communityCards, ...ownHand];
	const ranks = cards.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);

	const hasThreeOfAKind = Object.values(rankCount).includes(3);
	const hasPair = Object.values(rankCount).includes(2);

	return hasThreeOfAKind && hasPair;
}

// Does the hand form flush?
function isFlush(ownHand: string[], communityCards: string[]): boolean {
	const cards = [...communityCards, ...ownHand];
	const suits = cards.map((card) => extractSuit(card));
	const suitCount = countSuits(suits);

	// Check if any suit occurs 5 or more times
	return Object.values(suitCount).some((count) => count >= 5);
}

// Does the hand form straight?
function isStraight(ownHand: string[], communityCards: string[]): boolean {
	const cards = [...communityCards, ...ownHand];

	// Extract the rank part from each card and convert it to numeric values
	const ranks = cards.map((card) => rankValue(extractRank(card)));

	// Remove duplicates, sort, and check for consecutive values
	const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);

	// Check for sequential values
	for (let i = 0; i <= uniqueRanks.length - 5; i++) {
		if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
			return true;
		}
	}

	// Special case for Ace-low straight (A, 2, 3, 4, 5)
	const lowStraight = [14, 2, 3, 4, 5]; // Ace-low
	return lowStraight.every((rank) => uniqueRanks.includes(rank));
}

// Does the hand form trips?
function isThreeOfAKind(ownHand: string[], communityCards: string[]): boolean {
	const cards = [...communityCards, ...ownHand];
	const ranks = cards.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);

	return Object.values(rankCount).some((count) => count === 3);
}

// Does the hand form two pair?
function isTwoPair(ownHand: string[], communityCards: string[]): boolean {
	const cards = [...communityCards, ...ownHand];
	const ranks = cards.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);

	const pairs = Object.values(rankCount).filter((count) => count === 2);

	return pairs.length === 2;
}

// Does the hand form a pair?
function isPair(ownHand: string[], communityCards: string[]): boolean {
	const cards = [...communityCards, ...ownHand];
	const ranks = cards.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);

	return Object.values(rankCount).some((count) => count === 2);
}

// Get the highest rank value in hand.
function getHighestCard(hand: string[]): number {
	const ranks = hand.map((card) => rankValue(extractRank(card)));
	return Math.max(...ranks);
}

// Compare high cards (with straights).
function compareHighCard(ownCard: number, opponentCard: number): HandResult {
	return ownCard > opponentCard
		? HandResult.victory
		: ownCard < opponentCard
			? HandResult.loss
			: HandResult.split;
}

// Compare hand kickers.
function compareKickers(ownHand: string[], opponentHand: string[]): HandResult {
	const ownKickers = ownHand.map((card) => rankValue(extractRank(card))).sort((a, b) => b - a);
	const opponentKickers = opponentHand
		.map((card) => rankValue(extractRank(card)))
		.sort((a, b) => b - a);

	for (let i = 0; i < ownKickers.length; i++) {
		if (ownKickers[i] !== opponentKickers[i]) {
			return ownKickers[i] > opponentKickers[i] ? HandResult.victory : HandResult.loss;
		}
	}
	return HandResult.split;
}

// Get rank of quads.
function getFourOfAKind(hand: string[]): number {
	const ranks = hand.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);
	for (const rank in rankCount) {
		if (rankCount[rank] === 4) {
			return rankValue(rank);
		}
	}
	return -1;
}

// Get rank of trips.
function getThreeOfAKind(hand: string[]): number {
	const ranks = hand.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);
	for (const rank in rankCount) {
		if (rankCount[rank] === 3) {
			return rankValue(rank);
		}
	}
	return -1;
}

// Get ranks of two pairs.
function getTwoPairs(hand: string[]): number[] {
	const ranks = hand.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);
	const pairs = [];
	for (const rank in rankCount) {
		if (rankCount[rank] === 2) {
			pairs.push(rankValue(rank));
		}
	}
	return pairs.sort((a, b) => b - a);
}

// Get rank of pair.
function getPair(hand: string[]): number {
	const ranks = hand.map((card) => extractRank(card));
	const rankCount = countRanks(ranks);
	for (const rank in rankCount) {
		if (rankCount[rank] === 2) {
			return rankValue(rank);
		}
	}
	return -1;
}

// Compare highest, then the next highest etc. (Compare flushes)
function compareHighCards(ownHand: string[], opponentHand: string[]): HandResult {
	const ownRanks = ownHand.map((card) => rankValue(extractRank(card))).sort((a, b) => b - a);
	const opponentRanks = opponentHand
		.map((card) => rankValue(extractRank(card)))
		.sort((a, b) => b - a);

	for (let i = 0; i < ownRanks.length; i++) {
		if (ownRanks[i] !== opponentRanks[i]) {
			return ownRanks[i] > opponentRanks[i] ? HandResult.victory : HandResult.loss;
		}
	}
	return HandResult.split;
}

// Execute comparison logic between same "type" of hands.
function compareSameStrenght(ownHand: Hand, opponentHand: Hand): HandResult {
	if (ownHand.order != opponentHand.order) {
		console.error('Expecting same strenght comparison!');
		return HandResult.error;
	}

	// Straight flush and straight: compare the highest card in the sequence
	if (ownHand.type === HandType.straight_flush || ownHand.type === HandType.straight) {
		const ownHighest = getHighestCard(ownHand.hand);
		const opponentHighest = getHighestCard(opponentHand.hand);
		return compareHighCard(ownHighest, opponentHighest);

		// Four of a kind: compare the four cards, then the kicker
	} else if (ownHand.type == HandType.four_of_a_kind) {
		const ownFour = getFourOfAKind(ownHand.hand);
		const opponentFour = getFourOfAKind(opponentHand.hand);
		if (ownFour !== opponentFour) {
			return ownFour > opponentFour ? HandResult.victory : HandResult.loss;
		}
		return compareKickers(ownHand.hand, opponentHand.hand);

		// Full house: compare the three-of-a-kind, then the pair
	} else if (ownHand.type === HandType.full_house) {
		const ownThree = getThreeOfAKind(ownHand.hand);
		const opponentThree = getThreeOfAKind(opponentHand.hand);
		if (ownThree !== opponentThree) {
			return ownThree > opponentThree ? HandResult.victory : HandResult.loss;
		}
		const ownPair = getPair(ownHand.hand);
		const opponentPair = getPair(opponentHand.hand);
		return ownPair > opponentPair ? HandResult.victory : HandResult.loss;

		// Flush: compare the highest card, then the next highest, and so on
	} else if (ownHand.type === HandType.flush) {
		return compareHighCards(ownHand.hand, opponentHand.hand);

		// Three of a kind: compare the three cards, then the kickers
	} else if (ownHand.type === HandType.three_of_a_kind) {
		const ownThree = getThreeOfAKind(ownHand.hand);
		const opponentThree = getThreeOfAKind(opponentHand.hand);

		// Compare trips.
		if (ownThree !== opponentThree) {
			return ownThree > opponentThree ? HandResult.victory : HandResult.loss;
		}
		return compareKickers(ownHand.hand, opponentHand.hand);

		// Two pair: compare the highest pair, then the second pair, then the kicker.
	} else if (ownHand.type === HandType.two_pair) {
		const ownPairs = getTwoPairs(ownHand.hand);
		const opponentPairs = getTwoPairs(opponentHand.hand);
		for (let i = 0; i < 2; i++) {
			if (ownPairs[i] !== opponentPairs[i]) {
				return ownPairs[i] > opponentPairs[i] ? HandResult.victory : HandResult.loss;
			}
		}
		return compareKickers(ownHand.hand, opponentHand.hand);

		// Pair: compare the pair, then the kickers
	} else if (ownHand.type === HandType.pair) {
		const ownPair = getPair(ownHand.hand);
		const opponentPair = getPair(opponentHand.hand);
		if (ownPair !== opponentPair) {
			return ownPair > opponentPair ? HandResult.victory : HandResult.loss;
		}
		return compareKickers(ownHand.hand, opponentHand.hand);

		// Compare high card kickers.
	} else {
		return compareKickers(ownHand.hand, opponentHand.hand);
	}
}
