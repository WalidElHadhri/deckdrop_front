"use server";

import { refresh } from "next/cache";
import { addCartItem, removeCartItem, updateCartItem } from "@/lib/api";
import { toActionError, type ActionState } from "@/lib/action-state";
import {
  getAvailableStock,
  isCartItemInput,
  isSameLine,
  MAX_LINE_QUANTITY,
  readGuestCart,
  stockMessage,
  writeGuestCart,
  type CartItemInput,
} from "@/lib/cart";
import { getSession } from "@/lib/session";

export async function addToCartAction(item: CartItemInput): Promise<ActionState> {
  if (!isCartItemInput(item)) return { error: "Invalid cart item." };
  const quantity = Math.min(item.quantity, MAX_LINE_QUANTITY);

  try {
    const session = await getSession();
    if (session) {
      await addCartItem({ ...item, quantity }, { token: session.token });
      refresh();
    } else {
      const lines = await readGuestCart();
      const existing = lines.find((line) => isSameLine(line, item));
      const total = Math.min((existing?.quantity ?? 0) + quantity, MAX_LINE_QUANTITY);
      const available = await getAvailableStock(item);
      if (total > available) return { error: stockMessage(available) };
      await writeGuestCart(
        existing
          ? lines.map((line) => (line === existing ? { ...line, quantity: total } : line))
          : [...lines, { ...item, quantity: total }],
      );
    }
  } catch (error) {
    return toActionError(error);
  }
  return { message: "Added to cart" };
}

/** `lineId` is the backend cart item id when signed in, otherwise the guest cart line index. */
export async function updateCartLineAction(lineId: number, quantity: number): Promise<ActionState> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
    return { error: `Quantity must be between 1 and ${MAX_LINE_QUANTITY}.` };
  }
  try {
    const session = await getSession();
    if (session) {
      await updateCartItem(lineId, { quantity }, { token: session.token });
      refresh();
    } else {
      const lines = await readGuestCart();
      const line = lines[lineId];
      if (!line) return { error: "This item is no longer in your cart." };
      const available = await getAvailableStock(line);
      if (quantity > line.quantity && quantity > available) return { error: stockMessage(available) };
      await writeGuestCart(lines.map((existing, index) => (index === lineId ? { ...existing, quantity } : existing)));
    }
  } catch (error) {
    return toActionError(error);
  }
  return {};
}

export async function removeCartLineAction(lineId: number): Promise<ActionState> {
  try {
    const session = await getSession();
    if (session) {
      await removeCartItem(lineId, { token: session.token });
      refresh();
    } else {
      const lines = await readGuestCart();
      await writeGuestCart(lines.filter((_, index) => index !== lineId));
    }
  } catch (error) {
    return toActionError(error);
  }
  return {};
}
