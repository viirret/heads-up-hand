// Count occurrences of each rank
function countRanks(ranks: string[]): Record<string, number> {
  return ranks.reduce((count, rank) => {
    count[rank] = (count[rank] || 0) + 1;
    return count;
  }, {} as Record<string, number>);
}

// Count occurrences of each suit
function countSuits(suits: string[]): Record<string, number> {
  return suits.reduce((count, suit) => {
    count[suit] = (count[suit] || 0) + 1;
    return count;
  }, {} as Record<string, number>);
}

// Extract suit from a card (e.g., "2-Hearts" -> "Hearts")
function extractSuit(card: string): string {
  return card.split('-')[1];
}

// Extract rank from a card (e.g., "2-Hearts" -> "2")
function extractRank(card: string): string {
  return card.split('-')[0];
}

// Convert card rank to numeric value (e.g., "A" -> 14, "K" -> 13, etc.)
function rankValue(rank: string): number {
  if (rank === 'A') return 14;
  else if (rank === 'K') return 13;
  else if (rank === 'Q') return 12;
  else if (rank === 'J') return 11;
  else if (rank === 'T') return 10;
  else return parseInt(rank, 10);  // For numeric values like '2', '9', etc.
}

// Checking if Royal Flush cards are indeed royal.
function isRoyal(ownHand: string[], commonCards: string[]) : boolean {
  const cards = [...commonCards, ...ownHand];

  const royalRanks = ['10', 'J', 'Q', 'K', 'A'];
  const ranks = cards.map(card => extractRank(card));
  return royalRanks.every(rank => ranks.includes(rank));
}

function isRoyalFlush(ownHand: string[], commonCards: string[]): boolean {
  if (isStraightFlush(ownHand, commonCards)) {
    if (isRoyal(ownHand, commonCards)) {
      return true;
    }
  }
  return false;
}

function isStraightFlush(ownHand: string[], commonCards: string[]): boolean {
  if (isFlush(ownHand, commonCards)) {
    if (isStraight(ownHand, commonCards)) {
      return true;
    }
  }
  return false;
}

function isFourOfAKind(ownHand: string[], commonCards: string[]): boolean {
  const cards = [...commonCards, ...ownHand];

  const ranks = cards.map(card => extractRank(card));
  const rankCount = countRanks(ranks);
  
  return Object.values(rankCount).some(count => count === 4);
}

function isFullHouse(ownHand: string[], commonCards: string[]) : boolean {
  const cards = [...commonCards, ...ownHand];
  const ranks = cards.map(card => extractRank(card));
  const rankCount = countRanks(ranks);

  const hasThreeOfAKind = Object.values(rankCount).includes(3);
  const hasPair = Object.values(rankCount).includes(2);
  
  return hasThreeOfAKind && hasPair;
}

function isFlush(ownHand: string[], commonCards: string[]): boolean {
  const cards = [...commonCards, ...ownHand];
  const suits = cards.map(card => extractSuit(card));
  const suitCount = countSuits(suits);

  // Check if any suit occurs 5 or more times
  return Object.values(suitCount).some(count => count >= 5);
}

function isStraight(ownHand: string[], commonCards: string[]) : boolean {
  const cards = [...commonCards, ...ownHand];

  // Extract the rank part from each card and convert it to numeric values
  const ranks = cards.map(card => rankValue(extractRank(card)));

  // Remove duplicates, sort, and check for consecutive values
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);

  // Check for sequential values
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
      return true;
    }
  }

  // Special case for Ace-low straight (A, 2, 3, 4, 5)
  const lowStraight = [14, 2, 3, 4, 5];  // Ace-low
  return lowStraight.every(rank => uniqueRanks.includes(rank));
}

function isThreeOfAKind(ownHand: string[], commonCards: string[]) : boolean {
  const cards = [...commonCards, ...ownHand];
  const ranks = cards.map(card => extractRank(card));
  const rankCount = countRanks(ranks);
  
  return Object.values(rankCount).some(count => count === 3);
}

function isTwoPair(ownHand: string[], commonCards: string[]): boolean {
  const cards = [...commonCards, ...ownHand];
  const ranks = cards.map(card => extractRank(card));
  const rankCount = countRanks(ranks);

  const pairs = Object.values(rankCount).filter(count => count === 2);
  
  return pairs.length === 2;
}

function isPair(ownHand: string[], commonCards: string[]): boolean {
  const cards = [...commonCards, ...ownHand];
  const ranks = cards.map(card => extractRank(card));
  const rankCount = countRanks(ranks);
  
  return Object.values(rankCount).some(count => count === 2);
}

function combineReadyHand(ownHand: string[], commonCard: string[]): string[] {
  return [ ownHand[0], ownHand[1], commonCard[0], commonCard[1], commonCard[2] ];
}

enum HandType {
  royal_flush = "ROYAL_FLUSH",
  straight_flush = "STRAIGHT_FLUSH",
  four_of_a_kind = "FOUR_OF_A_KIND",
  full_house = "FULL_HOUSE",
  flush = "FLUSH",
  straight = "STRAIGHT",
  three_of_a_kind = "THREE_OF_A_KIND",
  two_pair = "TWO_PAIR",
  pair = "PAIR",
  high_card = "HIGH_CARD"
}

const handOrder = {
  [HandType.royal_flush]: 1,
  [HandType.straight_flush]: 2,
  [HandType.four_of_a_kind]: 3,
  [HandType.full_house]: 4,
  [HandType.flush] : 5,
  [HandType.straight]: 6,
  [HandType.three_of_a_kind]: 7,
  [HandType.two_pair]: 8,
  [HandType.pair]: 9,
  [HandType.high_card]: 10
}

export type Hand = {
  type: HandType,
  strenght: typeof handOrder[HandType] 
  hand: string[]
}

