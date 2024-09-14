export function createHash(item: string): number {
	let hash = 0;

	if (item.length == 0) return hash;

	for (let i = 0; i < item.length; i++) {
		const char = item.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return hash;
}
