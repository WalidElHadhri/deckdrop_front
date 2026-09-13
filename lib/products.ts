import type { ProductResponse } from "@/types/api";

const NEW_ARRIVAL_DAYS = 30;

export function productHref(gameSlug: string, productSlug: string): string {
  return `/product/${gameSlug}/${productSlug}`;
}

export function isNewArrival(product: ProductResponse): boolean {
  if (!product.createdAt) return false;
  return Date.now() - Date.parse(product.createdAt) < NEW_ARRIVAL_DAYS * 24 * 60 * 60 * 1000;
}
