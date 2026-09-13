import type { CategoryResponse, ProductResponse } from "@/types/api";

export type SearchParams = Record<string, string | string[] | undefined>;
export type ProductType = NonNullable<ProductResponse["productType"]>;
export type Availability = NonNullable<ProductResponse["availability"]>;

export const CATALOG_PAGE_SIZE = 24;

export const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Newest" },
  { value: "name,asc", label: "Name A–Z" },
  { value: "basePrice,asc", label: "Price: low to high" },
  { value: "basePrice,desc", label: "Price: high to low" },
  { value: "releaseDate,asc", label: "Release date" },
];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  SEALED: "Sealed product",
  SINGLE: "Singles",
  ACCESSORY: "Accessories",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  IN_STOCK: "In stock",
  PREORDER: "Pre-order",
  OUT_OF_STOCK: "Out of stock",
};

export function getParam(searchParams: SearchParams, key: string): string | undefined {
  const value = searchParams[key];
  const first = Array.isArray(value) ? value[0] : value;
  return first?.trim() || undefined;
}

export function getNumberParam(searchParams: SearchParams, key: string): number | undefined {
  const value = getParam(searchParams, key);
  const parsed = value === undefined ? NaN : Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** The value if it is one of `allowed`, otherwise undefined. */
export function pickEnum<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((option) => option === value);
}

/** Top-level categories, each followed by its subcategories. */
export function sortCategoryTree(categories: CategoryResponse[]): { category: CategoryResponse; depth: number }[] {
  const byName = (a: CategoryResponse, b: CategoryResponse) => (a.name ?? "").localeCompare(b.name ?? "");
  const ids = new Set(categories.map((category) => category.id));
  const roots = categories.filter((c) => c.parentCategoryId == null || !ids.has(c.parentCategoryId)).sort(byName);
  return roots.flatMap((root) => [
    { category: root, depth: 0 },
    ...categories
      .filter((child) => child.parentCategoryId === root.id)
      .sort(byName)
      .map((child) => ({ category: child, depth: 1 })),
  ]);
}

/** 1-based page number from the URL. */
export function getPage(searchParams: SearchParams): number {
  const page = Number(getParam(searchParams, "page"));
  return Number.isInteger(page) && page > 1 ? page : 1;
}

/** `basePath` with the current query string, applying `changes` (undefined removes a key). */
export function hrefWith(basePath: string, searchParams: SearchParams, changes: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) query.set(key, first);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) query.delete(key);
    else query.set(key, value);
  }
  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
