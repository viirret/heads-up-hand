type Role = 'player1' | 'player2' | undefined;

export type GameData = {
	player1Hand: string[];
	player2Hand: string[];
	commonCards: string[];
	role: Role;
};
