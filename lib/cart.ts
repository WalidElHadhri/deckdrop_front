import { cookies } from "next/headers";
import { addCartItem, ApiError, getCart, getProduct, getShippingRate } from "@/lib/api";
import { getGamesById } from "@/lib/games";
import { getSession } from "@/lib/session";
import { describeVariant, getVariant, type VariantType } from "@/lib/variants";
import type { AddressRequest, CartLineResponse, CartResponse } from "@/types/api";

// The backend cart belongs to a signed-in user. Visitors get a cookie cart instead, priced against
// the live catalog in the same shape as the backend cart, and merged into it when they sign in.

const GUEST_CART_COOKIE = "dd_cart";
const VARIANT_TYPES: VariantType[] = ["YU_GI_OH", "POKEMON", "ONE_PIECE"];

export const MAX_LINE_QUANTITY = 99;

export type Country = NonNullable<AddressRequest["country"]>;

export interface CartItemInput {
  productId: number;
  variantType?: VariantType;
  variantId?: number;
  quantity: number;
}

/** The visitor's cart, with a shipping estimate when a country is given. */
export async function getCartView(country?: Country): Promise<CartResponse> {
  const session = await getSession();
  if (session) return getCart(country ? { country } : undefined, { token: session.token });
  return priceGuestCart(await readGuestCart(), country);
}

export async function getCartItemCount(): Promise<number> {
  const session = await getSession();
  if (session) return (await getCart(undefined, { token: session.token })).itemCount ?? 0;
  return (await readGuestCart()).reduce((sum, line) => sum + line.quantity, 0);
}

export async function readGuestCart(): Promise<CartItemInput[]> {
  const raw = (await cookies()).get(GUEST_CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItemInput) : [];
  } catch {
    return [];
  }
}

/** Only callable from Server Actions and Route Handlers. */
export async function writeGuestCart(lines: CartItemInput[]): Promise<void> {
  const store = await cookies();
  if (lines.length === 0) {
    store.delete(GUEST_CART_COOKIE);
    return;
  }
  const compact = lines.map(({ productId, variantType, variantId, quantity }) => ({
    productId,
    variantType,
    variantId,
    quantity,
  }));
  store.set(GUEST_CART_COOKIE, JSON.stringify(compact), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** Moves the cookie cart into the user's backend cart. Lines the backend rejects (e.g. sold out) are dropped. */
export async function mergeGuestCart(token: string): Promise<void> {
  const lines = await readGuestCart();
  if (lines.length === 0) return;
  for (const line of lines) {
    try {
      await addCartItem(line, { token });
    } catch (error) {
      console.warn("Dropped a guest cart line while signing in", line, error);
    }
  }
  await writeGuestCart([]);
}

export function isSameLine(a: CartItemInput, b: CartItemInput): boolean {
  return (
    a.productId === b.productId &&
    (a.variantType ?? null) === (b.variantType ?? null) &&
    (a.variantId ?? null) === (b.variantId ?? null)
  );
}

export function isCartItemInput(value: unknown): value is CartItemInput {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItemInput>;
  return (
    Number.isInteger(item.productId) &&
    Number.isInteger(item.quantity) &&
    (item.quantity ?? 0) > 0 &&
    (item.variantType === undefined || VARIANT_TYPES.includes(item.variantType)) &&
    (item.variantId === undefined || Number.isInteger(item.variantId))
  );
}

/** Units that can currently be bought (for pre-orders: the remaining allocation). */
export async function getAvailableStock(item: CartItemInput): Promise<number> {
  if (item.variantType && item.variantId !== undefined) {
    return (await getVariant(item.variantType, item.productId, item.variantId)).stockQuantity ?? 0;
  }
  return (await getProduct(item.productId)).stockQuantity ?? 0;
}

export function stockMessage(available: number): string {
  return available <= 0 ? "This item is out of stock." : `Only ${available} available.`;
}

async function priceGuestCart(lines: CartItemInput[], country: Country | undefined): Promise<CartResponse> {
  const gamesById = await getGamesById();
  const items = await Promise.all(lines.map((line, index) => priceGuestLine(line, index, gamesById)));
  const subtotal = roundMoney(items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0));

  let shippingCost: number | undefined;
  if (country && items.length > 0) {
    const rate = await getShippingRate(country).catch(() => undefined);
    if (rate?.price !== undefined) {
      const free = rate.freeShippingThreshold != null && subtotal >= rate.freeShippingThreshold;
      shippingCost = free ? 0 : rate.price;
    }
  }

  return {
    items,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    shippingCountry: country,
    shippingCost,
    total: roundMoney(subtotal + (shippingCost ?? 0)),
    containsPreorders: items.some((item) => item.preorder),
    checkoutReady: items.length > 0 && items.every((item) => !item.problem),
  };
}

async function priceGuestLine(
  line: CartItemInput,
  index: number,
  gamesById: Awaited<ReturnType<typeof getGamesById>>,
): Promise<CartLineResponse> {
  const base: CartLineResponse = {
    id: index,
    productId: line.productId,
    variantType: line.variantType,
    variantId: line.variantId,
    quantity: line.quantity,
  };
  try {
    const product = await getProduct(line.productId);
    const variant =
      line.variantType && line.variantId !== undefined
        ? await getVariant(line.variantType, line.productId, line.variantId)
        : undefined;
    const unitPrice = variant ? variant.price : product.basePrice;
    const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
    return {
      ...base,
      productName: product.name,
      productSlug: product.slug,
      gameSlug: product.gameId !== undefined ? gamesById.get(product.gameId)?.slug : undefined,
      imageUrl: product.imageUrls?.[0],
      variantDescription: variant ? describeVariant(variant) : undefined,
      unitPrice,
      lineTotal: unitPrice !== undefined ? roundMoney(unitPrice * line.quantity) : undefined,
      preorder: product.preorder,
      releaseDate: product.releaseDate,
      availableStock,
      problem:
        availableStock === undefined || line.quantity <= availableStock
          ? null
          : availableStock <= 0
            ? "Out of stock"
            : `Only ${availableStock} available`,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { ...base, productName: "Unavailable item", problem: "No longer available" };
    }
    throw error;
  }
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
