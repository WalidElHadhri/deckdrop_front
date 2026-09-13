import {
  createOnePieceVariant,
  createPokemonVariant,
  createYuGiOhVariant,
  deleteOnePieceVariant,
  deletePokemonVariant,
  deleteYuGiOhVariant,
  getOnePieceVariant,
  getPokemonVariant,
  getYuGiOhVariant,
  listOnePieceVariants,
  listPokemonVariants,
  listYuGiOhVariants,
  updateOnePieceVariant,
  updatePokemonVariant,
  updateYuGiOhVariant,
  type RequestOptions,
} from "@/lib/api";
import { formatEnum } from "@/lib/format";
import type {
  CartItemRequest,
  OnePieceCardVariantRequest,
  OnePieceCardVariantResponse,
  PokemonCardVariantRequest,
  PokemonCardVariantResponse,
  YuGiOhCardVariantRequest,
  YuGiOhCardVariantResponse,
} from "@/types/api";

// Singles keep their set/rarity/condition rows in a separate table per game; these helpers
// hide that branching from the pages that don't care which game a single belongs to.

export type VariantType = NonNullable<CartItemRequest["variantType"]>;
export type CardVariant = YuGiOhCardVariantResponse | PokemonCardVariantResponse | OnePieceCardVariantResponse;
export type CardVariantRequest = YuGiOhCardVariantRequest | PokemonCardVariantRequest | OnePieceCardVariantRequest;

export function listVariants(type: VariantType, productId: number, options?: RequestOptions): Promise<CardVariant[]> {
  switch (type) {
    case "YU_GI_OH":
      return listYuGiOhVariants(productId, options);
    case "POKEMON":
      return listPokemonVariants(productId, options);
    case "ONE_PIECE":
      return listOnePieceVariants(productId, options);
  }
}

export function getVariant(
  type: VariantType,
  productId: number,
  variantId: number,
  options?: RequestOptions,
): Promise<CardVariant> {
  switch (type) {
    case "YU_GI_OH":
      return getYuGiOhVariant(productId, variantId, options);
    case "POKEMON":
      return getPokemonVariant(productId, variantId, options);
    case "ONE_PIECE":
      return getOnePieceVariant(productId, variantId, options);
  }
}

export function createVariant(
  type: VariantType,
  productId: number,
  body: CardVariantRequest,
  options?: RequestOptions,
): Promise<CardVariant> {
  switch (type) {
    case "YU_GI_OH":
      return createYuGiOhVariant(productId, body as YuGiOhCardVariantRequest, options);
    case "POKEMON":
      return createPokemonVariant(productId, body as PokemonCardVariantRequest, options);
    case "ONE_PIECE":
      return createOnePieceVariant(productId, body as OnePieceCardVariantRequest, options);
  }
}

export function updateVariant(
  type: VariantType,
  productId: number,
  variantId: number,
  body: CardVariantRequest,
  options?: RequestOptions,
): Promise<CardVariant> {
  switch (type) {
    case "YU_GI_OH":
      return updateYuGiOhVariant(productId, variantId, body as YuGiOhCardVariantRequest, options);
    case "POKEMON":
      return updatePokemonVariant(productId, variantId, body as PokemonCardVariantRequest, options);
    case "ONE_PIECE":
      return updateOnePieceVariant(productId, variantId, body as OnePieceCardVariantRequest, options);
  }
}

export function deleteVariant(
  type: VariantType,
  productId: number,
  variantId: number,
  options?: RequestOptions,
): Promise<void> {
  switch (type) {
    case "YU_GI_OH":
      return deleteYuGiOhVariant(productId, variantId, options);
    case "POKEMON":
      return deletePokemonVariant(productId, variantId, options);
    case "ONE_PIECE":
      return deleteOnePieceVariant(productId, variantId, options);
  }
}

/** e.g. "SV08-238 · Special illustration rare · Alt art · NM" */
export function describeVariant(variant: CardVariant): string {
  return [
    [variant.setCode, variant.cardNumber].filter(Boolean).join("-"),
    formatEnum(variant.rarity),
    "holoType" in variant ? formatEnum(variant.holoType) : undefined,
    "cardType" in variant ? formatEnum(variant.cardType) : undefined,
    variant.condition,
  ]
    .filter(Boolean)
    .join(" · ");
}