export function createHand(ownHand: string[], commonCards: string[]) : Hand {
  if (isRoyalFlush(ownHand, commonCards)) {
    return {
      type: HandType.royal_flush,
      strenght: handOrder[HandType.royal_flush],
      hand: combineReadyHand(ownHand, commonCards)
    }
  } else if (isStraightFlush(ownHand, commonCards)) {
    return {
      type: HandType.straight_flush,
      strenght: handOrder[HandType.straight_flush],
      hand: combineReadyHand(ownHand, commonCards)
    }
  } else if (isFourOfAKind(ownHand, commonCards)) {
    return {
      type: HandType.four_of_a_kind,
      strenght: handOrder[HandType.four_of_a_kind],
      hand: combineReadyHand(ownHand, commonCards)
    }
  }
  else if (isFullHouse(ownHand, commonCards)){
    return {
      type: HandType.full_house,
      strenght: handOrder[HandType.full_house],
      hand: combineReadyHand(ownHand, commonCards)
    }
  }
  else if (isFlush(ownHand, commonCards)) {
    return {
      type: HandType.flush,
      strenght: handOrder[HandType.flush],
      hand: combineReadyHand(ownHand, commonCards)
    }
  }
  else if (isStraight(ownHand, commonCards)) {
    return {
      type: HandType.straight,
      strenght: handOrder[HandType.straight],
      hand: combineReadyHand(ownHand, commonCards)
    }
  }
  else if (isThreeOfAKind(ownHand, commonCards)) {
    return {
      type: HandType.three_of_a_kind,
      strenght: handOrder[HandType.three_of_a_kind],
      hand: combineReadyHand(ownHand, commonCards)
    }
  }
  else if (isTwoPair(ownHand, commonCards)) {
    return {
      type: HandType.two_pair,
      strenght: handOrder[HandType.two_pair],
      hand: combineReadyHand(ownHand, commonCards)
    }
  }
  else if (isPair(ownHand, commonCards)) {
    return {
      type: HandType.pair,
      strenght: handOrder[HandType.pair],
      hand: combineReadyHand(ownHand, commonCards)
    }
  }
  else {
    return {
      type: HandType.high_card,
      strenght: handOrder[HandType.high_card],
      hand: combineReadyHand(ownHand, commonCards)
    }
  }
}

enum HandResult {
  victory = "VICTORY",
  loss = "LOSS",
  split = "SPLIT",
  error = "ERROR"
}

function getHighestCard(hand: string[]): number {
  const ranks = hand.map(card => rankValue(extractRank(card)));
  return Math.max(...ranks);
}

function compareHighCard(ownCard: number, opponentCard: number): HandResult {
  return ownCard > opponentCard ? HandResult.victory : ownCard < opponentCard ? HandResult.loss : HandResult.split;
}

function compareKickers(ownHand: string[], opponentHand: string[]): HandResult {
  const ownKickers = ownHand.map(card => rankValue(extractRank(card))).sort((a, b) => b - a);
  const opponentKickers = opponentHand.map(card => rankValue(extractRank(card))).sort((a, b) => b - a);
  
  for (let i = 0; i < ownKickers.length; i++) {
    if (ownKickers[i] !== opponentKickers[i]) {
      return ownKickers[i] > opponentKickers[i] ? HandResult.victory : HandResult.loss;
    }
  }
  return HandResult.split;
}

function getFourOfAKind(hand: string[]): number {
  const ranks = hand.map(card => extractRank(card));
  const rankCount = countRanks(ranks);
  for (const rank in rankCount) {
    if (rankCount[rank] === 4) return rankValue(rank);
  }
  return -1;
}

function getThreeOfAKind(hand: string[]): number {
  const ranks = hand.map(card => extractRank(card));
  const rankCount = countRanks(ranks);
  for (const rank in rankCount) {
    if (rankCount[rank] === 3) return rankValue(rank);
  }
  return -1;
}

function getTwoPairs(hand: string[]): number[] {
  const ranks = hand.map(card => extractRank(card));
  const rankCount = countRanks(ranks);
  const pairs = [];
  for (const rank in rankCount) {
    if (rankCount[rank] === 2) pairs.push(rankValue(rank));
  }
  return pairs.sort((a, b) => b - a);
}

function getPair(hand: string[]): number {
  const ranks = hand.map(card => extractRank(card));
  const rankCount = countRanks(ranks);
  for (const rank in rankCount) {
    if (rankCount[rank] === 2) return rankValue(rank);
  }
  return -1;
}

function compareHighCards(ownHand: string[], opponentHand: string[]): HandResult {
  const ownRanks = ownHand.map(card => rankValue(extractRank(card))).sort((a, b) => b - a);
  const opponentRanks = opponentHand.map(card => rankValue(extractRank(card))).sort((a, b) => b - a);
  
  for (let i = 0; i < ownRanks.length; i++) {
    if (ownRanks[i] !== opponentRanks[i]) {
      return ownRanks[i] > opponentRanks[i] ? HandResult.victory : HandResult.loss;
    }
  }
  return HandResult.split;
}

function compareSameStrenght(ownHand: Hand, opponentHand: Hand): HandResult {
  if (ownHand.strenght != opponentHand.strenght) {
    console.error("Expecting same strenght comparison!");
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

export function compareHands(ownHand: Hand, opponentHand: Hand): HandResult {
  if (ownHand.strenght < opponentHand.strenght) {
    return HandResult.victory;
  } else if (ownHand.strenght > opponentHand.strenght) {
    return HandResult.loss;
  } else if (ownHand.strenght == opponentHand.strenght) {
    return compareSameStrenght(ownHand, opponentHand);
  } else {
    return HandResult.error;
  }
}