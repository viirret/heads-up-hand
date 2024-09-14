function createDeck(): string[]{
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

  const values = [
    '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'
  ];

 let deck = [];
  
  // Create a full deck (52 cards)
  for (let suit of suits) {
    for (let value of values) {
      deck.push(`${value}-${suit}`);
    }
  }
  return deck;
}

// Fisher-Yates shuffle algorithm
function shuffleDeck(deck: string[]): string[]{
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap cards
  }
  return deck;
}

export function dealGame(): { player1Hand: string[], player2Hand: string[], commonCards: string[] }{
  let deck = shuffleDeck(createDeck());

  // Deal two cards for Player 1
  const player1Hand = [deck[0], deck[1]];

  // Deal two cards for Player 2
  const player2Hand = [deck[2], deck[3]];

  // Deal five common cards
  const commonCards = [deck[4], deck[5], deck[6], deck[7], deck[8]];

  return { player1Hand, player2Hand, commonCards };
}