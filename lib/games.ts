import { cache } from "react";
import { listGames } from "@/lib/api";
import type { GameResponse } from "@/types/api";

export type GameName = NonNullable<GameResponse["name"]>;

/** A game with the fields the storefront needs to link to it. */
export type StorefrontGame = GameResponse & { id: number; slug: string; displayName: string };

/** Storefront order of the games, used by the primary nav and the quick links. */
const GAME_ORDER: GameName[] = ["YU_GI_OH", "POKEMON", "ONE_PIECE"];

/** Fetches the games from the backend, in storefront order. Memoized per request. */
export const getStorefrontGames = cache(async (): Promise<StorefrontGame[]> => {
  const games = await listGames();
  const rank = (game: GameResponse) => {
    const index = game.name ? GAME_ORDER.indexOf(game.name) : -1;
    return index === -1 ? GAME_ORDER.length : index;
  };
  return games
    .filter((game): game is StorefrontGame => Boolean(game.id != null && game.slug && game.displayName))
    .sort((a, b) => rank(a) - rank(b));
});

export async function getGamesById(): Promise<Map<number, StorefrontGame>> {
  return new Map((await getStorefrontGames()).map((game) => [game.id, game]));
}
