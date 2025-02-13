import { type Role } from '$lib/types/role';

export type GameData = {
	player1Hand: string[];
	player2Hand: string[];
	communityCards: string[];
	role: Role;
};
