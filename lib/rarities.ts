import {
  OnePieceCardVariantRequestRarityValues,
  PokemonCardVariantRequestRarityValues,
  YuGiOhCardVariantRequestRarityValues,
} from "@/lib/api-enums";
import type { GameName } from "@/lib/games";

export const RARITIES: Record<GameName, readonly string[]> = {
  YU_GI_OH: YuGiOhCardVariantRequestRarityValues,
  POKEMON: PokemonCardVariantRequestRarityValues,
  ONE_PIECE: OnePieceCardVariantRequestRarityValues,
};

/** Rarities of every game, without duplicates, for filters spanning all games. */
export const ALL_RARITIES: readonly string[] = [...new Set(Object.values(RARITIES).flat())];
