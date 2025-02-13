import { HandType } from '$lib/constants/hand_type';

export const HandOrder = {
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
