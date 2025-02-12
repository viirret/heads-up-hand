import * as LZString from 'lz-string';

import { extractRank, extractSuit } from '$lib/util';
import type { GameData } from '$lib/types/game_data';

function compressCard(uncompressedHand: string): string {
	let compressed = extractRank(uncompressedHand);
	const uncompressedSuit = extractSuit(uncompressedHand);
	switch (uncompressedSuit) {
		case 'hearts':
			compressed += 'h';
			break;
		case 'clubs':
			compressed += 'c';
			break;
		case 'spades':
			compressed += 's';
			break;
		case 'diamonds':
			compressed += 'd';
			break;
	}
	return compressed;
}

function compressCards(uncompressedHand: string[]): string {
	let compressed = '';
	for (let i = 0; i < uncompressedHand.length; i++) {
		compressed += compressCard(uncompressedHand[i]);
	}
	return compressed;
}

export function compress(gameData: GameData): string {
	let createdData = '';
	createdData += compressCards(gameData.player1Hand);
	createdData += compressCards(gameData.player2Hand);
	createdData += compressCards(gameData.communityCards);

	if (gameData.role == 'player1') {
		createdData += '1';
	} else if (gameData.role == 'player2') {
		createdData += '0';
	} else {
		console.error('Unrecognized role!');
	}
	const compressedData = LZString.compressToEncodedURIComponent(createdData);
	return compressedData;
}

function decompressCard(card: string): string {
	let decompressedCard = '';
	decompressedCard += card.at(0);
	decompressedCard += '-';
	switch (card.at(1)) {
		case 'h':
			decompressedCard += 'hearts';
			break;
		case 'c':
			decompressedCard += 'clubs';
			break;
		case 's':
			decompressedCard += 'spades';
			break;
		case 'd':
			decompressedCard += 'diamonds';
			break;
	}
	return decompressedCard;
}

function decompressedData(cards: string): GameData | null {
	if (cards.length < 19) return null;

	const decompressPair = (index: number) => decompressCard(cards[index] + cards[index + 1]);

	const player1 = [decompressPair(0), decompressPair(2)];
	const player2 = [decompressPair(4), decompressPair(6)];
	const communityCards = Array.from({ length: 5 }, (_, i) => decompressPair(8 + i * 2));

	const role = cards[18] === '1' ? 'player1' : cards[18] === '0' ? 'player2' : null;

	if (role == null) {
		return null;
	}

	return {
		player1Hand: player1,
		player2Hand: player2,
		communityCards: communityCards,
		role: role
	};
}

export function decompress(data: string): GameData | null {
	if (!data) {
		return null;
	}
	const jsonData = LZString.decompressFromEncodedURIComponent(data);
	if (!jsonData) {
		return null;
	}
	return decompressedData(jsonData);
}
