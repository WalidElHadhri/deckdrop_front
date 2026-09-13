import type { GameName } from "@/lib/games";

/** Presentation per game: a short monogram and its identity color (tokens in globals.css). */
export const GAME_STYLES: Record<GameName, { monogram: string; className: string }> = {
  YU_GI_OH: { monogram: "YGO", className: "bg-game-yugioh" },
  POKEMON: { monogram: "PKM", className: "bg-game-pokemon" },
  ONE_PIECE: { monogram: "OP", className: "bg-game-one-piece" },
};
