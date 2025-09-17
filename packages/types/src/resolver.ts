/**
 * Resolver interface for address resolution
 */
export interface Resolver {
	resolve: (address: string) => Promise<string | null>
}
