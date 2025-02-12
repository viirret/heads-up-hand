import { HandType } from "$lib/constants/hand_type";
import { HandOrder } from '$lib/constants/hand_order'

export type Hand = {
	type: HandType;
	order: (typeof HandOrder)[HandType];
	hand: string[];
};